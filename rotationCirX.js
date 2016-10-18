/**
 * Created by wzdwc on 2016/8/24.
 */
define(['./konva',"./requestAnimationFrame"],function(Konva) {
        /**
         * @namespace _RC
         */
        var _RC ={
            version: '1.0.2',
            // private
            layer:{},
            stage:{},
            group:{},
            circle:{},
            anim:function(){},
            stop:false,
            angleReturn:0,
            angularSpeed :1000,
            rotaAngle :0,
            /**
             * 动画初始化完成时执行回调函数
             * @method
             * @memberof _RC
             */
            complete:function(){
            },
            /**
             * 点击圆圈的圆弧，执行回调
             * @method
             * @memberof _RC
             */
            clickPoint:function(){
            },
            /**
             * 动画构造函数，初始化数据，执行动画。
             * @method
             * @memberof _RC
             */
            RotateCircle:function(conf){
                    this.winW =conf.winW||window.innerWidth,
                    this.winH =conf.winH||window.innerHeight,
                    this.ele_id=conf.ele_id||"",
                    //data
                    this.data=conf.data|| [.5,.5,.5];
                    if (typeof conf.complete==="function") this.complete = conf.complete;
                    if (typeof conf.clickPoint==="function") this.clickPoint = conf.clickPoint;
                    this.init();
            }
        };
        /**
         * 初始化
         * @method
         * @memberof _RC
         */
        _RC.init =function(){
            var po_group,rc_group,inv_group,
                Arc_po_in,Arc_po,Arc_rc,Arc_rc_in,Arc_inv,Arc_inv_in,
                textpath_inv,textpath_rc,textpath_po;
            Konva.angleDeg = false;                                             //使用π进行角度设置
            //获取坐标�?
            this.stage = new Konva.Stage({
                container: _RC.ele_id,
                width: _RC.winW,
                height: _RC.winH
            });
            this.layer = new Konva.Layer();
            this.group = new Konva.Group({
                x:_RC.winW/2,
                y:_RC.winH/2
            });
            po_group = new Konva.Group({
                x:0,
                y:0,
                rotation:Math.PI/180*35
            });
            rc_group = new Konva.Group({
                x:0,
                y:0,
                rotation:Math.PI/180*-85
            });
            inv_group = new Konva.Group({
                x:0,
                y:0,
                rotation:Math.PI/180*155
            });
            _RC.circle = new Konva.Circle({
                x:_RC.winW/2,
                y:_RC.winH/2,
                radius: 279,
                stroke: 'rgba(0,0,0,0)',
                strokeWidth: 1
            });
            Arc_po = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 350,
                outerRadius: 350,
                angle: Math.PI/180*110,
                rotation:Math.PI/180*35,
                stroke: '#384060',
                strokeWidth: 1
            });
            Arc_po_in = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 280,
                outerRadius: 300,
                angle: Math.PI/180*110*_RC.data[0],
                name:"po_real",
                fill: '#3fadb2',
                strokeWidth: 1
            });
            var Arc_po_in2 = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 280,
                outerRadius: 300,
                angle: Math.PI/180*110*(1-_RC.data[0]),
                name:"po_error",
                rotation:Math.PI/180*110*_RC.data[0],
                fill: '#cd3664',
                strokeWidth: 1
            });
            po_group.add(Arc_po_in);
            po_group.add(Arc_po_in2);
            Arc_rc = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 350,
                outerRadius: 350,
                angle: Math.PI/180*110,
                rotation:Math.PI/180*-85,
                stroke: '#384060',
                strokeWidth: 1
            });
            Arc_rc_in = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 280,
                outerRadius: 300,
                angle: Math.PI/180*110*_RC.data[1],
                name:"rc_real",
                fill: '#3fadb2',
                strokeWidth: 1
            });
            var Arc_rc_in2 = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 280,
                outerRadius: 300,
                angle: Math.PI/180*110*(1-_RC.data[1]),
                rotation:Math.PI/180*110*_RC.data[1],
                name:"rc_error",
                fill: '#cd3664',
                strokeWidth: 1
            });

            rc_group.add(Arc_rc_in);
            rc_group.add(Arc_rc_in2);
            Arc_inv = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 350,
                outerRadius: 350,
                angle: Math.PI/180*110,
                rotation:Math.PI/180*155,
                stroke: '#384060',
                strokeWidth: 1
            });

            Arc_inv_in = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 280,
                outerRadius: 300,
                angle: Math.PI/180*110*_RC.data[2],
                name:"inv_real",
                fill: '#3fadb2',
                strokeWidth: 1
            });
            var Arc_inv_in2 = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 280,
                outerRadius: 300 ,
                name:"inv_error",
                angle: Math.PI/180*110*(1-_RC.data[2]),
                rotation:Math.PI/180*110*_RC.data[2],
                fill: '#cd3664',
                strokeWidth: 1
            });
            inv_group.add(Arc_inv_in);
            inv_group.add(Arc_inv_in2);
            textpath_inv = new Konva.TextPath({
                x:-380,
                y:-380,
                fill: '#384060',
                fontSize: 35,
                fontFamily: 'Arial',
                align:'center',
                text: 'I N V O I C E',
                data: 'M 59 343 a 300,300 0 0 1 129 -223'

            });

            textpath_rc = new Konva.TextPath({
                x:-380,
                y:-380,
                fill: '#384060',
                fontSize: 35,
                fontFamily: 'Arial',
                align:'center',
                text: 'R E C E I P T',
                data: 'M 585 131.5 a 300,300 0 0 1 114 195'
            });

            textpath_po = new Konva.TextPath({
                x:-380,
                y:-380,
                fill: '#384060',
                fontSize: 35,
                fontFamily: 'Arial',
                align:'center',
                text: '  P               O',
                data: 'M 238 667.5 a 300,300 0 0 0 282 2'
            });
            _RC.group.add(po_group);
            _RC.group.add(rc_group);
            _RC.group.add(inv_group);
            _RC.group.add(Arc_po);
            _RC.group.add(Arc_rc);
            _RC.group.add(Arc_inv);
            _RC.group.add(textpath_inv);
            _RC.group.add(textpath_rc);
            _RC.group.add(textpath_po);
            _RC.layer.add(_RC.group);
            _RC.layer.add(_RC.circle);
            _RC.stage.add(_RC.layer);
            this.complete();
            bind();
            animate();
        };
        /**
         * 动画
         * @method
         * @memberof windows
         */
        var animate =function() {
            if(_RC.stop) {
                _RC.group.rotate( -_RC.angleReturn);               //停止动画，返回初始位置。
                _RC.layer.draw();
                _RC.angleReturn =0;
                return;
            }
           _RC.group.rotate( 2 * Math.PI / _RC.angularSpeed);
           _RC.angleReturn += 2 * Math.PI / _RC.angularSpeed;
           _RC.layer.draw();
           _RC.anim = requestAnimationFrame(animate);
        }

        /**
         * 绑定事件
         * @method
         * @memberof windows
         */
        function bind(){
            _RC.stage.on('click tap',function(evt){
                _RC.stop=true;
                var shape = evt.target;
                if(shape._id!="7"&&shape.className=="Arc"){
                    _RC.clickPoint(shape);
                }
            });
            _RC.stage.on("mouseover",function(evt){
                var shape = evt.target;
                if(shape._id!="7"&&shape.className=="Arc"){
                  //  console.log(shape);
                    shape.setAttrs({
                        shadowColor: '#fff',
                        shadowBlur: 10,
                        shadowOpacity: 0.8
                    });
                    _RC.layer.draw();
                }
            });
            _RC.stage.on("mouseout",function(evt){
                var shape = evt.target;
                if(shape._id!="7"&&shape.className=="Arc"){
                    shape.setAttrs({
                        shadowBlur: 0
                    });
                    _RC.layer.draw();
                //    console.log(shape);
                }
            });
        }

        /**
         * 清除所有动画、对象缓存
         * @method
         * @memberof _RC
         */
        _RC.clear=function(){
            cancelAnimationFrame(_RC.anim);
            var _element =document.getElementById(_RC.ele_id);
            if(_RC.ele_id) _element.innerHTML ="";
            _RC.stop=false;
            _RC.rotaAngle=0;
            _RC.angleReturn=0;
        }
    return _RC;
});