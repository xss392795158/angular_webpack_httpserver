var block_StrokeStyle = "#ffe400";
var block_StrokeFillStyle = "transparent";
var border_StrokeStyle = "#dedede";
var context_text_color = "white";
var polygonBlockHalfWidth = 3;
var polygonChooseBlockHalfWidth = 2;
var polygonOutBorderDeviation = 14;
var PIC_WIDTH = 600;

// 窗口坐标转canvas坐标
function windowToCanvas(x, y, canvas) {
	var bbox = canvas.getBoundingClientRect();
	return {
		x : x - bbox.left,
		y : y - bbox.top
	};
}

// 画矩形
function Rectangle(x, y, width, height) {
	var points = [];
	points.push(new Point(x, y));
	points.push(new Point(x + width, y));
	points.push(new Point(x + width, y + height));
	points.push(new Point(x, y + height));
	return points;
}

// 多边形偏移,每个点偏移量相同
function deviate(points, posx, posy) {
	var maxHeight = $("#canvas_show").attr("height");
	for (var i = 0; i < points.length; i++) {
		var afterx = points[i].x + posx;
		var aftery = points[i].y + posy;
		//超出边界，拖动不改变
		if(afterx > PIC_WIDTH || afterx < 0 || aftery > maxHeight || aftery < 0){
			return points;
		}
	}
	for (var i = 0; i < points.length; i++) {
		points[i].x = points[i].x + posx;
		points[i].y = points[i].y + posy;
	}
	return points;
}

var Point = function(x, y) {
	this.x = x;
	this.y = y;
};

var Polygon = function(points, strokeStyle, fillStyle , lineWidth, type, number) {
	if(!number){
		number = 0;
	}
	this.points = points;
	this.strokeStyle = strokeStyle; // 不同区域类型，颜色不同
	this.fillStyle = fillStyle;
	this.lineWidth = lineWidth; // 画线宽度
	this.type = type; // 记录所画图形属于那种类型——1：检测区域，2：屏蔽区域，3：不经过区域
	this.number = number;           //记录条件编号
	this.gridStrokeStyle = "lightgray";
	this.gridFillStyle = "#fff";
};

