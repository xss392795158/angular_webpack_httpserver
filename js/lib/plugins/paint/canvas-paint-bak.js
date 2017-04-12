var paint={	
		opt:{
			"canvas":"canvas",
			"canvas_bak":"canvas_bak",
			"canvas_bak_zIndex":5,
			"in_lineWidth":2,
			"out_lineWidth":4,
			"in_strokeStyle":"#000",
			"out_strokeStyle":"red",
			"clear_id":"clear",
			"revocation_id":"revocation",
			"in_paintID":"in_paint",
			"out_paintID":"out_paint"
		},
		domain:{
			"out_xsave":[],
			"out_ysave":[],
			"in_xsave":[],
			"in_ysave":[]
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
			
			this.imageData = [];
			
			this.domain.out_xsave = [];
			this.domain.out_ysave = [];
			this.domain.in_xsave = [];
			this.domain.in_ysave = [];
			
            this.lock=false;//鼠标移动前，判断鼠标是否按下
			this.canDraw = true;    //判断是否正可以画图，true则为可以开始画，false为正在画
            
            this.$=function(id){return typeof id=="string"?document.getElementById(id):id;};
            this.canvas=this.$(this.opt.canvas);
			this.canvas_bak = this.$(this.opt.canvas_bak);
			this.canvas_bak.zIndex = this.opt.canvas_bak_zIndex;
            if (this.canvas.getContext) {
            } else {
                alert("您的浏览器不支持 canvas 标签");
                return;
            }
            this.cxt=this.canvas.getContext('2d');
			this.cxt_bak = this.canvas_bak.getContext('2d');
            this.cxt.lineJoin = "round";//context.lineJoin - 指定两条线段的连接方式
            this.cxt.lineWidth = this.opt.in_lineWidth;//线条的宽度
			this.cxt_bak.lineWidth = this.opt.in_lineWidth;//线条的宽度
			this.cxt.strokeStyle= this.opt.in_strokeStyle;
			this.cxt_bak.strokeStyle= this.opt.in_strokeStyle;
            this.iptClear=this.$(this.opt.clear_id);
            this.revocation=this.$(this.opt.revocation_id);
			
			this.changeIn=this.$(this.opt.in_paintID);
            this.changeOut=this.$(this.opt.out_paintID);
			
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
			this.dbClickEvent = this.touch ? "touchend" : "dblclick";
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
        bind:function()
        {
            var t=this;
            /*清除画布*/
            this.iptClear.onclick=function()
            {
                t.clear_data();
				t.clear();
            };
            
			//鼠标按下，判断是否为右击，若为右击，则闭合等操作
            this.canvas_bak['on'+t.StartEvent]=function(e)
            {   
				var touch=t.touch ? e.touches[0] : e; 
				if(touch.button==2){
					if(!t.canDraw){
						return ;
					}
					
					//少于三个点时，不能闭合，继续画
					if(t.x.length < 2){
						return ;
					}
					
					var _x=e.clientX - t.canvas.getBoundingClientRect().left;//鼠标在画布上的x坐标，以画布左上角为起点
					var _y=e.clientY - t.canvas.getBoundingClientRect().top;//鼠标在画布上的y坐标，以画布左上角为起点
					
					//从第四个点开始判断线段是否交叉，若交叉，则不闭合，继续画
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
									return;
								}
							}
						}
						//判断闭合的那条线是否不相交
						var dx = t.x[0];
						var dy = t.y[0];
						for(var j = t.x.length - 1; j > 1 ; j--){
							var ax = t.x[j];
							var ay = t.y[j];
							var bx = t.x[j-1];
							var by = t.y[j-1];
							if(t.pointLineRelation(_x, _y, ax, ay, bx, by)*t.pointLineRelation(dx, dy, ax, ay, bx, by) > 0 ){
								continue;
							} else {
								if(t.pointLineRelation(ax, ay, dx, dy, _x, _y)*t.pointLineRelation(bx, by, dx, dy, _x, _y) < 0 ){
									return;
								}
							}
						}
					}
					
					t.canDraw = false;
					t.lock = false;
					
					//点击右键时，点击处与上一个点的连线需要画上
					if(_x != t.x[t.x.length-1] || _y != t.y[t.y.length-1]){
						//清楚cxt_bak的
						t.clear_bak();
						t.cxt.beginPath();
						t.cxt.moveTo(t.x[t.x.length-1] ,t.y[t.y.length-1]);
						t.cxt.lineTo(_x , _y);//context.lineTo(x, y) , 将当前点与指定的点用一条笔直的路径连接起来
						t.cxt.stroke();
						t.x.push(_x);
						t.y.push(_y);
					}
					
					//若页面上只有一个点，则不需首尾相连
					if(t.x.length >= 3){
						//最后闭合,首尾相连
						if(t.x[0] != t.x[t.x.length-1] || t.y[0] != t.y[t.y.length-1]){
							t.cxt.beginPath();
							t.cxt.moveTo(t.x[t.x.length-1] ,t.y[t.y.length-1]);
							t.cxt.lineTo(t.x[0] ,t.y[0]);//context.lineTo(x, y) , 将当前点与指定的点用一条笔直的路径连接起来
							t.cxt.stroke();
						}
					}
					
					t.xsave.push(t.x);
					t.ysave.push(t.y);
					
					t.imageData.push(t.canvas.toDataURL());
					
					if(t.whichpaint == "in"){
						t.domain.in_xsave.push(t.x);
						t.domain.in_ysave.push(t.y);
					} else {
						t.domain.out_xsave.push(t.x);
						t.domain.out_ysave.push(t.y);
					}
					
					t.x = [];
					t.y = [];
					
					return;
				}
               				
            };
			//鼠标双击事件，闭合等操作，(执行dblclick之前居然先执行了click)
			this.canvas_bak['on'+t.dbClickEvent]=function(e)
            {   
				if(!t.canDraw){
					return ;
				}
				//click判断已经判断为相交，则不能画线、闭合等
				if(t.cross){
					return;
				}
				
				if(t.x.length < 3){
					return;
				}
				
				var touch=t.touch ? e.touches[0] : e; 
				var _x=e.clientX - t.canvas.getBoundingClientRect().left;//鼠标在画布上的x坐标，以画布左上角为起点
				var _y=e.clientY - t.canvas.getBoundingClientRect().top;//鼠标在画布上的y坐标，以画布左上角为起点
				
				//首尾相连是否有线段相交，若有，则继续画
				if(t.x.length >= 3){
					//判断闭合的那条线是否相交
					var dx = t.x[0];
					var dy = t.y[0];
					for(var j = t.x.length - 1; j > 1 ; j--){
						var ax = t.x[j];
						var ay = t.y[j];
						var bx = t.x[j-1];
						var by = t.y[j-1];
						if(t.pointLineRelation(_x, _y, ax, ay, bx, by)*t.pointLineRelation(dx, dy, ax, ay, bx, by) > 0 ){
							continue;
						} else {
							if(t.pointLineRelation(ax, ay, dx, dy, _x, _y)*t.pointLineRelation(bx, by, dx, dy, _x, _y) < 0 ){
								return;
							}
						}
					}
				}
				
				
				t.canDraw = false;
				t.lock = false;
				
				//若页面上只有一个点，则不需首尾相连
				if(t.x.length >= 3){
					//最后闭合,首尾相连
					if(t.x[0] != t.x[t.x.length-1] || t.y[0] != t.y[t.y.length-1]){
						t.cxt.beginPath();
						t.cxt.moveTo(t.x[t.x.length-1] ,t.y[t.y.length-1]);
						t.cxt.lineTo(t.x[0] ,t.y[0]);//context.lineTo(x, y) , 将当前点与指定的点用一条笔直的路径连接起来
						t.cxt.stroke();
					}
				}
				//当只是双击时，不将值插入数组
				if(t.x.length > 1){
					t.xsave.push(t.x);
					t.ysave.push(t.y);
					
					t.imageData.push(t.canvas.toDataURL());
					
					if(t.whichpaint == "in"){
						t.domain.in_xsave.push(t.x);
						t.domain.in_ysave.push(t.y);
					} else {
						t.domain.out_xsave.push(t.x);
						t.domain.out_ysave.push(t.y);
					}
				}				

				t.x = [];
				t.y = [];
				
				return;
				
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
                    t.drawPoint(_x,_y);//绘制路线
				}

            };
			//鼠标单击，画点
			this.canvas_bak['on'+t.ClickEvent]=function(e)
            {
				var _x = e.clientX - t.canvas.getBoundingClientRect().left;
				var _y = e.clientY - t.canvas.getBoundingClientRect().top;
				//若在同一个地方点击了两次，则不变,不将此点加入数组
				if(_x == t.x[t.x.length-1] || _y == t.y[t.y.length-1]){
					return;
				}
				
				if(t.canDraw){
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
					//从第四个点开始判断线段是否交叉，若交叉，则不将词典记录下来，让用户继续画
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
		//判断点C在线段的哪侧
		pointLineRelation:function(cx, cy, ax, ay, bx, by){
			var lr = (bx - ax)*(cy - ay) - (cx - ax)*(by - ay);
			return lr;
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
			
			this.domain.out_xsave = [];
			this.domain.out_ysave = [];
			this.domain.in_xsave = [];
			this.domain.in_ysave = [];
			this.outcross = false;
			
            this.lock=false;//鼠标移动前，判断鼠标是否按下
			this.canDraw = true;
		},
		clear_bak:function()
        {
            this.cxt_bak.clearRect(0, 0, this.bak_w, this.bak_h);//清除画布，左上角为起点
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
			
			if(this.is_equal(popx, this.domain.in_xsave[inxlen-1])&&this.is_equal(popy, this.domain.in_ysave[inylen-1])){
				this.domain.in_xsave.pop();
				this.domain.in_ysave.pop();
			} else if(this.is_equal(popx, this.domain.out_xsave[outxlen-1])&&this.is_equal(popy, this.domain.out_ysave[outylen-1])){
				this.domain.out_xsave.pop();
				this.domain.out_ysave.pop();
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
			/*
			for(var i = 0; i < this.xsave.length; i++){
				var xArray = this.xsave[i];
				var yArray = this.ysave[i];
				this.cxt.beginPath();
				this.cxt.moveTo(xArray[0], yArray[0]);
				for(var j = 1; j < xArray.length; j++){
					this.cxt.lineTo(xArray[j], yArray[j]);
				}
				this.cxt.lineTo(xArray[0], yArray[0]);
				this.cxt.stroke();
			}
			*/
			
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
		isDraw:function(){
			return this.lock;
		}
    };
