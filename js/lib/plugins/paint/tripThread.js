var dash_pattern = 5;
var vertical_len = 10;
var vertical_strokeStyle = "#000FFE";
var context_text_color = "white";
var lineBlockHalfWidth = 3;
var lineChooseBlockHalfWidth = 2;

// 画绊线
function Thread(x, y, threadLength) {
	var points = [];
	points.push(new Point(x, y));
	points.push(new Point(x + threadLength, y));
	return points;
}

// 画虚线
CanvasRenderingContext2D.prototype.dashedLineTo = function(fromX, fromY, toX,
		toY, pattern) {
	// default interval distance -> 5px
	if (typeof pattern === "undefined") {
		pattern = 5;
	}

	// calculate the delta x and delta y
	var dx = (toX - fromX);
	var dy = (toY - fromY);
	var distance = Math.floor(Math.sqrt(dx * dx + dy * dy));
	var dashlineInteveral = (pattern <= 0) ? distance : (distance / pattern);
	var deltay = (dy / distance) * pattern;
	var deltax = (dx / distance) * pattern;

	// draw dash line
	this.beginPath();
	for (var dl = 0; dl < dashlineInteveral; dl++) {
		if (dl % 2) {
			this.lineTo(fromX + dl * deltax, fromY + dl * deltay);
		} else {
			this.moveTo(fromX + dl * deltax, fromY + dl * deltay);
		}
	}
	this.stroke();
};

var TripThread = function(points, strokeStyle, lineWidth, type, direct, number) {
	if(!number){
		number = 0;
	}
	this.points = points;
	this.strokeStyle = strokeStyle; // 不同绊线类型，颜色不同
	this.lineWidth = lineWidth; // 画线宽度
	this.type = type; // 记录所画图形属于那种类型——4：绊线
	this.direct = direct; // 绊线方向
	this.number = number;       //记录条件编号
};

