/**
 * Created by wzdwc on 2016/8/15.
 */
define(['./konva',"./requestAnimationFrame"],function(Konva){

    /**
     * @namespace _RC
     */
    var RC ={
            // public
            version: '1.0.2',
            // private
            layer:{},
            stage:{},
            group:{},
            circle:{},
            /**
             * 初始化圆动画
             * @method
             * @memberof RC
             */
            anim:function(){},
            /**
             * 放大后动画
             * @method
             * @memberof RC
             */
            _anim:{},
            stop:false,
            angleReturn:0,
            angularSpeed :1000,
            //缩放倍数
            scaleGroup:2.5,
            rotaAngle :0,
            zoom :false,
            //三个数据集间隔度数
            angleAdd:5,
            /**
             * 动画初始化完成时执行回调函数
             * @method
             * @memberof RC
             */
            complete:function(){
            },
            /**
             * 点击圆点与线，执行回调
             * @method
             * @memberof RC
             */
            clickPoint:function(){
            },
            /**
             * 动画构造函数，初始化数据，执行动画。
             * @method
             * @memberof RC
             */
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


    // private
    (function(){
        /**
         * 重新开始动画
         * @method
         * @memberof RC
         */
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

        /**
         * 获取圆点坐标
         * @method
         * @memberof RC
         * @param {object} coordinate：圆点对象
         * @param {Number} index：当前的序号，
         * @param {Number} len：这个数据集合长度
         * @returns {object} coordinate
         * @example
         *  Coordinates(coordinate,0,20);
         */
        function Coordinates(coordinate, index,len) {
            var startX = 0, startY = 0, r = 300*RC.scaleGroup,angle;
            angle = index==0?RC.angleAdd:110 / (len-1) * index+RC.angleAdd;     //
            if(len==1){
                angle =55+RC.angleAdd;
            }
            var k = Math.sin(2 * Math.PI / 360 * angle) * r;
            var j = Math.cos(2 * Math.PI / 360 * angle) * r;
            coordinate.nextX = startX + k;
            coordinate.nextY = startY - j;
            coordinate.angle = angle;
            return coordinate;
        }

        /**
         * 获取
         * @method
         * @memberof RC
         * @param {Array} pointArray：圆点数组
         * @param {Number} type：第几部分数据
         * @example
         *  getCoordinates([],1);
         */
        function getCoordinates(pointArray,type) {
            var data = pointArray.data?pointArray.data:null;
            RC.angleAdd = (type-1)*120+5;
            for (var i = 0; i < data.length; i++) {
                var startX = 0, startY = 0, r = 300*RC.scaleGroup,angle;
                var temp ={
                    type:pointArray.type,
                    infoArr:data[i]
                };
                angle = i==0?RC.angleAdd:110 / (data.length-1) * i+RC.angleAdd;     //当首个点时，直接使用间隔角度；
                if(data.length==1){                                                 //当数据只有一条时，居中
                    angle =55+RC.angleAdd;
                }
                var k = Math.sin(2 * Math.PI / 360 * angle) * r;
                var j = Math.cos(2 * Math.PI / 360 * angle) * r;
                temp.nextX = startX + k;
                temp.nextY = startY - j;
                temp.angle = angle;
                RC.dataFull.push(temp);
            }
        }
        /**
         * 绘制每个圆点
         * @method
         * @memberof RC
         * @param {Object} pointObj：圆点对象
         * @param {Boolean} isLast：是否最后一条数据
         * @example
         *  drawPoint(object,true);
         */
        function drawPoint(pointObj,isLast) {
            var temp = pointObj.infoArr,type = pointObj.type,box;
            var wedge = new Konva.Group({
                rotation: 2 * Math.PI / 360 * (-90+pointObj.angle),
                x: pointObj.nextX,
                y: pointObj.nextY
            });
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

        /**
         * 初始化函数
         * @method
         * @memberof RC
         */
        RC.init= function(){
            var isLast=false;
            Konva.angleDeg = false;
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
            //绘制圆点
            for (var i = 0; i < RC.dataFull.length; i++) {
                var option = this.dataFull[i];
                isLast=i==RC.dataFull.length-1;
                drawPoint(option,isLast);
            }
            //绘制弧线
            getBCline(this.dataLine_IP.data,this.dataLine_IP.name);
            getBCline(this.dataLine_RP.data,this.dataLine_RP.name);

            this.group.add(Arc_po);
            this.group.add(Arc_rc);
            this.group.add(Arc_inv);
            this.layer.add( this.circle);
            this.layer.add( this.group);
            this.stage.add( this.layer);
            bind();
            RC.circle.on('dblclick ',function(){
                if(!RC.zoom){
                    zoomCanvas();
                }else{
                    RC.zoom = false;
                    RC.reStart();
                }
            });
        };

        /**
         * 缩放
         * @method
         * @memberof RC
         */
        function zoomCanvas() {
            //去除原有的事件
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

        /**
         * 绑定相关事件
         * @method
         * @memberof RC
         */
        function bind(){
            var lastdist =0;                        //touch结束距离
            var startDist = 0;                          //touch起始距离
            RC.circle.on('click tap',function () {
                if(RC.stop){
                    RC.stop=false;
                    animate();
                }else {
                    RC.stop= true;
                }
            });
            RC.stage.on('contentTouchend',function (evt) {
                if(lastdist>startDist){
                    zoomCanvas();
                }
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
            });
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
        /**
         * Touch 手指直接距离
         * @method
         * @memberof Windows
         */
        function getFingerDistance(p1, p2) {
            return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
        }

        /**
         * 动画事件
         * @method
         * @memberof Windows
         */
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
           RC.anim = requestAnimationFrame(animate);
        };

        /**
         * drag圆事件，转动动画。
         * @method
         * @memberof Windows
         */
        function dragWheel(){
            var color =0,lastDist =0,startDist = 0,startAngle = 0,endAngle = 0,rotaAngle2=0,finger =0;
            RC.group.lastRotation = 0;
            RC.group.angularVelocity = 0;
            RC.group.controlled = false;
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
                        lastDist = getFingerDistance({
                            x: touch1.clientX,
                            y: touch1.clientY
                        }, {
                            x: touch2.clientX,
                            y: touch2.clientY
                        });

                    }
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
                }else {
                    RC.group.controlled = false;
                    var mousePos = RC.stage.getPointerPosition();
                    var x = RC.group.getX() - mousePos.x;
                    var y = RC.group.getY() - mousePos.y;
                    endAngle = Math.atan(y / x);
                    if (RC.group.angularVelocity == 0) {
                        rotaAngle2 += endAngle - startAngle;
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
                    shape.setAttrs({
                        shadowBlur: 0
                    });
                }
            });
            RC._anim = new Konva.Animation(function(frame) {
                animateWheel( RC.group, frame);
            },  RC.layer).start();
        }
        /**
         * drag动画加速
         * @method
         * @memberof Windows
         * @param {Object} ele：转动结点
         * @param {Object} frame：继承Konva.Animation
         * @example
         *  animateWheel(layer,frame);
         */
        function animateWheel( ele, frame) {
            // 20% slow down per second
            var angularFriction = 0.2;
            var angularVelocityChange = ele.angularVelocity * frame.timeDiff * (1 - angularFriction) / 1000;
            ele.angularVelocity -= angularVelocityChange;
            if(RC.group.controlled) {
                ele.angularVelocity = (ele.getRotation() - ele.lastRotation) * 1000 / frame.timeDiff;
            }
            else {
                ele.rotate(frame.timeDiff * ele.angularVelocity / 1000);
                RC.angleReturn += frame.timeDiff * ele.angularVelocity / 1000;
            }
            ele.lastRotation = ele.getRotation();
        }

        /**
         * 获取二次曲线中间点
         * @method
         * @memberof Windows
         * @param {Object} startPoint：起始点
         * @param {Object} endPoint：结束点
         * @example
         *  getTension(startPoint,endPoint);
         */
        function getTension(startPoint,endPoint){
            var cirPoint ={x:0,y:0};
            var centerPoint = {x:(startPoint.nextX+endPoint.nextX)*3/5,y:(startPoint.nextY+endPoint.nextY)*3/5};
            var Tension ={x:(cirPoint.x+centerPoint.x)*3/5,y:(centerPoint.y+cirPoint.y)*3/5};
            return Tension;
        }

        /**
         * 绘制二次曲线
         * @method
         * @memberof Windows
         * @param {Array} lineArray：起始点
         * @param {String} name：名称
         * @example
         *  getBCline(startPoint,"");
         */
        function getBCline(lineArray,name){
            var linePoints =getLinePoint(lineArray,name);
            var tension,line,startPoint,endPoint,temp;
            for(var i =0;i<linePoints.length;i++){
                temp = linePoints[i];
                startPoint = RC.dataFull[temp.sIndex];
                endPoint = RC.dataFull[temp.eIndex];
                tension= getTension(startPoint,endPoint);
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
        }

        /**
         * 获取二次曲线的起点与终点坐标
         * @method
         * @memberof Windows
         * @param {Array} lineArray：曲线集合
         * @param {String} name：名称
         * @returns {object} linePoints
         * @example
         *  getLinePoint([],"");
         */
        function getLinePoint(lineArray,name){
            var linePoints =new Array();
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
                            if(opt.eIndex!=-1) break;                            //当终点坐标已存在，跳出循环
                        }
                        if(temp[1].qText ==temp_rc[0].qText){
                            opt.eIndex = k;
                            opt.isError =opt.isError||temp_rc[1].qText==="1";
                            if(opt.sIndex!=-1) break;                            //当起点坐标存在，跳出循环
                        }
                    }
                }
                linePoints.push(opt);
            }
            return linePoints;
        }

        /**
         * 清除所有动画、对象缓存
         * @method
         * @memberof _RC
         */
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
            var _element =document.getElementById(RC.ele_id);
            if(RC.ele_id) _element.innerHTML ="";
        }
    }());
    return RC;
});