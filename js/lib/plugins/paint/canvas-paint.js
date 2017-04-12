var paint={	
		opt:{
			"canvas":"canvas",
			"canvas_bak":"canvas_bak",
			"canvas_vertical":"canvas_vertical",
			"canvas_bak_zIndex":6,
			"in_lineWidth":2,
			"out_lineWidth":4,
			"bl_lineWidth":4,
			"vt_lineWidth":3,
			"in_strokeStyle":"#349800",
			"out_strokeStyle":"#fe0000",
			"bl_strokeStyle":"#0060ff",
			"vt_strokeStyle":"#0060ff",
			"clear_id":"clear",
			"revocation_id":"revocation",
			"in_paintID":"in_paint",
			"out_paintID":"out_paint",
			"ban_lineID":"ban_line",
			"ban_dircID":"ban-direct",
			"vertical_len":20,
			"sharp":0.4,
			"size":0.4,
			"ABFont":"20px Georgia",
			"ABColor":"#0060ff",
			"edge_threshold":10            //边缘阈值，处在这个范围内的X、Y均赋值为0
		},
		domain:{
			"out_xsave":[],
			"out_ysave":[],
			"in_xsave":[],
			"in_ysave":[],
			"bl_xsave":[],
			"bl_ysave":[]
		},
        init:function()
        {
			var len= arguments.length; 
			if(len != 0){
				this.opt = arguments[0];
			} 
			this.load();			
        },
        load:function()
        {   
			this.x=[];//记录鼠标移动时的X坐标
            this.y=[];//记录鼠标移动时的Y坐标
			
			this.xsave = [];
			this.ysave = [];
			this.cross = false;
			this.whichpaint = "in";
			
			//边缘赋值
			this.edge_threshold = this.opt.edge_threshold;
			
			this.imageData = [];
			
			this.verticalPoint = [];
			this.ABPoint = [];
			
			this.domain.out_xsave = [];
			this.domain.out_ysave = [];
			this.domain.in_xsave = [];
			this.domain.in_ysave = [];
			this.domain.bl_xsave = [];
			this.domain.bl_ysave = [];
			
            this.lock=false;//鼠标移动前，判断鼠标是否按下
			this.canDraw = true;    //判断是否正可以画图，true则为可以开始画，false为正在画
            
            this.$=function(id){return typeof id=="string"?document.getElementById(id):id;};
            this.canvas=this.$(this.opt.canvas);
			this.canvas_bak = this.$(this.opt.canvas_bak);
			this.canvas_vertical = this.$(this.opt.canvas_vertical);
			this.canvas_bak.zIndex = this.opt.canvas_bak_zIndex;
            if (this.canvas.getContext) {
            } else {
                alert("您的浏览器不支持 canvas 标签");
                return;
            }
            this.cxt=this.canvas.getContext('2d');
			this.cxt_bak = this.canvas_bak.getContext('2d');
			this.cxt_vertical=this.canvas_vertical.getContext('2d');
            this.cxt.lineJoin = "round";//context.lineJoin - 指定两条线段的连接方式
            this.cxt.lineWidth = this.opt.in_lineWidth;//线条的宽度
			this.cxt_bak.lineWidth = this.opt.in_lineWidth;//线条的宽度
			this.cxt.strokeStyle= this.opt.in_strokeStyle;
			this.cxt_bak.strokeStyle= this.opt.in_strokeStyle;
			
			this.cxt_vertical.lineWidth = this.opt.vt_lineWidth;//线条的宽度
			this.cxt_vertical.strokeStyle = this.opt.vt_strokeStyle;
			//修改文本大小及颜色
			this.cxt_vertical.font=this.opt.ABFont;
			this.cxt_vertical.fillStyle = this.opt.ABColor;
			
            this.iptClear=this.$(this.opt.clear_id);
            this.revocation=this.$(this.opt.revocation_id);
			
			this.changeIn=this.$(this.opt.in_paintID);
            this.changeOut=this.$(this.opt.out_paintID);
			this.changeBLine=this.$(this.opt.ban_lineID);
			
			this.w=this.canvas.width;//取画布的宽
            this.h=this.canvas.height;//取画布的高 
			this.bak_w=this.canvas_bak.width;//取画布的宽
            this.bak_h=this.canvas_bak.height;//取画布的高 
           
            this.touch =("createTouch" in document);//判定是否为手持设备
            this.StartEvent = this.touch ? "touchstart" : "mousedown";//支持触摸式使用相应的事件替代
			this.MoveEvent = this.touch ? "touchmove" : "mousemove";
			this.EndEvent = this.touch ? "touchend" : "mouseup";
			this.ClickEvent = this.touch ? "touchend" : "click";
			this.rightMenuEvent = this.touch ? "touchend" : "contextmenu";
            this.bind();
        },
		in_paintStyle:function(){
			this.whichpaint = "in";
			this.cxt.lineWidth = this.opt.in_lineWidth;//线条的宽度
			this.cxt_bak.lineWidth = this.opt.in_lineWidth;//线条的宽度
			this.cxt.strokeStyle= this.opt.in_strokeStyle;
			this.cxt_bak.strokeStyle= this.opt.in_strokeStyle;
		},
		out_paintStyle:function(){
			this.whichpaint = "out";
			this.cxt.lineWidth = this.opt.out_lineWidth;//线条的宽度
			this.cxt_bak.lineWidth = this.opt.out_lineWidth;//线条的宽度
			this.cxt.strokeStyle = this.opt.out_strokeStyle;
			this.cxt_bak.strokeStyle = this.opt.out_strokeStyle;
		},
		bline_paintStyle:function(){
			this.whichpaint = "bl";
			this.cxt.lineWidth = this.opt.bl_lineWidth;//线条的宽度
			this.cxt_bak.lineWidth = this.opt.bl_lineWidth;//线条的宽度
			this.cxt.strokeStyle = this.opt.bl_strokeStyle;
			this.cxt_bak.strokeStyle = this.opt.bl_strokeStyle;
		},
        bind:function()
        {
            var t=this;
            /*清除画布*/
            this.iptClear.onclick=function()
            {
                t.clear_data();
				t.clear();
				t.clear_vertical();
            };
            
			//鼠标按下，判断是否为右击，若为右击，则闭合操作
            this.canvas_bak['on'+t.StartEvent]=function(e)
            {   
				var touch=t.touch ? e.touches[0] : e; 
				//alert("1");
				if(touch.button==2){
					if(!t.canDraw){
						return ;
					}
					/*
					if(t.whichpaint == "bl"){
						if(t.x.length == 1){
							t.canDraw = false;
							t.lock = false;
							
							t.clear_bak();
							t.x = [];
							t.y = [];
							return;
						}
					}
					*/
					if(t.whichpaint != "bl"){
						//少于三个点时，不能闭合，继续画
						if(t.x.length < 3){
							return ;
						}
					
						//判断首尾闭合会不会交叉，交叉则返回
						var lastPX = t.x[0];
						var lastPY = t.y[0];
						var dx = t.x[t.x.length-1];
						var dy = t.y[t.y.length-1];
						for(var i = 1; i < t.x.length - 2; i++){
							var ax = t.x[i];
							var ay = t.y[i];
							var bx = t.x[i+1];
							var by = t.y[i+1];
							if(t.pointLineRelation(lastPX, lastPY, ax, ay, bx, by)*t.pointLineRelation(dx, dy, ax, ay, bx, by) > 0 ){
								continue;
							} else {
								if(t.pointLineRelation(ax, ay, dx, dy, lastPX, lastPY)*t.pointLineRelation(bx, by, dx, dy, lastPX, lastPY) < 0 ){
									return;
								}
							}
						}
						//最后闭合,首尾相连
						if(t.x[0] != t.x[t.x.length-1] || t.y[0] != t.y[t.y.length-1]){
							t.cxt.beginPath();
							t.cxt.moveTo(t.x[t.x.length-1] ,t.y[t.y.length-1]);
							t.cxt.lineTo(t.x[0] ,t.y[0]);//context.lineTo(x, y) , 将当前点与指定的点用一条笔直的路径连接起来
							t.cxt.stroke();
						}
					} else {
						//右键需要将上一点连上
						//多于三个点需要判断是否交叉
						var lastPX = e.clientX - t.canvas.getBoundingClientRect().left;
						var lastPY = e.clientY - t.canvas.getBoundingClientRect().top;
						if(t.x.length > 3){
							var dx = t.x[t.x.length-1];
							var dy = t.y[t.y.length-1];
							for(var i = 0; i < t.x.length - 2; i++){
								var ax = t.x[i];
								var ay = t.y[i];
								var bx = t.x[i+1];
								var by = t.y[i+1];
								if(t.pointLineRelation(lastPX, lastPY, ax, ay, bx, by)*t.pointLineRelation(dx, dy, ax, ay, bx, by) > 0 ){
									continue;
								} else {
									if(t.pointLineRelation(ax, ay, dx, dy, lastPX, lastPY)*t.pointLineRelation(bx, by, dx, dy, lastPX, lastPY) < 0 ){
										t.cross = true;
										return;
									}
								}
							}
						}
						//最后相连
						if(lastPX != t.x[t.x.length-1] || lastPY != t.y[t.y.length-1]){
							t.cxt.beginPath();
							t.cxt.moveTo(t.x[t.x.length-1] ,t.y[t.y.length-1]);
							t.cxt.lineTo(lastPX , lastPY);//context.lineTo(x, y) , 将当前点与指定的点用一条笔直的路径连接起来
							t.cxt.stroke();
							t.x.push(lastPX);
							t.y.push(lastPY);
						}
					}
					
					t.canDraw = false;
					t.cross = false;
					t.lock = false;
					
					t.clear_bak();
					
					t.xsave.push(t.x);
					t.ysave.push(t.y);
					
					t.imageData.push(t.canvas.toDataURL());
					
					if(t.whichpaint == "in"){
						t.domain.in_xsave.push(t.x);
						t.domain.in_ysave.push(t.y);
					} else if(t.whichpaint == "out"){
						t.domain.out_xsave.push(t.x);
						t.domain.out_ysave.push(t.y);
					} else if(t.whichpaint == "bl"){
						t.domain.bl_xsave.push(t.x);
						t.domain.bl_ysave.push(t.y);
						//画垂线
						t.verticalPoint = [];
						t.ABPoint = [];
						for(var i = 0; i < (t.x.length - 1); i++){
							t.drawVertical(t.x[i], t.y[i], t.x[i+1], t.y[i+1]);
						}
					}
					
					t.x = [];
					t.y = [];
					
					return;
				}
               				
            };
			
			//停止冒泡
			this.canvas_bak['on'+t.rightMenuEvent]=function(e)
            {   
				return false;		
            };
			
            /*鼠标移动事件*/
            this.canvas_bak['on'+t.MoveEvent]=function(e)
            {
                var touch=t.touch ? e.touches[0] : e;
                if(t.lock)//t.lock为true则执行
                {
                    var _x=e.clientX - t.canvas.getBoundingClientRect().left;//鼠标在画布上的x坐标，以画布左上角为起点
					var _y=e.clientY - t.canvas.getBoundingClientRect().top;//鼠标在画布上的y坐标，以画布左上角为起点 
					//若为画屏蔽区域，当点画在边缘附近，则将点值赋为0，即若靠近X轴边缘，则将Y赋值为0，若靠近Y轴边缘，则将X赋值为0
					if(t.whichpaint == "out"){
						_x = t.nearEdge(_x, t.edge_threshold, 0, t.w);
						_y = t.nearEdge(_y, t.edge_threshold, 0, t.h);
					}
					t.drawPoint(_x,_y);//绘制路线
				}

            };
			//鼠标单击，画点
			this.canvas_bak['on'+t.ClickEvent]=function(e)
            {
				//保证只能画一个检测区域，一条绊线
				if(t.whichpaint == "in"){
					if(t.domain.in_xsave.length == 1){
						return;
					}
				} else if(t.whichpaint == "bl"){
					if(t.domain.bl_xsave.length == 1){
						return;
					}
				}
				/*
				else if(t.whichpaint == "out"){
					//若检测区域未画，则不能画屏蔽区域
					if(t.domain.in_xsave.length == 0){
						return;
					}
				}
				*/
				
				var _x = e.clientX - t.canvas.getBoundingClientRect().left;
				var _y = e.clientY - t.canvas.getBoundingClientRect().top;
				//若为画屏蔽区域，当点画在边缘附近，则将点值赋为0，即若靠近X轴边缘，则将Y赋值为0，若靠近Y轴边缘，则将X赋值为0
				if(t.whichpaint == "out"){
					_x = t.nearEdge(_x, t.edge_threshold, 0, t.w);
					_y = t.nearEdge(_y, t.edge_threshold, 0, t.h);
				}
				
				//若在同一个地方点击了两次，则不变,不将此点加入数组
				if(_x == t.x[t.x.length-1] && _y == t.y[t.y.length-1]){
					return;
				}
				
				if(t.canDraw){
					/*
					//若为画屏蔽区域，则需要判断点是否在某一检测区域内，在其中某个检测区域内则允许
					if(t.whichpaint != "in"){
						var point = {"x":_x, "y":_y};
						var flag = false;            //true表示为在检测区内
						for(var i = 0; i < t.domain.in_xsave.length; i++){
							if(t.ptInPolygon(point, t.domain.in_xsave[i], t.domain.in_ysave[i])){
								flag = true;
								break;
							}
						}
						//若仍未false，表示不在任何一个检测区域内，不让画
						if(!flag){
							return;
						}
					}
					*/
				
					//画第三个点时，不能再同一条直线上
					if(t.x.length == 2){
						var ax = t.x[0];
						var ay = t.y[0];
						var bx = t.x[1];
						var by = t.y[1];
						if(t.pointLineRelation(_x, _y, ax, ay, bx, by)*t.pointLineRelation(dx, dy, ax, ay, bx, by) == 0 ){
							t.cross = true;
							return ;
						}
					}
					//从第四个点开始判断线段是否交叉，若交叉，则不将此点记录下来，让用户继续画
					if(t.x.length >= 3){
						var dx = t.x[t.x.length - 1];
						var dy = t.y[t.y.length - 1];
						for(var i = 0; i < t.x.length - 2; i++){
							var ax = t.x[i];
							var ay = t.y[i];
							var bx = t.x[i+1];
							var by = t.y[i+1];
							if(t.pointLineRelation(_x, _y, ax, ay, bx, by)*t.pointLineRelation(dx, dy, ax, ay, bx, by) > 0 ){
								continue;
							} else {
								if(t.pointLineRelation(ax, ay, dx, dy, _x, _y)*t.pointLineRelation(bx, by, dx, dy, _x, _y) < 0 ){
									t.cross = true;
									return;
								}
							}
						}
					}
					var image = new Image();	
					
					image.src = t.canvas_bak.toDataURL();
					image.onload = function(){
						t.cxt.drawImage(image , 0 ,0 , image.width , image.height , 0 ,0 , t.w , t.h);
						t.clear_bak();
					};
				} 
				/*
				else {
					//若画的是屏蔽区域，则第一点需要判断是否在检测区域
					if(t.whichpaint != "in"){
						var point = {"x":_x, "y":_y};
						var flag = false;            //true表示为在检测区内
						for(var i = 0; i < t.domain.in_xsave.length; i++){
							if(t.ptInPolygon(point, t.domain.in_xsave[i], t.domain.in_ysave[i])){
								flag = true;
								break;
							}
						}
						//若仍未false，表示不在任何一个检测区域内，不让画
						if(!flag){
							return;
						}
					}
				}
				*/
				
				t.x.push(_x);
				t.y.push(_y);
				t.cross = false;
				t.canDraw = true;
				t.lock = true;
            };
			//撤销一块区域
            this.revocation.onclick=function()
            {
                t.cancelDraw();
            };
			
            this.changeIn.onclick = function(){
				t.in_paintStyle();
			};
			
			this.changeOut.onclick = function(){
				t.out_paintStyle();
			};
			
			this.changeBLine.onclick = function(){
				t.bline_paintStyle();
			};
        },
        drawPoint:function(_x,_y)
        {								
			if(this.canDraw){
				this.clear_bak();
				
				this.cxt_bak.beginPath();
				this.cxt_bak.moveTo(this.x[this.x.length-1] ,this.y[this.y.length-1]);
				this.cxt_bak.lineTo(_x  ,_y );
				this.cxt_bak.stroke();
			}
        },
        //A、B两点的中垂线
        drawVertical:function(x1, y1, x2, y2){
			var midPos = {};
			midPos["x"] = (x1 + x2)/2;
			midPos["y"] = (y1 + y2)/2;
			var k;
			if((y2-y1) == 0){
				k = "nan";
			} else {
				k = -(x2-x1)/(y2-y1);
			}
			var len = this.opt.vertical_len;
			var des = this.addVertical(midPos, k, len);
			this.cxt_vertical.beginPath();
			this.cxt_vertical.moveTo(des[0].x, des[0].y);
			this.cxt_vertical.lineTo(des[1].x , des[1].y);
			this.cxt_vertical.stroke();
			//计算左右
			var vp = this.pointDirect(x1, y1, x2, y2, des[0], des[1]);
			this.verticalPoint.push(vp);
			//计算AB两点
			var desAB = this.addVertical(midPos, k, len+20);
			var vpAB = this.pointDirect(x1, y1, x2, y2, desAB[0], desAB[1]);
			this.ABPoint.push(vpAB);
			
			//写A、B
			this.cxt_vertical.fillText("A", vpAB.left.x, vpAB.left.y);
			this.cxt_vertical.fillText("B", vpAB.right.x, vpAB.right.y);
			
			//根据用户所选方向画箭头
			var direct = $("#" + this.opt.ban_dircID).attr("value");
			if(direct == 1){
				this.cxt_vertical.beginPath();
				var mpx = (vp.left.x + vp.right.x)/2;
				var mpy = (vp.left.y + vp.right.y)/2;
				var h = this.drawArrow(mpx, mpy, vp.right.x , vp.right.y);
				this.cxt_vertical.moveTo(vp.right.x , vp.right.y);
				this.cxt_vertical.lineTo(h.h1.x,h.h1.y);
				this.cxt_vertical.moveTo(vp.right.x , vp.right.y);
				this.cxt_vertical.lineTo(h.h2.x,h.h2.y);
				this.cxt_vertical.stroke();
			} else if(direct == 2){
				this.cxt_vertical.beginPath();
				var mpx = (vp.left.x + vp.right.x)/2;
				var mpy = (vp.left.y + vp.right.y)/2;
				var h = this.drawArrow(mpx, mpy, vp.left.x , vp.left.y);
				this.cxt_vertical.moveTo(vp.left.x , vp.left.y);
				this.cxt_vertical.lineTo(h.h1.x,h.h1.y);
				this.cxt_vertical.moveTo(vp.left.x , vp.left.y);
				this.cxt_vertical.lineTo(h.h2.x,h.h2.y);
				this.cxt_vertical.stroke();
			} else {
				this.cxt_vertical.beginPath();
				var mpx = (vp.left.x + vp.right.x)/2;
				var mpy = (vp.left.y + vp.right.y)/2;
				//画箭头1
				var h = this.drawArrow(mpx, mpy, vp.left.x , vp.left.y);
				this.cxt_vertical.moveTo(vp.left.x , vp.left.y);
				this.cxt_vertical.lineTo(h.h1.x,h.h1.y);
				this.cxt_vertical.moveTo(vp.left.x , vp.left.y);
				this.cxt_vertical.lineTo(h.h2.x,h.h2.y);
				this.cxt_vertical.stroke();
				//画箭头2
				var h = this.drawArrow(mpx, mpy, vp.right.x , vp.right.y);
				this.cxt_vertical.moveTo(vp.right.x , vp.right.y);
				this.cxt_vertical.lineTo(h.h1.x,h.h1.y);
				this.cxt_vertical.moveTo(vp.right.x , vp.right.y);
				this.cxt_vertical.lineTo(h.h2.x,h.h2.y);
				this.cxt_vertical.stroke();
			}
        },
        //根据直线方程计算点坐标
        cltPointX:function(k, b, y){
        	return ((y-b)/k);
        },
        cltPointY:function(k, b, x){
        	return (k*x - b);
        },
        //计算头部坐标
        drawArrow:function(sx, sy, ex, ey){
		    var theta=Math.atan((ex-sx)/(ey-sy));
		    var cep=this._scrollXOY(ex, ey, -theta);
		    var csp=this._scrollXOY(sx, sy,-theta);
		    var ch1={x:0,y:0};
		    var ch2={x:0,y:0};
		    var l=cep.y-csp.y;
		    ch1.x=cep.x+l*(this.opt.sharp||0.025);
		    ch1.y=cep.y-l*(this.opt.size||0.05);
		    ch2.x=cep.x-l*(this.opt.sharp||0.025);
		    ch2.y=cep.y-l*(this.opt.size||0.05);
		    var h1=this._scrollXOY(ch1.x, ch1.y, theta);
		    var h2=this._scrollXOY(ch2.x, ch2.y, theta);
		    return {
		        h1:h1,
		        h2:h2
		    };
        },
        //旋转坐标
        _scrollXOY:function(px, py, theta){
        	return {
    		    x:px*Math.cos(theta)+py*Math.sin(theta),
    		    y:py*Math.cos(theta)-px*Math.sin(theta)
        	};
        },
        //判断p1, p2哪个点在s->e的左、右
        pointDirect:function(sx, sy, ex, ey, p1, p2){
        	var dirc = {};
        	var flag = 0;
        	//先根据X增减来判断左右,若相等则根据Y增减来判断左右
        	if(sx == ex){
        		if(sy < ey){
        			if(p1.x > p2.x){
        				//P1为左，p2为右
        				flag = 1;
        			} else {
        				//P1为右，p2为左
        				flag = 0;
        			}
        		} else {
        			if(p1.x > p2.x){
        				//P1为右，p2为左
        				flag = 0;
        			} else {
        				//P1为左，p2为右
        				flag = 1;
        			}
        		}
        	} else if(sx > ex){
        		if(p1.y > p2.y){
    				//P1为左，p2为右
        			flag = 1;
    			} else {
    				//P1为右，p2为左
    				flag = 0;
    			}
        	} else {
        		if(p1.y > p2.y){
    				//P1为右，p2为左
        			flag = 0;
    			} else {
    				//P1为左，p2为右
    				flag = 1;
    			}
        	}
        	if(flag == 0){
        		dirc["right"] = p1;
				dirc["left"] = p2;
        	} else {
        		dirc["left"] = p1;
				dirc["right"] = p2;
        	}
        	return dirc;
        },
		//判断点C在线段的哪侧
		pointLineRelation:function(cx, cy, ax, ay, bx, by){
			var lr = (bx - ax)*(cy - ay) - (cx - ax)*(by - ay);
			return lr;
		},
		//判断点是否在检测区域内
		ptInPolygon:function(p, PolygonX, PolygonY){
			var nCross = 0;
            for(var i = 0; i < (PolygonX.length - 1); i++){ 
				var p1 = {"x":PolygonX[i], "y":PolygonY[i]};
				var p2 = {"x":PolygonX[i+1], "y":PolygonY[i+1]};
				var k = (p2.y - p1.y)/(p2.x - p1.x);
				var cond1 = (p1.x <= p.x) && (p.x < p2.x);
				var cond2 = (p2.x <= p.x) && (p.x < p1.x);
				var above = (p.y < (k*(p.x - p1.x) + p1.y));
				if((cond1 || cond2) && above){
					nCross++;
				}
            } 
            // 单边交点为偶数，点在多边形之外 ---
            return (nCross % 2 == 1); 
		},
		addVertical:function(midPoint, k, len){
			//添加垂线
			var dsePos = [];
			if(k == "nan"){
				dsePos[0] = {"x":midPoint.x, "y":(midPoint.y+len)};
				dsePos[1] = {"x":midPoint.x, "y":(midPoint.y-len)};
			} else {
				var xdes = Math.sqrt(len*len/(k*k+1));
				var desPosX = xdes + midPoint.x;
				var desPosY = k*(desPosX - midPoint.x) + midPoint.y;
				dsePos[0] = {"x":desPosX, "y":desPosY};
				var desPosX2 = (-1)*xdes + midPoint.x;
				var desPosY2 = k*(desPosX2 - midPoint.x) + midPoint.y;
				dsePos[1] = {"x":desPosX2, "y":desPosY2};
			}
			return dsePos;
		},
		changeDirc:function(dirc){
			this.clear_vertical();
			this.cxt_vertical.beginPath();
			if(dirc == 1){
				for(var i = 0; i < this.verticalPoint.length; i++){
					var vp = this.verticalPoint[i];
					var vpAB = this.ABPoint[i];
					
					//画主轴
					this.cxt_vertical.moveTo(vp.left.x, vp.left.y);
					this.cxt_vertical.lineTo(vp.right.x , vp.right.y);
					this.cxt_vertical.stroke();
					
					//写A、B
					this.cxt_vertical.fillText("A", vpAB.left.x, vpAB.left.y);
					this.cxt_vertical.fillText("B", vpAB.right.x, vpAB.right.y);
					
					var mpx = (vp.left.x + vp.right.x)/2;
					var mpy = (vp.left.y + vp.right.y)/2;
					var h = this.drawArrow(mpx, mpy, vp.right.x , vp.right.y);
					this.cxt_vertical.moveTo(vp.right.x , vp.right.y);
					this.cxt_vertical.lineTo(h.h1.x,h.h1.y);
					this.cxt_vertical.moveTo(vp.right.x , vp.right.y);
					this.cxt_vertical.lineTo(h.h2.x,h.h2.y);
					this.cxt_vertical.stroke();
				}
			} else if(dirc == 2){
				for(var i = 0; i < this.verticalPoint.length; i++){
					var vp = this.verticalPoint[i];
					var vpAB = this.ABPoint[i];
					
					//画主轴
					this.cxt_vertical.moveTo(vp.left.x, vp.left.y);
					this.cxt_vertical.lineTo(vp.right.x , vp.right.y);
					this.cxt_vertical.stroke();
					
					//写A、B
					this.cxt_vertical.fillText("A", vpAB.left.x, vpAB.left.y);
					this.cxt_vertical.fillText("B", vpAB.right.x, vpAB.right.y);
					
					var mpx = (vp.left.x + vp.right.x)/2;
					var mpy = (vp.left.y + vp.right.y)/2;
					var h = this.drawArrow(mpx, mpy, vp.left.x , vp.left.y);
					this.cxt_vertical.moveTo(vp.left.x , vp.left.y);
					this.cxt_vertical.lineTo(h.h1.x,h.h1.y);
					this.cxt_vertical.moveTo(vp.left.x , vp.left.y);
					this.cxt_vertical.lineTo(h.h2.x,h.h2.y);
					this.cxt_vertical.stroke();
				}
			} else {
				for(var i = 0; i < this.verticalPoint.length; i++){
					var vp = this.verticalPoint[i];
					var vpAB = this.ABPoint[i];
					
					//画主轴
					this.cxt_vertical.moveTo(vp.left.x, vp.left.y);
					this.cxt_vertical.lineTo(vp.right.x , vp.right.y);
					this.cxt_vertical.stroke();
					
					//写A、B
					this.cxt_vertical.fillText("A", vpAB.left.x, vpAB.left.y);
					this.cxt_vertical.fillText("B", vpAB.right.x, vpAB.right.y);
					
					var mpx = (vp.left.x + vp.right.x)/2;
					var mpy = (vp.left.y + vp.right.y)/2;
					//画箭头1
					var h = this.drawArrow(mpx, mpy, vp.left.x , vp.left.y);
					this.cxt_vertical.moveTo(vp.left.x , vp.left.y);
					this.cxt_vertical.lineTo(h.h1.x,h.h1.y);
					this.cxt_vertical.moveTo(vp.left.x , vp.left.y);
					this.cxt_vertical.lineTo(h.h2.x,h.h2.y);
					this.cxt_vertical.stroke();
					//画箭头2
					var h = this.drawArrow(mpx, mpy, vp.right.x , vp.right.y);
					this.cxt_vertical.moveTo(vp.right.x , vp.right.y);
					this.cxt_vertical.lineTo(h.h1.x,h.h1.y);
					this.cxt_vertical.moveTo(vp.right.x , vp.right.y);
					this.cxt_vertical.lineTo(h.h2.x,h.h2.y);
					this.cxt_vertical.stroke();
				}
			}
		},
        clear:function()
        {
			this.cxt.clearRect(0, 0, this.w, this.h);//清除画布，左上角为起点
        },
		clear_data:function(){
			this.x=[];//记录鼠标移动时的X坐标
            this.y=[];//记录鼠标移动时的Y坐标
			
			this.xsave = [];
			this.ysave = [];
			this.cross = false;
			
			this.imageData = [];
			
			this.verticalPoint = [];
			this.ABPoint = [];
			
			this.domain.out_xsave = [];
			this.domain.out_ysave = [];
			this.domain.in_xsave = [];
			this.domain.in_ysave = [];
			this.domain.bl_xsave = [];
			this.domain.bl_ysave = [];
			
            this.lock=false;//鼠标移动前，判断鼠标是否按下
			this.canDraw = true;
		},
		clear_bak:function()
        {
            this.cxt_bak.clearRect(0, 0, this.bak_w, this.bak_h);//清除画布，左上角为起点
        },
        clear_vertical:function()
        {
            this.cxt_vertical.clearRect(0, 0, this.bak_w, this.bak_h);
        },
		cancelDraw:function(){
			//每次撤销一块闭合区域
			if(this.xsave.length == 0){
				return;
			}
			var popx = this.xsave.pop();
			var popy = this.ysave.pop();
			
			//删除对应区域的框
			var inxlen = this.domain.in_xsave.length;
			var inylen = this.domain.in_ysave.length;
			var outxlen = this.domain.out_xsave.length;
			var outylen = this.domain.out_ysave.length;
			var blxlen = this.domain.bl_xsave.length;
			var blylen = this.domain.bl_ysave.length;
			
			if(this.is_equal(popx, this.domain.in_xsave[inxlen-1])&&this.is_equal(popy, this.domain.in_ysave[inylen-1])){
				this.domain.in_xsave.pop();
				this.domain.in_ysave.pop();
			} else if(this.is_equal(popx, this.domain.out_xsave[outxlen-1])&&this.is_equal(popy, this.domain.out_ysave[outylen-1])){
				this.domain.out_xsave.pop();
				this.domain.out_ysave.pop();
			} else if(this.is_equal(popx, this.domain.bl_xsave[blxlen-1])&&this.is_equal(popy, this.domain.bl_ysave[blylen-1])){
				this.domain.bl_xsave.pop();
				this.domain.bl_ysave.pop();
				//需要将垂线clear
				this.clear_vertical();
				this.verticalPoint = [];
				this.ABPoint = [];
			}
			
			//清除画布
			this.clear();
			var image = new Image();
			var t = this;
			this.imageData.pop();
			if(this.imageData.length == 0){
				return;
			}
			image.src = this.imageData[this.imageData.length - 1];
			image.onload = function(){
				t.cxt.drawImage(image , 0 ,0 , image.width , image.height , 0 ,0 , t.w , t.h);
				t.clear_bak();
			};
		},
		is_equal:function(a, b){
			//pop完居然是undefined，所以加此条判断
			if(!b){
				return false;
			}
			for(var i = 0; i < a.length; a++){
				if(a[i] != b[i]){
					return false;
				}
			}
			return true;
		},
        preventDefault:function(e){
            /*阻止默认*/
			//if(this.touch)touch.preventDefault();
			//else window.event.returnValue = false;
			if(window.event){
				e.cancelBubble=true;
			} else {
				e.stopPropagation();
			}
        },
		getInX:function(){
			return this.domain.in_xsave;
		},
		getInY:function(){
			return this.domain.in_ysave;
		},
		getOutX:function(){
			return this.domain.out_xsave;
		},
		getOutY:function(){
			return this.domain.out_ysave;
		},
		getBanLineX:function(){
			return this.domain.bl_xsave;
		},
		getBanLineY:function(){
			return this.domain.bl_ysave;
		},
		isDraw:function(){
			return this.lock;
		},
		/**
		 * 判断点是否在边缘（上、下边界）附近，若在上、下边界附近，则将值赋为上、下边界值
		 */
		nearEdge:function(value, threshold, min_edge, max_edge){
			if(value <= threshold){
				return min_edge;
			} else if(value >= (max_edge - threshold)){
				return max_edge;
			}
			return value;
		}
    };

