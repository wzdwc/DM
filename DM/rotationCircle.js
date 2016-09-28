/**
 * Created by �� on 2016/8/15.
 */
define(['./konva',"./requestAnimationFrame"],function(Konva){

    ///RotateCircle Namespace
    var RC ={
            // public
            version: '1.0.2',
            // private
            layer:{},
            stage:{},
            group:{},
            circle:{},
            anim:function(){},
            _anim:{},
            stop:false,
            angleReturn:0,
            angularSpeed :1000,
            scaleGroup:2.5,
            rotaAngle :0,
            zoom :false,
            angleAdd:5,
            anim_rotate:false,
            complete:function(){
            },
            clickPoint:function(){
            },
            // RotateCircle void ()
            RotateCircle:function(conf){
                    this.winW =conf.winW||window.innerWidth,
                    this.winH =conf.winH||window.innerHeight,
                    this.ele_id=conf.ele_id||"",
                    //data
                    this.dataFull=[],
                    this.dataCirl=conf.dataCirl||{},
                    this.dataRect=conf.dataRect||{},
                    this.dataPlg=conf.dataPlg||{};
                    this.dataLine_IP = conf.dataLine_IP||[];
                    this.dataLine_RP = conf.dataLine_RP||[];
                    if (typeof conf.complete==="function") this.complete = conf.complete;
                    if (typeof conf.clickPoint==="function") this.clickPoint = conf.clickPoint;
                    this.init();
            }

        };


    // ҵ���߼�   private
    (function(){
        //var layer,stage,group,circle,anim,anim2,stop=false,angleReturn= 0,angularSpeed = 600,scaleGroup= 2,dblclick=false,rotaAngle = 0,anim_rotate=false;

        RC.reStart=function(){
                this.group.scale({x:1/ this.scaleGroup,y:1/ this.scaleGroup});
                this.group.x(this.winW/2);
                this.group.y(this.winH/2);
                this.circle.scale({x:1/ this.scaleGroup,y:1/ this.scaleGroup});
                this.circle.x(this.winW/2);
                this.circle.y(this.winH/2);
                this.layer.draw();
                this.stop = false;
                //�����¼�
                this.circle.off('mousedown touchstart');
                this.stage.off('contentMousedown  contentTouchstart');
                this.stage.off('contentMousemove contentTouchmove');
                this.stage.off('contentMouseup contentTouchend');
                //this.stage.off('click');
                if(this._anim.stop) this._anim.stop();
                bind();
                animate();
        };


        function Coordinates(temp, index,len) {
            var startX = 0, startY = 0, r = 300*RC.scaleGroup,angle;
            angle = index==0?RC.angleAdd:110 / (len-1) * index+RC.angleAdd;     // һ��Բ�����λ�������5��
            if(len==1){
                angle =55+RC.angleAdd;
            }
            var k = Math.sin(2 * Math.PI / 360 * angle) * r;
            var j = Math.cos(2 * Math.PI / 360 * angle) * r;
            temp.nextX = startX + k;
            temp.nextY = startY - j;
            temp.angle = angle;
            return temp;
        }
        function getCoordinates(pointArray,type) {
            var data = pointArray.data?pointArray.data:null;
            RC.angleAdd = (type-1)*120+5;                              //��һ�λ���ʼ�Ķ���
            for (var i = 0; i < data.length; i++) {
                var temp ={
                    type:pointArray.type,
                    infoArr:data[i]
                };
                RC.dataFull.push(Coordinates(temp, i, data.length));
            }

        }

        function drawPoint(pointObj,isLast) {
            var temp = pointObj.infoArr;
            var type = pointObj.type;
            var wedge = new Konva.Group({
                rotation: 2 * Math.PI / 360 * (-90+pointObj.angle),
                x: pointObj.nextX,
                y: pointObj.nextY
            });
            var box;
            if (type == 1) {
                box = new Konva.RegularPolygon({
                    sides: 3,
                    radius: 5*RC.scaleGroup,
                    fill:temp[1].qText=="1"?'#f83f71':'#5974bb',
                    rotation: Math.PI/6,
                    name:type+":"+temp[0].qText
                });
            }
            if (type == 2) {
                box = new Konva.Rect({
                    width: 7*RC.scaleGroup,
                    height: 7*RC.scaleGroup,
                    fill: temp[1].qText=="1"?'#f83f71':'#5974bb',
                    rotation:Math.PI/2,
                    name:type+":"+temp[0].qText,
                    y:-2.5*RC.scaleGroup
                });
            }
            if (type == 3) {
                box = new Konva.Circle({
                    radius: 4*RC.scaleGroup,
                    fill: temp[1].qText=="1"?'#f83f71':'#5974bb',
                    name:type+":"+temp[0].qText
                });
            }

            var boxText = new Konva.Text({
                text: temp[0].qText,
                width:100,
                fontSize: 18,
                align: 'right',
                fill:'#384060',
                stroke: '#384060',
                strokeWidth: 1,
                name:"text"
            });
            boxText.toImage({
                width: boxText.getWidth(),
                height: boxText.getHeight(),
                callback: function(img) {
                    var cachedText = new Konva.Image({
                        image: img,
                        listening: false,
                        scaleY:-1,
                        scaleX:-1,
                        x: 125,
                        y: 8
                    });
                    if(isLast) {
                            animate();
                           RC.complete();
                    }
                    wedge.add(cachedText);
                    RC.layer.draw();
                }
            });
            wedge.add(box);
            RC.group.add(wedge);
        }


        RC.init= function(){
            console.log("loading");
            var loading = document.getElementById("rc_loading");
            var isLast=false;
            loading.style.display = "block";
            //�����л�
            Konva.angleDeg = false;
            //��ȡ����ֵ
            //if(this.dataPlg.length==0||this.dataRect.length==0||this.dataCirl.length==0)
            //return;
            getCoordinates(this.dataPlg,1);
            getCoordinates(this.dataRect,2);
            getCoordinates(this.dataCirl,3);
            this.stage = new Konva.Stage({
                container: this.ele_id,
                width: this.winW,
                height: this.winH
            });
            this.layer = new Konva.Layer();
            this.group = new Konva.Group({
                x:this.winW/2,
                y:this.winH/2,
                scale:{x:1/RC.scaleGroup,y:1/RC.scaleGroup},
                rotation:0
            });
            this.circle = new Konva.Circle({
                x:this.winW/2,
                y:this.winH/2,
                radius: 290*this.scaleGroup,
                scale:{x:1/RC.scaleGroup,y:1/RC.scaleGroup},
                stroke: 'rgba(0,0,0,0)',
                strokeWidth: 1,
                name:"mouseArea"
            });
            var Arc_po = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 350*this.scaleGroup,
                outerRadius: 350*this.scaleGroup,
                angle: Math.PI/180*110,
                rotation:Math.PI/180*-85,
                stroke: '#384060',
                strokeWidth: 1
            });
            var Arc_rc = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 350*this.scaleGroup,
                outerRadius: 350*this.scaleGroup,
                angle: Math.PI/180*110,
                rotation:Math.PI/180*35,
                stroke: '#384060',
                strokeWidth: 1
            });
            var Arc_inv = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 350*this.scaleGroup,
                outerRadius: 350*this.scaleGroup,
                angle: Math.PI/180*110,
                rotation:Math.PI/180*155,
                stroke: '#384060',
                strokeWidth: 1
            });
            //��ÿ����
            for (var i = 0; i < RC.dataFull.length; i++) {
                var option = this.dataFull[i];
                if(i==RC.dataFull.length-1)  isLast=true;
                drawPoint(option,isLast);
            }
            //������
            getBCline(this.dataLine_IP.data,this.dataLine_IP.name);
            getBCline(this.dataLine_RP.data,this.dataLine_RP.name);
            //console.log("lineMsg:",getLinePoint(this.dataLineMsg));
            this.group.add(Arc_po);
            this.group.add(Arc_rc);
            this.group.add(Arc_inv);
            this.layer.add( this.circle);
            this.layer.add( this.group);
            this.stage.add( this.layer);

            //�¼�����
            bind();
            //����
            RC.circle.on('dblclick ',function(){
                if(!RC.zoom){
                    zoomCanvas();
                }else{
                    RC.zoom = false;
                    RC.reStart();
                }
            });
        };

        function zoomCanvas() {
            RC.stage.off('contentTouchstart');
            RC.stage.off('contentTouchmove');
            RC.stage.off('contentTouchend');
            RC.circle.off('click tap');
            var scale = 1;
            RC.circle.scale({x:scale,y:scale});
            RC.circle.x(440*RC.scaleGroup);
            RC.group.scale({x:scale,y:scale});
            RC.group.x(440*RC.scaleGroup);
            RC.layer.draw();
            dragWheel();
            RC.zoom=true;
            cancelAnimationFrame(RC.anim);
        }
        function bind(){
            var lastdist =0;
            var startDist = 0;
            function  circleClick() {
                if(RC.stop){
                    RC.stop=false;
                    animate();
                }else {
                    RC.stop= true;
                }
            }
            RC.circle.on('click tap',circleClick);
            RC.stage.on('contentTouchend',function (evt) {
                if(lastdist>startDist){
                    zoomCanvas();
                }
            //    $(".touch-msg").html("touchStartDistance: "+startDist+" endDistance: " +lastdist);
                startDist =0;
            });

            RC.stage.on('contentTouchstart',function (evt) {
                var touch1 = evt.evt.touches[0];
                var touch2 = evt.evt.touches[1];
                if(touch1 && touch2) {
                    startDist = getFingerDistance({
                        x: touch1.clientX,
                        y: touch1.clientY
                    }, {
                        x: touch2.clientX,
                        y: touch2.clientY
                    });

                }
            //    $(".touch-msg").html("touchStartDistance: "+startDist);
            })
            RC.stage.on('contentTouchmove',function (evt) {
                console.log(evt);
                var touch1 = evt.evt.touches[0];
                var touch2 = evt.evt.touches[1];
                if(touch1 && touch2) {
                    lastdist = getFingerDistance({
                        x: touch1.clientX,
                        y: touch1.clientY
                    }, {
                        x: touch2.clientX,
                        y: touch2.clientY
                    });
                }
            })
        }

        function getFingerDistance(p1, p2) {
            return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
        }


       var animate=function() {
            if(RC.stop) {
                RC.group.rotate( -RC.angleReturn);
                RC.layer.add(RC.group);
                RC.stage.add(RC.layer);
                RC.angleReturn =0;
                return;
            }
           RC.group.rotate( 2 * Math.PI / RC.angularSpeed);
           RC.angleReturn += 2 * Math.PI /RC.angularSpeed;
           RC.layer.draw();
           //RC.stage.add(RC.layer);
           RC.anim = requestAnimationFrame(animate);
        };

        function dragWheel(){
            var color =0;
            RC.group.lastRotation = 0;
            RC.group.angularVelocity = 0;
            RC.group.controlled = false;
            var lastdist =0;
            var startDist = 0;
            var startAngle = 0,endAngle = 0,rotaAngle2=0;
            var finger =0;
            RC.stage.on('mousedown touchstart', function(evt) {
                RC.group.angularVelocity = 0;
                RC.group.controlled = true;
            });
            RC.stage.on('contentMousedown  contentTouchstart', function(evt) {

                finger = !evt.evt.touches||evt.evt.touches.length;
                if(finger&&finger>1){
                    var touch1 = evt.evt.touches[0];
                    var touch2 = evt.evt.touches[1];
                    if(touch1 && touch2) {
                        startDist = getFingerDistance({
                            x: touch1.clientX,
                            y: touch1.clientY
                        }, {
                            x: touch2.clientX,
                            y: touch2.clientY
                        });
                    }
                   // $(".touch-msg").html("start:"+"touchStartDistance: "+startDist+" endDistance: " +lastdist);
                }else {
                    if (RC.group.controlled) {
                        var mousePos = RC.stage.getPointerPosition();
                        var x = RC.group.getX() - mousePos.x;
                        var y = RC.group.getY() - mousePos.y;
                        startAngle = Math.atan(y / x);
                    }
                }
            });
            RC.stage.on('contentMousemove contentTouchmove', function(evt) {
                finger = !evt.evt.touches||evt.evt.touches.length;
                if(finger&&finger>1){
                    var touch1 = evt.evt.touches[0];
                    var touch2 = evt.evt.touches[1];
                    if(touch1 && touch2) {
                        lastdist = getFingerDistance({
                            x: touch1.clientX,
                            y: touch1.clientY
                        }, {
                            x: touch2.clientX,
                            y: touch2.clientY
                        });

                    }
                    //$(".touch-msg").html("touchStartDistance: "+startDist+" endDistance: " +lastdist);
                }else {
                    if (RC.group.controlled) {
                        var mousePos = RC.stage.getPointerPosition();
                        var x = RC.group.getX() - mousePos.x;
                        var y = RC.group.getY() - mousePos.y;
                        var rotaAngle = (Math.atan(y / x) - startAngle) * 1;
                        var setRota = rotaAngle*0.04;
                        RC.angleReturn += rotaAngle;
                        RC.group.rotate(setRota);
                    }
                }
            });
            RC.stage.on('contentMouseup contentTouchend', function(evt) {
                if(finger&&finger>1){
                    if(lastdist<startDist){
                        RC.zoom = false;
                        RC.reStart();
                    }
//                    $(".touch-msg").html("touchStartDistance: "+startDist+" endDistance1: " +lastdist);
                }else {
                    RC.group.controlled = false;
                    var mousePos = RC.stage.getPointerPosition();
                    var x = RC.group.getX() - mousePos.x;
                    var y = RC.group.getY() - mousePos.y;
                    endAngle = Math.atan(y / x);
                    // console.log("contentTouchend:"+rotaAngle2);
                    if (RC.group.angularVelocity == 0) {
                        rotaAngle2 += endAngle - startAngle;
                        //   anim_rotate =false;
                    }
                }
            });
            RC.stage.on("click dbltap",function(evt){
                var shape = evt.target;
                RC.clickPoint(shape);
            });
            RC.stage.on("mouseover tap",function(evt){
                var shape = evt.target;
                RC.group.children.each(function(child){
                    if(child.getType()!="Group"){
                        child.setAttrs({
                            shadowBlur: 0
                        });
                    }else {
                        child.children[0].setAttrs({
                            shadowBlur: 0
                        });
                    }

                });
                if(shape._id!="4"){
                    color= shape.getAttrs("stroke").stroke;
                    //console.log(shape.getAttrs("stroke").stroke);
                    shape.setAttrs({
                        shadowColor: '#fff',
                        shadowBlur: 20,
                        shadowOpacity: 0.9
                    });

                }
            });
            RC.stage.on("mouseout",function(evt){
                var shape = evt.target;
                if(shape._id!="4"){
                   // console.log(color);
                    shape.setAttrs({
                        shadowBlur: 0
                    });
                }
            });
            RC._anim = new Konva.Animation(function(frame) {
                animateWheel( RC.group, frame);
            },  RC.layer).start();
        }

        function animateWheel( ele, frame) {
            // 20% slow down per second
            var angularFriction = 0.2;
            var angularVelocityChange = ele.angularVelocity * frame.timeDiff * (1 - angularFriction) / 1000;
            ele.angularVelocity -= angularVelocityChange;
            if(RC.group.controlled) {
                ele.angularVelocity = (ele.getRotation() - ele.lastRotation) * 1000 / frame.timeDiff;
            }
            else {
                // anim_rotate =true;
                ele.rotate(frame.timeDiff * ele.angularVelocity / 1000);
                RC.angleReturn += frame.timeDiff * ele.angularVelocity / 1000;
            }
            ele.lastRotation = ele.getRotation();
        }

       // var i =0;
        function getTension(startPoint,endPoint){
           // if(endPoint.nextY||endPoint.nextX) console.log("endPoint:",startPoint,i++);
          //  if(startPoint.nextY||startPoint.nextX) console.log("startPointy:",startPoint);
            var cirPoint ={x:0,y:0};
            var centerPoint = {x:(startPoint.nextX+endPoint.nextX)*3/5,y:(startPoint.nextY+endPoint.nextY)*3/5};
            var Tension ={x:(cirPoint.x+centerPoint.x)*3/5,y:(centerPoint.y+cirPoint.y)*3/5};
            return Tension;
        }
        function getBCline(lineArray,name){
            var linePoints =getLinePoint(lineArray,name);
            var tension,line,startPoint,endPoint,temp;
            for(var i =0;i<linePoints.length;i++){
                temp = linePoints[i];
                startPoint = RC.dataFull[temp.sIndex];
                endPoint = RC.dataFull[temp.eIndex];
                tension= getTension(startPoint,endPoint);
                console.log("name:",temp.Name,"id",temp.id);
                line =new Konva.Line({
                    points: [startPoint.nextX*.95,startPoint.nextY *.95,tension.x,tension.y,endPoint.nextX *.95,endPoint.nextY *.95],
                    stroke: temp.isError?'#f83f71':'#384060',
                    strokeWidth: 4,
                    tension:1,
                    name:temp.Name+":"+temp.id,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
                RC.group.add(line);
            }
            console.timeEnd("drawline:");
        }
        function getLinePoint(lineArray,name){
            console.time("drawline:");
            var linePoints =new Array();
            console.log("lineAarray:" ,lineArray);
            for(var i=0;i<lineArray.length;i++){
                var opt ={
                    sIndex:-1,
                    eIndex:-1,
                    Name:name,
                    id:"",
                    isError:false
                };
                for(var k=0;k<RC.dataFull.length;k++){
                    var temp = lineArray[i];
                    var temp_rc = RC.dataFull[k].infoArr;
                    if(temp){
                        if(temp[0].qText ==temp_rc[0].qText){
                            opt.sIndex = k;
                            opt.id=temp[0].qText;
                            opt.isError =opt.isError||temp_rc[1].qText==="1";
                            if(opt.eIndex!=-1) break;         //find the start point when end point found break the "for"
                        }
                        if(temp[1].qText ==temp_rc[0].qText){
                            opt.eIndex = k;
                            opt.isError =opt.isError||temp_rc[1].qText==="1";
                            if(opt.sIndex!=-1) break;        //find the end point when end start found break the "for"
                        }
                    }
                }
                linePoints.push(opt);
            }
            return linePoints;
        }
        RC.clear=function(){
            //if(RC.group.scale) RC.reStart();
            cancelAnimationFrame(RC.anim);
            RC.stop=false;
            if(this._anim.stop) this._anim.stop();
            RC.rotaAngle=0;
            RC.layer=null;
            RC.stage=null;
            RC.group=null;
            RC.dataFull=null;
            RC.dataCirl=null;
            RC.dataRect=null;
            RC.dataPlg=null;
            RC.zoom =false;
            RC.angleAdd=5;
            RC.dataLineMsg=null;
            if(typeof RC._anim==="function") RC._anim.stop();
            RC.angleReturn=0;
            var _element =document.getElementById("rc_canvas");
            _element.innerHTML ="";
            console.log("洗澡");
        }
    }());
    return RC;
});