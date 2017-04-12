var dash_pattern = 5;
var vertical_len = 10;
var vertical_strokeStyle = "#000FFE";
var context_text_color = "white";
var lineBlockHalfWidth = 3;
var lineChooseBlockHalfWidth = 2;


/**
 * 
 * 
 */
var Grid = function(x, strokeStyle) {
	this.x = x;
	this.y = x;
	this.strokeStyle = strokeStyle; // 不同绊线类型，颜色不同
	this.lineWidth = 1; // 画线宽度
	this.fillStyle = "transparent";
};

Grid.prototype = {
	drawGrid : function(context){
		context.save();
	    context.shadowColor = undefined;
	    context.shadowBlur = 0;
	    context.shadowOffsetX = 0;
	    context.shadowOffsetY = 0;
	   
	    context.strokeStyle = this.strokeStyle;
	    context.fillStyle = this.fillStyle;
	    context.lineWidth = this.lineWidth;
	    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	    context.beginPath();
	    for (var i = this.x + 0.5; i < context.canvas.width; i += this.x) {
	      context.moveTo(i, 0);
	      context.lineTo(i, context.canvas.height);
	    }
	    context.stroke();
	    context.beginPath();
	    for (var i = this.y + 0.5; i < context.canvas.height; i += this.y) {
	      context.moveTo(0, i);
	      context.lineTo(context.canvas.width, i);
	    }
	    context.stroke();
	    context.restore();
	    $('#canvas_grid').show();
	}
};