TripThread.prototype = {
	getPoints : function() {// 获取绊线的点
		return this.points;
	},
	getNumber : function() {// 获取绊线的点
		return this.number;
	},
	//获取归一化后的序列
	getNormalPoints : function(width, height) {
		var points = this.points;
		var normal = [];
		for(var i = 0; i < points.length; i++){
				/*var x = Math.floor((points[i].x*1024)/width);
				var y = Math.floor((points[i].y*1024)/height);
				if(x == 1024){
					x = 1023;
				}
				if(y == 1024){
					y = 1023;
				}*///xss hide
			var _W = $('#heatmap_server').attr('img_oriwidth');//大图宽
			var _H = $('#heatmap_server').attr('img_oriheight');//大图高
			var _w = width;//小图宽
			var _h = height;//小图高
			
			if(_w==null || _h==null){
				normal.push({"x":points[i].x, "y":points[i].y});
			} else {
				//以下改为实际定位
//				var x = points[i].x;
//				var y = points[i].y;
				var x = Math.floor(points[i].x*(_W/_w)*(8192/_W));
				var y = Math.floor(points[i].y*(_H/_h)*(8192/_H));
				normal.push({"x":x, "y":y});
			}
		}
		return normal;
	},
	// 生成绊线虚框，用于拖动
	getBorder : function() {
		var points = this.points;
		// 垂线算上，以免垂线戳出去
		var des = this.calVertical(points[0].x, points[0].y, points[1].x,
				points[1].y);
		var minx = points[0].x;
		var miny = points[0].y;
		var maxx = points[0].x;
		var maxy = points[0].y;
		for (var i = 0; i < points.length; i++) {
			var point = points[i];
			if (point.x > maxx)
				maxx = point.x;
			if (point.y > maxy)
				maxy = point.y;
			if (point.x < minx)
				minx = point.x;
			if (point.y < miny)
				miny = point.y;
		}
		for (var i = 0; i < des.length; i++) {
			var point = des[i];
			if (point.x > maxx)
				maxx = point.x;
			if (point.y > maxy)
				maxy = point.y;
			if (point.x < minx)
				minx = point.x;
			if (point.y < miny)
				miny = point.y;
		}
		var border = Rectangle(minx - 5, miny - 5, maxx - minx + 10, maxy
				- miny + 10);
		return border;
	},
	// 获取绊线的路径
	createPath : function(context) {// 创建路径，context相当于引用，会修改
		var points = this.points;
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);
		for (var i = 1; i < points.length; ++i) {
			context.lineTo(points[i].x, points[i].y);
		}
	},
	stroke : function(context) {// 描边
		context.save();
		this.createPath(context);
		context.strokeStyle = this.strokeStyle;
		context.lineWidth = this.lineWidth;
		context.stroke();
		context.restore();
		if(this.number != 0){
			context.fillStyle = context_text_color;
			context.font = "20px Calibri";
			context.fillText(this.number, this.points[0].x-10, this.points[0].y-10);    //写上条件
		}
	},
	// 获取绊线边框路径
	createBorderPath : function(context) {// 创建路径，context相当于引用，会修改
		var border = this.getBorder();
		context.beginPath();
		context.moveTo(border[0].x, border[0].y);
		for (var i = 1; i < border.length; ++i) {
			context.lineTo(border[i].x, border[i].y);
		}
		context.closePath();
	},
	// 虚线画绊线边框
	strokeBorder : function(context) {
		context.save();
		var border = this.getBorder();
		context.beginPath();
		context.strokeStyle = "#dedede";
		context.lineWidth = 1;//xss
		context.moveTo(border[0].x, border[0].y);
		for (var i = 1; i < border.length; ++i) {
			context.dashedLineTo(border[i - 1].x, border[i - 1].y, border[i].x,
					border[i].y, dash_pattern);
		}
		context.dashedLineTo(border[i - 1].x, border[i - 1].y, border[0].x,
				border[0].y, dash_pattern);
		context.restore();
	},
	// 计算垂线
	calVertical : function(x1, y1, x2, y2) {
		var midPoint = {};
		midPoint["x"] = (x1 + x2) / 2;
		midPoint["y"] = (y1 + y2) / 2;
		var k;
		if ((y2 - y1) == 0) {
			k = "nan";
		} else {
			k = -(x2 - x1) / (y2 - y1);
		}
		var len = vertical_len;
		var dsePos = [];
		if (k == "nan") {
			dsePos[0] = {
				"x" : midPoint.x,
				"y" : (midPoint.y + len)
			};
			dsePos[1] = {
				"x" : midPoint.x,
				"y" : (midPoint.y - len)
			};
		} else {
			var xdes = Math.sqrt(len * len / (k * k + 1));
			var desPosX = xdes + midPoint.x;
			var desPosY = k * (desPosX - midPoint.x) + midPoint.y;
			dsePos[0] = {
				"x" : desPosX,
				"y" : desPosY
			};
			var desPosX2 = (-1) * xdes + midPoint.x;
			var desPosY2 = k * (desPosX2 - midPoint.x) + midPoint.y;
			dsePos[1] = {
				"x" : desPosX2,
				"y" : desPosY2
			};
		}
		return dsePos;
	},
	// 判断p1, p2哪个点在s->e的左、右
	pointDirect : function(sx, sy, ex, ey, p1, p2) {
		var dirc = {};
		var flag = 0;
		// 先根据X增减来判断左右,若相等则根据Y增减来判断左右
		if (sx == ex) {
			if (sy < ey) {
				if (p1.x > p2.x) {
					// P1为左，p2为右
					flag = 1;
				} else {
					// P1为右，p2为左
					flag = 0;
				}
			} else {
				if (p1.x > p2.x) {
					// P1为右，p2为左
					flag = 0;
				} else {
					// P1为左，p2为右
					flag = 1;
				}
			}
		} else if (sx > ex) {
			if (p1.y > p2.y) {
				// P1为左，p2为右
				flag = 1;
			} else {
				// P1为右，p2为左
				flag = 0;
			}
		} else {
			if (p1.y > p2.y) {
				// P1为右，p2为左
				flag = 0;
			} else {
				// P1为左，p2为右
				flag = 1;
			}
		}
		if (flag == 0) {
			dirc["right"] = p1;
			dirc["left"] = p2;
		} else {
			dirc["left"] = p1;
			dirc["right"] = p2;
		}
		return dirc;
	},
	// 计算头部坐标
	calArrow : function(sx, sy, ex, ey) {
		var theta = Math.atan((ex - sx) / (ey - sy));
		var cep = this._scrollXOY(ex, ey, -theta);
		var csp = this._scrollXOY(sx, sy, -theta);
		var ch1 = {
			x : 0,
			y : 0
		};
		var ch2 = {
			x : 0,
			y : 0
		};
		var l = cep.y - csp.y;
		ch1.x = cep.x + l * 0.4;
		ch1.y = cep.y - l * 0.4;
		ch2.x = cep.x - l * 0.4;
		ch2.y = cep.y - l * 0.4;
		var h1 = this._scrollXOY(ch1.x, ch1.y, theta);
		var h2 = this._scrollXOY(ch2.x, ch2.y, theta);
		return {
			h1 : h1,
			h2 : h2
		};
	},
	// 旋转坐标
	_scrollXOY : function(px, py, theta) {
		return {
			x : px * Math.cos(theta) + py * Math.sin(theta),
			y : py * Math.cos(theta) - px * Math.sin(theta)
		};
	},
	// A、B两点的中垂线
	drawVertical : function(x1, y1, x2, y2, context) {
		var des = this.calVertical(x1, y1, x2, y2);
		// 画垂线
		context.strokeStyle = vertical_strokeStyle;
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(des[0].x, des[0].y);
		context.lineTo(des[1].x, des[1].y);
		context.stroke();
		// 计算左右
		var vp = this.pointDirect(x1, y1, x2, y2, des[0], des[1]);

		// 根据用户所选方向画箭头
		var direct = this.direct;
		if (direct == 1) {
			context.beginPath();
			var mpx = (vp.left.x + vp.right.x) / 2;
			var mpy = (vp.left.y + vp.right.y) / 2;
			var h = this.calArrow(mpx, mpy, vp.right.x, vp.right.y);
			context.moveTo(vp.right.x, vp.right.y);
			context.lineTo(h.h1.x, h.h1.y);
			context.moveTo(vp.right.x, vp.right.y);
			context.lineTo(h.h2.x, h.h2.y);
			context.stroke();
		} else if (direct == 2) {
			context.beginPath();
			var mpx = (vp.left.x + vp.right.x) / 2;
			var mpy = (vp.left.y + vp.right.y) / 2;
			var h = this.calArrow(mpx, mpy, vp.left.x, vp.left.y);
			context.moveTo(vp.left.x, vp.left.y);
			context.lineTo(h.h1.x, h.h1.y);
			context.moveTo(vp.left.x, vp.left.y);
			context.lineTo(h.h2.x, h.h2.y);
			context.stroke();
		} else {
			context.beginPath();
			var mpx = (vp.left.x + vp.right.x) / 2;
			var mpy = (vp.left.y + vp.right.y) / 2;
			// 画箭头1
			var h = this.calArrow(mpx, mpy, vp.left.x, vp.left.y);
			context.moveTo(vp.left.x, vp.left.y);
			context.lineTo(h.h1.x, h.h1.y);
			context.moveTo(vp.left.x, vp.left.y);
			context.lineTo(h.h2.x, h.h2.y);
			context.stroke();
			// 画箭头2
			var h = this.calArrow(mpx, mpy, vp.right.x, vp.right.y);
			context.moveTo(vp.right.x, vp.right.y);
			context.lineTo(h.h1.x, h.h1.y);
			context.moveTo(vp.right.x, vp.right.y);
			context.lineTo(h.h2.x, h.h2.y);
			context.stroke();
		}
	},
	// 选中多边形，连接点处画上方框
	block : function(context) {
		// 方框
		var points = this.points;
		for (var i = 0; i < points.length; ++i) {
			var points_block = Rectangle(points[i].x - lineBlockHalfWidth, points[i].y - lineBlockHalfWidth, lineBlockHalfWidth*2,
					lineBlockHalfWidth*2);
			var polygon = new Polygon(points_block, block_StrokeStyle,block_StrokeFillStyle, 2, 0);
			polygon.stroke(context);
		}
	},
	// 获取定点对应方框数组序列,方框会比画的框大
	getBlocks : function() {
		// 方框生成
		var points = this.points;
		var blocks = [];
		for (var i = 0; i < points.length; ++i) {
			var points_block = Rectangle(points[i].x - lineChooseBlockHalfWidth, points[i].y - lineChooseBlockHalfWidth,
					lineChooseBlockHalfWidth*2, lineChooseBlockHalfWidth*2);
			var polygon = new Polygon(points_block, block_StrokeStyle,block_StrokeFillStyle, 2, 0);
			blocks.push(polygon);
		}
		return blocks;
	},
}