Polygon.prototype = {
	getPoints : function() {// 获取多边形所有顶点
		return this.points;
	},
	getNumber : function() {// 获取多边形序号
		return this.number;
	},
	//获取归一化后的序列
	getNormalPoints : function(width, height) {
		var points = this.points;
		var normal = [];
		var windowWidth=$(window).width(); 
		var windowHeight=$(window).height(); 
		for(var i = 0; i < points.length; i++){
				/*var x = Math.floor((points[i].x*windowWidth)/width);
				var y = Math.floor((points[i].y*windowHeight)/height);
				if(x == windowWidth){
					x = windowWidth-1;
				}
				if(y == windowHeight){
					y = windowHeight-1;
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
	createPath : function(context) {// 创建多边形路径，context相当于引用，会修改
		var points = this.points;
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);
		for (var i = 1; i < points.length; ++i) {
			context.lineTo(points[i].x, points[i].y);
		}
		context.closePath();
	},
	stroke : function(context) {// 对多边形描边
		context.save();
		this.createPath(context);
		context.strokeStyle = this.strokeStyle;
		context.lineWidth = this.lineWidth;
		context.stroke();
		context.restore();
		if(this.number != 0){
			context.fillStyle = context_text_color;
			context.font = "20px Calibri";
			context.fillText(this.number, this.points[0].x+5, this.points[0].y+18);    //写上条件
		}
	},
	// 生成区域虚框，用于整体放大缩小
	getBorder : function() {
		var points = this.points;
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
		var border = Rectangle(minx - polygonOutBorderDeviation, miny - polygonOutBorderDeviation, maxx - minx + polygonOutBorderDeviation*2, maxy
				- miny + polygonOutBorderDeviation*2);
		return border;
	},
	// 获取区域外部边框路径
	createBorderPath : function(context) {
		var border = this.getBorder();
		context.beginPath();
		context.moveTo(border[0].x, border[0].y);
		for (var i = 1; i < border.length; ++i) {
			context.lineTo(border[i].x, border[i].y);
		}
		context.closePath();
	},
	// 虚线画区域外部边框
	strokeBorder : function(context) {
		context.save();
		var border = this.getBorder();
		context.beginPath();
		context.strokeStyle = border_StrokeStyle;
		context.lineWidth = 1;
		context.moveTo(border[0].x, border[0].y);
		for (var i = 1; i < border.length; ++i) {
			context.dashedLineTo(border[i - 1].x, border[i - 1].y, border[i].x,
					border[i].y, dash_pattern);
		}
		context.dashedLineTo(border[i - 1].x, border[i - 1].y, border[0].x,
				border[0].y, dash_pattern);
		context.restore();
	},
	// 获取虚线外框定点对应方框数组序列,方框会比画的框大
	getBorderBlocks : function() {
		var points = this.getBorder();
		var blocks = [];
		for (var i = 0; i < points.length; ++i) {
			var points_block = Rectangle(points[i].x - polygonChooseBlockHalfWidth, points[i].y - polygonChooseBlockHalfWidth,
					polygonChooseBlockHalfWidth*2, polygonChooseBlockHalfWidth*2);
			var polygon = new Polygon(points_block, border_StrokeStyle,block_StrokeFillStyle, 2, 0);
			blocks.push(polygon);
		}
		return blocks;
	},
	// 选中多边形，外边框画上方框
	borderBlock : function(context) {
		// 方框
		var points = this.getBorder();
		for (var i = 0; i < points.length; ++i) {
			var points_block = Rectangle(points[i].x - polygonBlockHalfWidth, points[i].y - polygonBlockHalfWidth, polygonBlockHalfWidth*2,
					polygonBlockHalfWidth*2);
			var polygon = new Polygon(points_block, border_StrokeStyle,block_StrokeFillStyle, 2, 0);
			polygon.stroke(context);
		}
	},
	drawGrid : function(x,y,context){
		context.save();
	    context.shadowColor = undefined;
	    context.shadowBlur = 0;
	    context.shadowOffsetX = 0;
	    context.shadowOffsetY = 0;
	   
	    context.strokeStyle = this.gridStrokeStyle;
	    context.fillStyle = this.gridFillStyle;
	    context.lineWidth = 0.5;
	    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	    context.beginPath();
	    for (var i = x + 0.5; i < context.canvas.width; i += x) {
	      context.moveTo(i, 0);
	      context.lineTo(i, context.canvas.height);
	    }
	    context.stroke();
	    context.beginPath();
	    for (var i = y + 0.5; i < context.canvas.height; i += y) {
	      context.moveTo(0, i);
	      context.lineTo(context.canvas.width, i);
	    }
	    context.stroke();
	    context.restore();
	},
	fill : function(context) {// 填充
		context.save();
		this.createPath(context);
		context.fillStyle = this.fillStyle;
		context.globalAlpha = 0.2;
		context.fill();
		context.restore();
	},
	move : function(x, y) {
		this.x = x;
		this.y = y;
	},
	// 选中多边形，连接点处画上方框
	block : function(context) {
		// 方框
		var points = this.points;
		for (var i = 0; i < points.length; ++i) {
			var points_block = Rectangle(points[i].x - polygonBlockHalfWidth, points[i].y - polygonBlockHalfWidth, polygonBlockHalfWidth*2,
					polygonBlockHalfWidth*2);
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
			var points_block = Rectangle(points[i].x - polygonChooseBlockHalfWidth, points[i].y - polygonChooseBlockHalfWidth,
					polygonChooseBlockHalfWidth*2, polygonChooseBlockHalfWidth*2);
			var polygon = new Polygon(points_block, block_StrokeStyle,block_StrokeFillStyle, 2, 0);
			blocks.push(polygon);
		}
		return blocks;
	},
	//缩放区域图形,pos为固定点
	scale : function(deviationx, origin){
		var points = this.points;
		//若有任意长度小于10，则不缩放
		for(var i = 0; i < points.length; i++){
			points[i].x = Math.floor((points[i].x - origin.x)*deviationx + origin.x);
			points[i].y = Math.floor((points[i].y - origin.y)*deviationx + origin.y);
		}
	},
	//获取每边中点，拖动可改变一条边位置
	getMiddle : function(){
		var points = this.points;
		var blocks = [];
		for (var i = 0; i < points.length; ++i) {
			var points_block = Rectangle((points[i].x+points[(i+1)%4].x)/2 - polygonChooseBlockHalfWidth, (points[i].y+points[(i+1)%4].y)/2 - polygonChooseBlockHalfWidth, polygonChooseBlockHalfWidth*2,
					polygonChooseBlockHalfWidth*2);
			var polygon = new Polygon(points_block, border_StrokeStyle,block_StrokeFillStyle, 2, 0);
			blocks.push(polygon);
		}
		return blocks;
	},
	// 画上每边中点
	middlePaint : function(context) {
		var points = this.points;
		for (var i = 0; i < points.length; ++i) {
			var points_block = Rectangle((points[i].x+points[(i+1)%4].x)/2 - polygonBlockHalfWidth, (points[i].y+points[(i+1)%4].y)/2 - polygonBlockHalfWidth, polygonBlockHalfWidth*2,
					polygonBlockHalfWidth*2);
			var polygon = new Polygon(points_block, block_StrokeStyle,block_StrokeFillStyle, 2, 0);
			polygon.stroke(context);
		}
	},
	//水平方向移动某边
	scaleX : function(deltaX, pos1, pos2){
		var points = this.points;
		//不能小于最小值10px
		if(Math.abs(points[1].x - points[0].x + deltaX) < 15 || Math.abs(points[2].x - points[3].x + deltaX) < 15){
			return false;
		}
		//点不能超出画图边界
		if((points[pos1].x + deltaX) > PIC_WIDTH || (points[pos2].x + deltaX) > PIC_WIDTH){
			return false;
		}
		points[pos1].x = points[pos1].x + deltaX;
		points[pos2].x = points[pos2].x + deltaX;
		return true;
	},
	//垂直方向移动某边
	scaleY : function(deltaY, pos1, pos2){
		var points = this.points;
		//不能小于最小值10px
		if(Math.abs(points[3].y - points[0].y + deltaY) < 15 || Math.abs(points[2].y - points[1].y + deltaY) < 15){
			return false;
		}
		//点不能超出画图边界
		var maxHeight = $("#canvas_show").attr("height");
		if((points[pos1].y + deltaY) > maxHeight || (points[pos2].y + deltaY) > maxHeight){
			return false;
		}
		points[pos1].y = points[pos1].y + deltaY;
		points[pos2].y = points[pos2].y + deltaY;
		return true;
	}
}; 