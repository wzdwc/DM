/**
 * Created by wzdwc on 2016/8/24.
 */
define(['./konva',"./requestAnimationFrame"],function(Konva) {

    var RC ={
        // public
        version: '1.0.2',
        // private
        layer:{},
        stage:{},
        group:{},
        circle:{},
        anim:function(){},
        stop:false,
        angleReturn:0,
        angularSpeed :600,
        rotaAngle :0,
        iscomplete:false,
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
                this.data=conf.data|| [.5,.5,.5];
                if (typeof conf.complete==="function") this.complete = conf.complete;
                if (typeof conf.clickPoint==="function") this.clickPoint = conf.clickPoint;
                this.init();
        }
    };

    (function(){
        RC.init =function(){
            var po_group,rc_group,inv_group,
                Arc_po_in,Arc_po,Arc_rc,Arc_rc_in,Arc_inv,Arc_inv_in,
                textpath_inv,textpath_rc,textpath_po;
            Konva.angleDeg = false;
            //获取坐标�?
            this.stage = new Konva.Stage({
                container: RC.ele_id,
                width: RC.winW,
                height: RC.winH
            });
            this.layer = new Konva.Layer();
            this.group = new Konva.Group({
                x:RC.winW/2,
                y:RC.winH/2
            });
            po_group = new Konva.Group({
                x:0,
                y:0,
                rotation:Math.PI/180*-85
            });
            rc_group = new Konva.Group({
                x:0,
                y:0,
                rotation:Math.PI/180*35
            });
            inv_group = new Konva.Group({
                x:0,
                y:0,
                rotation:Math.PI/180*155
            });
            RC.circle = new Konva.Circle({
                x:RC.winW/2,
                y:RC.winH/2,
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
                rotation:Math.PI/180*-85,
                stroke: '#384060',
                strokeWidth: 1
            });
            Arc_po_in = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 280,
                outerRadius: 300,
                angle: Math.PI/180*110*RC.data[0],
                name:"po_real",
                fill: '#3fadb2',
                strokeWidth: 1
            });
            var Arc_po_in2 = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 280,
                outerRadius: 300,
                angle: Math.PI/180*110*(1-RC.data[0]),
                name:"po_error",
                rotation:Math.PI/180*110*RC.data[0],
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
                rotation:Math.PI/180*35,
                stroke: '#384060',
                strokeWidth: 1
            });
            Arc_rc_in = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 280,
                outerRadius: 300,
                angle: Math.PI/180*110*RC.data[1],
                name:"rc_real",
                fill: '#3fadb2',
                strokeWidth: 1
            });
            var Arc_rc_in2 = new Konva.Arc({
                x:0,
                y:0,
                innerRadius: 280,
                outerRadius: 300,
                angle: Math.PI/180*110*(1-RC.data[1]),
                rotation:Math.PI/180*110*RC.data[1],
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
                angle: Math.PI/180*110*RC.data[2],
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
                angle: Math.PI/180*110*(1-RC.data[2]),
                rotation:Math.PI/180*110*RC.data[2],
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
            RC.group.add(po_group);
            RC.group.add(rc_group);
            RC.group.add(inv_group);
            RC.group.add(Arc_po);
            RC.group.add(Arc_rc);
            RC.group.add(Arc_inv);
            RC.group.add(textpath_inv);
            RC.group.add(textpath_rc);
            RC.group.add(textpath_po);
            RC.layer.add(RC.group);
            RC.layer.add(RC.circle);
            RC.stage.add(RC.layer);
            this.complete();
            bind();
            animate();
        };

       var animate =function() {
            if(RC.stop) {
                RC.group.rotate( -RC.angleReturn);
                RC.layer.draw();
                RC.angleReturn =0;
                return;
            }
            RC.group.rotate( 2 * Math.PI / RC.angularSpeed);
            RC.angleReturn += 2 * Math.PI / RC.angularSpeed;
            RC.layer.draw();
            RC.anim = requestAnimationFrame(animate);
        }
        function bind(){
            RC.stage.on('click tap',function(evt){
                RC.stop=true;
                var shape = evt.target;
                if(shape._id!="7"&&shape.className=="Arc"){
                    RC.clickPoint(shape);
                }
            });
            RC.stage.on("mouseover",function(evt){
                var shape = evt.target;
                if(shape._id!="7"&&shape.className=="Arc"){
                  //  console.log(shape);
                    shape.setAttrs({
                        shadowColor: '#fff',
                        shadowBlur: 10,
                        shadowOpacity: 0.8
                    });
                    RC.layer.draw();
                }
            });
            RC.stage.on("mouseout",function(evt){
                var shape = evt.target;
                if(shape._id!="7"&&shape.className=="Arc"){
                    shape.setAttrs({
                        shadowBlur: 0
                    });
                    RC.layer.draw();
                //    console.log(shape);
                }
            });
        }

        RC.clear=function(){
            var _element =document.querySelector("canvas");
            if(_element.parentNode){
                _element.parentNode.removeChild(_element);
            }
            RC.iscomplete =false;
            RC.stop=false;
            RC.rotaAngle=0;
            RC.angleReturn=0;
            cancelAnimationFrame(RC.anim);
        }
    }());

    return RC;
});