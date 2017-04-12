/**
 * 移动对话框
 */

document.onmousemove = mouseMove;
document.onmouseup = mouseUp;
var dragObject = null;
var mouseOffest = null;

//计算鼠标位置
function mouseCoords(ev) {
	if (ev.pageX || ev.pageY) {
		return {
			x : ev.pageX,
			y : ev.pageY
		};
	}
	return {
		x : ev.clientX + document.body.scrollLeft - document.body.clientLeft,
		y : ev.clientY + document.body.scrollTop - document.body.clientTop
	};
}

//获得鼠标偏移
function getMouseOffset(target, ev) {
	ev = ev || window.event;
	var docPos = getPosition(target);
	var mousePos = mouseCoords(ev);
	return {
		x : mousePos.x - docPos.x,
		y : mousePos.y - docPos.y
	};
}

function getPosition(e) {
	var left = 0;
	var top = 0;
	while (e.offsetParent) {
		left += e.offsetLeft;
		top += e.offsetTop;
		e = e.offsetParent;
	}

	left += e.offsetLeft;
	top += e.offsetTop;
	return {
		x : left,
		y : top
	};
}

//层移动
function mouseMove(ev) {
	ev = ev || window.event;
	var mousePos = mouseCoords(ev);
	if (dragObject) {
		dragObject.style.position = 'absolute';
		dragObject.style.top = mousePos.y - mouseOffset.y + "px";
		dragObject.style.left = mousePos.x - mouseOffset.x + "px";
		dragObject.style.marginTop = 0;
		dragObject.style.marginLeft = 0;
		return false;
	}
}

function mouseUp() {
	dragObject = null;
}

//层移动函数
function makeDraggable(item) {
	if (!item)
		return;
	item.onmousedown = function(ev) {
		// 移动父层div
		dragObject = this.parentNode;
//		dragObject = document.getElementById("diamove");
		mouseOffset = getMouseOffset(dragObject, ev);
		return false;
	};
}

/**
 * 关闭对话框
 */
function closedia() {
	$('#dia-hidebk').hide();
	$('#alertcont').hide();
}

/**
 * 打开对话框
 */
function showalert(){
	$("#dia-hidebk").height($(window).height()>document.body.scrollHeight?$(window).height():document.body.scrollHeight);
	$('#dia-hidebk').show();
	$("#alertcont").css('top', $(window).height()/2 + $(window).scrollTop());
	$('#alertcont').show();
}
