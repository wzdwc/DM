/*
 * Bootstrap-based responsive mashup
 * @owner Enter you name here (xxx)
 */
/*
 *    Fill in host and port for Qlik engine
 */
var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );

var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
//to avoid errors in dev-hub: you can remove this when you have added an app
var app;
require.config( {
	baseUrl: (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources"
} );

require( ["js/qlik","../extensions/DM/rotationCircle","../extensions/DM/rotationCirX"], function ( qlik ,RC,rcX) {

	var control = false;
	qlik.setOnError( function ( error ) {
		$( '#popupText' ).append( error.message + "<br>" );
		if ( !control ) {
			control = true;
			$( '#popup' ).delay( 1000 ).fadeIn( 1000 ).delay( 11000 ).fadeOut( 1000 );
		}
	} );
	//define data
	var resultData = {};
	var inv_percent =0;
	var po_percent = 0;
	var re_percent = 0;
	var successTime = 0;
	var isComplete =true;
	var clickType = 0;
	var isClickPoint =false;
	var isClickRect_Po =false;
	var isClickRect_Receipt =false;
	var index_po =0;
	var index_rc =0;
	var index_inv =0;
	var index_ip_line =0;
	var index_rp_line =0;
	var IP_LINE_INDEX ="ip_line";
	var RP_LINE_INDEX ="rp_line";
	var PO_INDEX ="po_line";
	var RC_INDEX ="rc";
	var INV_INDEX ="inv";
	var selectName ={
		1:{name:'po_number'},
		2:{name:'Document_Number(receipt_no)'},
		3:{name:'INVOICE_NO'}
	};
	var formSelect = {
		'po_number':0,
		'Document_Number(receipt_no)':0,
		'INVOICE_NO':0
	}


	//open apps -- inserted here --
	var app = qlik.openApp('MyProject.qvf', config);


	(function () {
		$(".rc-inv-list .carousel-control").on("click",function(){
			move($(this));
		});

		$(".rc-inv-list-slide-body").on("click","li.rc-invoice",function () {
			var that =$(this);
			clickBill(that);
		});

	}());
	function clickBill(that){
		var $this = that.parent().parent();
		var type =that.attr("datatype");
		var name = selectName[that.attr("datatype")].name;
		var $li = that.parent().find("li");
		var value =that.find(".No").html().split(".")[1];
		var len = $li.length;
		var index = parseInt(that.index())+1;
		var baseIndex=len/2;
		var left =index<baseIndex;
		var moveDistance = len%2==0?(baseIndex -index+0.5)*420:(baseIndex -index)*420;
		moveDistance = left?moveDistance:moveDistance*-1;
		var baseDistance =-1*parseInt(that.parent().css("width"))/2;
		if(type==3) return;
		that.parent().find("li").removeClass("active");
		that.addClass("active");
		move($this,moveDistance,left,baseDistance);
		formSelect[name] =1;
		app.field(name).selectMatch(value, true);
		isClickRect_Po =true;
		if(type==1) isClickRect_Receipt =false;
		if(type==2) isClickRect_Receipt =true;
	}

	//"$this" is  dom
	// "_mDistance" is click bill move distance
	// "left" is move direction
	// "clickBaseDistance" is bill base distance
	function move($this,_mDistance,left,clickBaseDistance) {
		var isLeft =left||$this.hasClass("left");
		var moveEle =$this.parent().find(".rc-inv-list-slide-body");
		var displayW =parseInt($this.parent().find(".rc-inv-list-body").css("width"));
		var distanceCount =-1*parseInt(moveEle.css("width"))-displayW*-1/2;
		var moveDistance=typeof _mDistance=="undefined"?420:_mDistance;
		var currDistance =clickBaseDistance||parseInt(moveEle.css("transform").split(",")[4]);
		if(displayW>parseInt(moveEle.css("width"))) return;
		if(!isLeft){
			if(currDistance==distanceCount){
				return;
			}
		}else{
			if(currDistance==displayW){
				return;
			}
			moveDistance = moveDistance*-1;
		}
		currDistance -=moveDistance;
		currDistance =currDistance>displayW*-1/2?displayW*-1/2:currDistance;
		currDistance =currDistance<distanceCount?distanceCount:currDistance;
		moveEle.css("transform","translateX("+currDistance+"px)");
	}


	//Event
	(function(){
		$(window).resize(function (){
			$("#rc_container").css("height",window.innerHeight);
			$(".rc-lists").css("height",window.innerHeight);
			if(successTime!==0&&successTime%5===0&&!isClickPoint){
				draw();
			}
		}).resize();
		$(".rc-icon-back").on("click",function(){
			if(formSelect['po_number']==1) app.field('po_number').clear();
			if(formSelect['Document_Number(receipt_no)']==1) app.field('Document_Number(receipt_no)').clear();
			if(formSelect['INVOICE_NO']==1) app.field('INVOICE_NO').clear();
			formSelect = {
				'po_number':0,
				'Document_Number(receipt_no)':0,
				'INVOICE_NO':0
			};
			isClickPoint =false;
			isClickRect_Receipt =false;
			isClickRect_Po =false;
			loadingShow();
			$(".rc-inv-list-c,.email").hide();
		});
	}());


	$(".cc").on('success' , function(data){
		successTime ++;
		if(successTime%5===0&&!isClickPoint){
			//invoice receipt po percent
			(function(){
				$("#inv_s").attr('stroke-dasharray', (100*inv_percent) + " "+(100*(1- inv_percent)));
				$("#inv_error").attr('stroke-dasharray', (100*(1- inv_percent)) + " "+(100*inv_percent));
				$("#po_s").attr('stroke-dasharray', (100*po_percent) + " "+(100*(1- po_percent)));
				$("#po_error").attr('stroke-dasharray', (100*(1- po_percent)) + " "+(100*po_percent));
				$("#re_s").attr('stroke-dasharray', (100*re_percent) + " "+(100*(1- re_percent)));
				$("#re_error").attr('stroke-dasharray', (100*(1- re_percent)) + " "+(100*re_percent));
			}());
			draw();
		}
		else{
			if(successTime%5===0&&isClickPoint){
				console.log("resultData:",resultData);
				var company = resultData[INV_INDEX+index_inv].data[0][5].qText;
				if(clickType=="1"){
					console.log("1",resultData[PO_INDEX+index_po]);
					var data = resultData[PO_INDEX+index_po].data[0];
					$(".rc-PointMsg .pointMsg-No").html("NO."+data[0].qText);
					if(data[1].qText==="1"){
						$(".rc-PointMsg .rc-invoice").addClass("error");
						var html='';
						html+='<polygon points="0,0 10,0 8,20 2,20 "';
						html+='style="fill:Red;stroke-width:1"/>';
						html+='<rect height="6" width="6" x="2" y="22" style="fill: Red" />';
						$(".error-tip").html(html);
					}
					$(".rc-PointMsg .pointMsg-date").html("");
					$(".rc-PointMsg .company").html(company);
					$(".rc-PointMsg .f-title").html("VENDOR_NUMBER");
					$(".rc-PointMsg .sec-title").html("AMOUNT");
					$(".rc-PointMsg .thir-title").html("CURRENCY");
					$(".rc-PointMsg .f-val").html(data[2].qText);
					$(".rc-PointMsg .sec-val").html(parseInt(data[4].qText)>0?data[4].qText:-1*parseInt(data[4].qText));
					$(".rc-PointMsg .thir-val").html(data[3].qText);
					$(".rc-PointMsg .count").html(parseInt(data[4].qText)>0?data[4].qText:-1*parseInt(data[4].qText));
				}
				if(clickType=="2"){
					console.log("2",resultData[RC_INDEX+index_rc]);
					var data = resultData[RC_INDEX+index_rc].data[0];
					$(".rc-PointMsg .pointMsg-No").html("NO."+data[0].qText);
					if(data[1].qText==="1"){
						$(".rc-PointMsg .rc-invoice").addClass("error");
						var html='';
						html+='<polygon points="0,0 10,0 8,20 2,20 "';
						html+='style="fill:Red;stroke-width:1"/>';
						html+='<rect height="6" width="6" x="2" y="22" style="fill: Red" />';
						$(".error-tip").html(html);
					}
					$(".rc-PointMsg .pointMsg-date").html(data[3].qText);
					$(".rc-PointMsg .company").html(company);
					$(".rc-PointMsg .f-title").html("PO_Number");
					$(".rc-PointMsg .sec-title").html("Inventory_Item_Number");
					$(".rc-PointMsg .thir-title").html("Transaction_Currency_Code");
					$(".rc-PointMsg .f-val").html(data[5].qText);
					$(".rc-PointMsg .sec-val").html(data[2].qText);
					$(".rc-PointMsg .thir-val").html(data[3].qText);
					$(".rc-PointMsg .count").html(parseInt(data[4].qText)>0?data[4].qText:-1*parseInt(data[4].qText));
				}
				if(clickType=="3"){
					console.log("3",resultData[INV_INDEX+index_inv]);
					var data = resultData[INV_INDEX+index_inv].data[0];
					if(data[1].qText==="1"){
						$(".rc-PointMsg .rc-invoice").addClass("error");
						var html='';
						html+='<polygon points="0,0 10,0 8,20 2,20 "';
						html+='style="fill:Red;stroke-width:1"/>';
						html+='<rect height="6" width="6" x="2" y="22" style="fill: Red" />';
						$(".error-tip").html(html);
					}
                    $(".rc-PointMsg .pointMsg-No").html("NO."+data[0].qText);
                    $(".rc-PointMsg .date").html(data[3].qText);
					$(".rc-PointMsg .company").html(data[4].qText);
					$(".rc-PointMsg .f-title").html("TOTAL_AMOUNT");
					$(".rc-PointMsg .sec-title").html("VAT_AMOUNT");
					$(".rc-PointMsg .thir-title").html("CURRENCY");
					$(".rc-PointMsg .f-val").html(data[6].qText);
					$(".rc-PointMsg .sec-val").html(data[8].qText);
					$(".rc-PointMsg .thir-val").html(data[7].qText);
					$(".rc-PointMsg .count").html(data[4].qText);
				}
				if(clickType=="line"){
					$(".rc-container").css("position","fixed");
					$(".rc-lists").css("position","relative");
					var poData= resultData[PO_INDEX+index_po].data;
					var rpData= resultData[RC_INDEX+index_rc].data;
					var invData= resultData[INV_INDEX+index_inv].data;
					if(!isClickRect_Po) getHtml(poData,1);
					if(!isClickRect_Receipt) getHtml(rpData,2);
					getHtml(invData,3);
					$(".rc-lists,.email").show();
				}else{
					$(".rc-PointMsg").show();
				}
			}
		}
	});

	function getHtml(dataArray,type){
		var typeValue = {1:"po",2:"receipt",3:"invoice"};
		var html = "";

		$.each(dataArray,function(index,item){
			var data = item;
			var count =parseInt(data[4].qText)>0?data[4].qText:-1*parseInt(data[4].qText);
			// var active = index==dataArray.length/2?" active ":"";
			html+=data[1].qText==="1"?'<li class="rc-invoice error" datatype='+type+'>':'<li class="rc-invoice " datatype='+type+'>';
			html+='<div class="rc-inv-box">';
			if(type=="1") {
				var amount =parseInt(data[4].qText)>0?data[4].qText:-1*parseInt(data[4].qText);
				html+='<h3 class="company">'+data[5].qText+'</h3>';
				html+='<h4><span class="No">NO.'+data[0].qText+'</span><span class="date"></span></h4>';
				html+='<div class="inv-msg">';
				html += '<p><span>VENDOR_NUMBER</span><span>AMOUNT</span><span>CURRENCY</span> </p>';
				html += '<p><span>'+data[2].qText+'</span><span>'+amount+'</span><span>'+data[3].qText+'</span> </p>';
			}
			if(type=="2") {
				html+='<h4><span class="No">NO.'+data[0].qText+'</span><span class="date"></span></h4>';
				html+='<div class="inv-msg">';
				html += '<p><span>PO_Number</span><span>Inventory_Number</span><span>Transaction_Currency</span> </p>';
				html += '<p><span>'+data[5].qText+'</span><span>'+data[2].qText+'</span><span>'+data[3].qText+'</span></p>';
			}
			if(type=="3") {
				html+='<h3 class="company">'+data[5].qText+'</h3>';
				html+='<h4><span class="No">NO.'+data[0].qText+'</span><span class="date">'+data[3].qText+'</span></h4>';
				html+='<div class="inv-msg">';
				html += '<p><span>TOTAL_AMOUNT</span><span>GROSS_AMOUNT</span><span>CURRENCY</span> </p>';
				html += '<p><span>'+data[6].qText+'</span><span>'+data[4].qText +'</span><span>'+data[7].qText+'</span> </p>';
			}
			html+='</div>';
			html+='<h2 class="count ">'+count+'</h2>';
			if(type=="1"){
				//	html+='<p class="real"> '+data[5].qText+'</p>';
			}
			html+='<div class="icon">';
			html+='<svg width="40" height="60">';
			if(data[1].qText==="1"){
				$(".rc-PointMsg .rc-invoice").addClass("error");
				html+='<polygon points="0,0 10,0 8,20 2,20 "';
				html+='style="fill:Red;stroke-width:1"/>';
				html+='<rect height="6" width="6" x="2" y="22" style="fill: Red" />';
			}else{
				html+='<polyline points="5,10 10,20 30,0" stroke-linecap="butt"';
				html+='style="fill:none;stroke:#64cad0;stroke-width:5"/>';
			}
			html+='</svg>';
			html+='</div>';
			html+='</div>';
			html+='</li>';
		});
		$('.rc-inv-fix-box .'+typeValue[type]+' .rc-inv-list-slide-body').css({
			width:(dataArray.length)*420,
			transform:'translateX('+-(dataArray.length)*420/2+'px)'
		});
		$('.rc-inv-fix-box .'+typeValue[type]+' .rc-inv-list-slide-body').html(html);
		if(type=="1"){
			var index = parseInt(dataArray.length/2);
			var that =$('.po .rc-inv-list-slide-body li:nth-child('+index+')');
			clickBill(that);
		}

	}
	function draw(){
		loadingShow();
		if(resultData[INV_INDEX+index_inv].data.length<=50&&resultData[RC_INDEX+index_rc].data.length<=50&&resultData[PO_INDEX+index_po].data.length<=50) {
			if(isComplete){							//prev animation is completed
				isComplete = false;
				// clearInterval(intval);
				console.log("clear interval");
				console.time("happy");
				console.log("resultData:",resultData);
				RC.clear();
				RC.RotateCircle({
					dataCirl:resultData[INV_INDEX+index_inv],
					dataRect:resultData[RC_INDEX+index_rc],
					dataPlg:resultData[PO_INDEX+index_po],
					dataLine_IP:resultData[IP_LINE_INDEX+index_ip_line],
					dataLine_RP:resultData[RP_LINE_INDEX+index_rp_line],
					ele_id:"rc_canvas",
					complete:function(){
						loadingHide();
						isComplete =true;
						console.log("draw circle complete");
						console.timeEnd("happy");
					},
					clickPoint:function(shape){
						if(shape.name()!=="mouseArea"&&shape.className!="Line"&&shape.name()!=="text"){
							console.log(shape);
							isClickPoint = true;
							clickType = shape.name().split(":")[0];
							var value = shape.name().split(":")[1];
							var name =selectName[clickType].name;
                            console.log("clickType",clickType);
							console.log("name:",name,"value",value);
							formSelect[name]=1;
							app.field(name).selectMatch(value, true);
						}
						if(shape.className==="Line"){
							isClickPoint = true;
							clickType ="line";
							var name = shape.name().split(":")[0];
							var value = shape.name().split(":")[1];
							formSelect[name]=1;
							app.field(name).selectMatch(value, true);
						}
					}
				});
			}
			console.log("comin interval");
			isClickPoint =false;
		}else{
			var selectMsg ={
				inv_error:{name:'invoice（发票信息）.error_flag',value:'1'},
				inv_real:{name:'invoice（发票信息）.error_flag',value:'0'},
				rc_error:{name:'receipt(receipt信息表).error_flag',value:'1'},
				rc_real:{name:'receipt(receipt信息表).error_flag',value:'0'},
				po_error:{name:'po(订单信息).error_flag',value:'1'},
				po_real:{name:'po(订单信息).error_flag',value:'0'}
			};
			rcX.RotateCircle({
				data:[po_percent,re_percent,inv_percent],
				ele_id:"rc_canvas",
				complete:function(){
					loadingHide();
				},
				clickPoint:function(shape){
					console.log("name:",selectMsg[shape.name()].name,"value",selectMsg[shape.name()].value);
					app.field(selectMsg[shape.name()].name).selectMatch(selectMsg[shape.name()].value, true);
				}
			});

		}
	}

	//loading
	function loadingShow(){
		$("#rc_canvas").hide();
		$("#rc_loading").show();
	}
	function loadingHide(){
		$("#rc_canvas").show();
		$("#rc_loading").hide();
	}


	//callbacks -- inserted here --
	function po_rece_line(reply, app){
		index_rp_line++;
		console.log("p_r_l",reply);
		resultData[RP_LINE_INDEX+index_rp_line]={data:[],name:""};
		resultData[RP_LINE_INDEX+index_rp_line].data =reply.qHyperCube.qDataPages["0"].qMatrix;
		resultData[RP_LINE_INDEX+index_rp_line].name =reply.qHyperCube.qDimensionInfo[0].qFallbackTitle;
		$(".cc").trigger('success');

	}

	function inv_pp_line(reply, app){
		index_ip_line++;
		console.log("inv_p_line",reply);
		resultData[IP_LINE_INDEX+index_ip_line]={data:[],name:""};
		resultData[IP_LINE_INDEX+index_ip_line].data=reply.qHyperCube.qDataPages["0"].qMatrix;
		resultData[IP_LINE_INDEX+index_ip_line].name=reply.qHyperCube.qDimensionInfo[0].qFallbackTitle;
		$(".cc").trigger('success');
	}

	function po_Msg(reply, app){
		index_po++;
		console.log("po:",reply);
		resultData[PO_INDEX+index_po] = {data:[],type:1};
		resultData[PO_INDEX+index_po].data =reply.qHyperCube.qDataPages["0"].qMatrix;
		var ErrorCount =0;
		$.each(reply.qHyperCube.qDataPages["0"].qMatrix,function(index,value){
			if(this[1].qText==="1") ErrorCount++;
		});
		po_percent =(1- ErrorCount/reply.qHyperCube.qDataPages["0"].qMatrix.length).toFixed(2);
		$(".cc").trigger('success');

	}

	function receipt_Msg(reply, app){
		index_rc++;
		console.log("reciept",reply);
		resultData[RC_INDEX+index_rc] = {data:[],type:2};
		resultData[RC_INDEX+index_rc].data =reply.qHyperCube.qDataPages["0"].qMatrix;
		var ErrorCount =0;
		$.each(reply.qHyperCube.qDataPages["0"].qMatrix,function(index,value){
			if(this[1].qText==="1") ErrorCount++;
		});
		re_percent =(1- ErrorCount/reply.qHyperCube.qDataPages["0"].qMatrix.length).toFixed(2);
		console.log(re_percent,"cc:",(ErrorCount/reply.qHyperCube.qDataPages["0"].qMatrix.length).toFixed(2));
		$(".cc").trigger('success');

	}

	function invoice_Msg(reply, app){
		index_inv++;
		console.log("invoice",reply);
		var ValueArray = [];
		var data =reply.qHyperCube.qDataPages["0"].qMatrix;
		resultData[INV_INDEX+index_inv] = {data:[],type:3};
		resultData[INV_INDEX+index_inv].data =data;
		//data
		var ErrorCount =0;
		$.each(data,function(index,value){
			if(!this[0].qIsEmpty&&index>70&&index<95){
				ValueArray.push({qText:this[0].qText});
			}
			if(this[1].qText==="1") ErrorCount++;
		});
		inv_percent =(1- ErrorCount/data.length).toFixed(2);
		$(".cc").trigger('success');

	}

	//get objects -- inserted here --
	app.getObject('QV01','bmJrPXg');

	//create cubes and lists -- inserted here --
	app.createCube({
		"qInitialDataFetch": [
			{
				"qHeight": 400,
				"qWidth": 9
			}
		],
		"qDimensions": [
            {
                "qDef": {
                    "qFieldDefs": [
                        "INVOICE_NO"
                    ]
                },
                "qNullSuppression": false,
                "qOtherTotalSpec": {
                    "qOtherMode": "OTHER_OFF",
                    "qSuppressOther": false,
                    "qOtherSortMode": "OTHER_SORT_DESCENDING",
                    "qOtherCounted": {
                        "qv": "5"
                    },
                    "qOtherLimitMode": "OTHER_GE_LIMIT"
                }
            },
			{
				"qDef": {
					"qFieldDefs": [
						"invoice（发票信息）.error_flag"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
            {
                "qDef": {
                    "qFieldDefs": [
                        "R_OBJECT_ID-r_object_id"
                    ]
                },
                "qNullSuppression": false,
                "qOtherTotalSpec": {
                    "qOtherMode": "OTHER_OFF",
                    "qSuppressOther": false,
                    "qOtherSortMode": "OTHER_SORT_DESCENDING",
                    "qOtherCounted": {
                        "qv": "5"
                    },
                    "qOtherLimitMode": "OTHER_GE_LIMIT"
                }
            },
			{
				"qDef": {
					"qFieldDefs": [
						"INVOICE_DATE.autoCalendar.Date"
					],
					"qSortCriterias": [
						{
							"qSortByState": 1,
							"qSortByFrequency": 0,
							"qSortByNumeric": 0,
							"qSortByAscii": 1,
							"qSortByLoadOrder": 1,
							"qSortByExpression": 0,
							"qExpression": {
								"qv": ""
							}
						}
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"GROSS_AMOUNT"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"VENDOR_NAME"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"TOTAL_AMOUNT"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"CURRENCY"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"VAT_AMOUNT"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			}

		],
		"qMeasures": [],
		"qSuppressZero": false,
		"qSuppressMissing": false,
		"qMode": "S",
		"qInterColumnSortOrder": [3,0,1,2],
		"qSortbyYValue":1,
		"qStateName": "$"
	},invoice_Msg);
	app.createCube({
		"qInitialDataFetch": [
			{
				"qHeight": 400,
				"qWidth": 7
			}
		],
		"qDimensions": [
			{
				"qDef": {
					"qFieldDefs": [
						"Document_Number(receipt_no)"
					]
				},
				"qNullSuppression": true,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": true,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"receipt(receipt信息表).error_flag"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"Inventory_Item_Number"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"Transaction_Currency_Code"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"Journal_Transaction_Amount"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"PO_Number"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"PP_Line_Id-pp_line_id"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			}
		],
		"qMeasures": [],
		"qSuppressZero": false,
		"qSuppressMissing": false,
		"qMode": "S",
		"qInterColumnSortOrder": [],
		"qStateName": "$"
	},receipt_Msg);
	app.createCube({
		"qInitialDataFetch": [
			{
				"qHeight": 400,
				"qWidth": 6
			}
		],
		"qDimensions": [
			{
				"qDef": {
					"qFieldDefs": [
						"po_number"
					]
				},
				"qNullSuppression": true,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": true,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"po(订单信息).error_flag"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"vendor_number"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"currency"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"amount"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"Vendor_Name"
					]
				},
				"qNullSuppression": false,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": false,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			}
		],
		"qMeasures": [],
		"qSuppressZero": false,
		"qSuppressMissing": false,
		"qMode": "S",
		"qInterColumnSortOrder": [],
		"qStateName": "$"
	},po_Msg);
	app.createCube({
		"qInitialDataFetch": [
			{
				"qHeight": 400,
				"qWidth": 2
			}
		],
		"qDimensions": [
			{
				"qDef": {
					"qFieldDefs": [
						"INVOICE_NO"
					]
				},
				"qNullSuppression": true,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": true,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"Document_Number(receipt_no)"
					]
				},
				"qNullSuppression": true,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": true,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			}
		],
		"qMeasures": [],
		"qSuppressZero": true,
		"qSuppressMissing": true,
		"qMode": "S",
		"qInterColumnSortOrder": [],
		"qStateName": "$"
	},inv_pp_line);
	app.createCube({
		"qInitialDataFetch": [
			{
				"qHeight": 400,
				"qWidth": 2
			}
		],
		"qDimensions": [
			{
				"qDef": {
					"qFieldDefs": [
						"po_number"
					]
				},
				"qNullSuppression": true,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": true,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			},
			{
				"qDef": {
					"qFieldDefs": [
						"Document_Number(receipt_no)"
					]
				},
				"qNullSuppression": true,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": true,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			}
		],
		"qMeasures": [],
		"qSuppressZero": false,
		"qSuppressMissing": false,
		"qMode": "S",
		"qInterColumnSortOrder": [],
		"qStateName": "$"
	},po_rece_line);
});