/**
 * 
 */

//一些常量
var polygonLineWidth = 1;
var tripThreadLineWidth = 1;
var detectStrokeStyle = "#01FF01";
var detectFillStyle = "green";
var maskFillStyle = "red";
var withoutFillStyle = "black";
var maskStrokeStyle = "#FE0101";
var withoutStrokeStyle = "#000";
var tripThreadStrokeStyle = "#000FFE";

var popMenuId = "popMenu";
var directMenuId = "level_1";
var max_condition_group_num = 1;

/*//计算原点
function GetOrigin(pos, tmp){
	var origin;
	if(pos == 0){
		origin = new Point(tmp.x + 21, tmp.y + 21);
	} else if(pos == 1){
		origin = new Point(tmp.x - 7, tmp.y + 21);
	} else if(pos == 2){
		origin = new Point(tmp.x - 7, tmp.y - 7);
	} else if(pos == 3){
		origin = new Point(tmp.x + 21, tmp.y - 7);
	}
	return origin;
} 

function GetSlope(point1, point2){
	return (point1.y - point2.y)/(point1.x - point2.x);
}*/

var NewPaint = function(canvas, canvas_cur, canvas_tripThread) {
	var grid = document.getElementById('canvas_grid');
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.canvas_cur = canvas_cur;
	this.context_cur = canvas_cur.getContext('2d');
	this.canvas_tripThread = canvas_tripThread;
	this.context_tripThread = canvas_tripThread.getContext('2d');
	this.canvas_grid = grid;
	this.context_grid = grid.getContext('2d');
	this.detect = [];
	this.mask = [];
	this.without = [];
	this.area = [];       //存放所有的区域
	this.blocks = [];      //存放当前选中区域的顶点方框
	this.middleBlocks = [];      //存放当前选中区域整体改变的方框
	this.tripThreads = [];     //存放所有的绊线
	this.lineBlocks = [];      //存放当前选中绊线的顶点方框
	this.maxNumber = 0;
	this.showNumList = [];        //存放当前显示的条件编号列表
	this.right_click = false;

	var t = this;

	//鼠标按下，拖动图形
	this.canvas_cur.onmousedown = function(e) {
		e.preventDefault();
		//如果是右键，则不触发操作
		if(e.button == 2){
			return;
		}
		
		t.right_click = false;
		t.dragging = null;
		t.line = null;
		t.draggingIndex = null;
		t.lineIndex = null;
		//隐藏右键弹窗
		hidePop();
		hideDirect();
		var loc = windowToCanvas(e.clientX, e.clientY, t.canvas);
		//改变图形形状时不需要考虑很多，因为在改变图形形状之前一定是先选中图形，在选中图形的时候就已经把情况都考虑了，
		//判断鼠标是否放在区域方框中，为改变图形
		for(var i = 0; i < t.blocks.length; i++){
			var block = t.blocks[i];
			block.createPath(t.context_cur);
			if (t.context_cur.isPointInPath(loc.x, loc.y)){
				t.changing = true;              //为true表示移动的时候为改变图形
				t.changingx = loc.x;
				t.changingy = loc.y;
				t.blocksIndex = i;            //记录选中第几个block
				t.area[t.blocksInArea].lineWidth = 2;      //选中图形的样式
				return;
			};
		}

		//判断鼠标是否放在绊线方框中，为改变绊线长度方向
		for(var i = 0; i < t.lineBlocks.length; i++){
			var block = t.lineBlocks[i];
			block.createPath(t.context_cur);
			if (t.context_cur.isPointInPath(loc.x, loc.y)){
				t.lineChanging = true;              //为true表示移动的时候为改变图形
				t.lineChangingx = loc.x;
				t.lineChangingy = loc.y;
				t.lineBlocksIndex = i;            //记录选中第几个block
				t.tripThreads[t.blocksInTripThread].lineWidth = 2;      //选中图形的样式
				return;
			};
		}
		
		//判断鼠标是否放在单边中点处
		for(var i = 0; i < t.middleBlocks.length; i++){
			var block = t.middleBlocks[i];
			block.createPath(t.context_cur);
			if (t.context_cur.isPointInPath(loc.x, loc.y)){
				t.middleX = loc.x;
				t.middleY = loc.y;
				t.middle = true;              //为true表示移动的时候为改变图形单边
				t.middleChoose = i;            //记录选中第几个middle
				t.area[t.middleInArea].lineWidth = 2;      //选中图形的样式
				return;
			};
		}
		
		for(var i = (t.area.length - 1); i >= 0; i--){
			var polygon = t.area[i];
			if(!t.showNumList.in_array(polygon.getNumber())){
				continue;
			}
			polygon.createPath(t.context);
			//找到当前鼠标选中的区域
			if (t.context.isPointInPath(loc.x, loc.y)) {
				t.dragging = polygon;
				t.dragging.lineWidth = 2;     //修改选中的样式
				t.draggingx = loc.x;
				t.draggingy = loc.y;
				t.draggingStyle = true;
				t.draggingIndex = i;       //记录选中图形的数组序号,不为空则可删除
				t.blocks = polygon.getBlocks();
				t.blocksInArea = i;          //记录选中图形blocks对应图形数组中的序号
				t.middleBlocks = polygon.getMiddle();     //选中中点
				t.middleInArea = i;
				break;			
			}
		}
		

		//判断是否有选中的，若有，则将选中的突出
		var dragFlag = false;
		if(t.dragging){
			//重画除选中的所有多边形
			t.repaintShow();

			//画出选中图形，在另一图层
			t.paintChoose();
			dragFlag = true;
		} else {
			//将选中的方框置空
			t.blocks = [];
			t.changing = false;
			
			t.middleBlocks = [];    //将中间点置空
			t.middle = false;
			//t.changingObject = false;
			//清空canvascur画布
			t.clearContextCur();
			//如果鼠标点在其他区域，则将选中的图形样式还原
			if(t.draggingStyle) {
				t.draggingStyle = false;
				//修改选中的图形数组序号为空
				t.draggingIndex = null;
				//重画所有多边形
				t.repaintAllShow();
			}
		}

		if(dragFlag){
			//将选中的方框置空
			t.lineBlocks = [];
			t.lineChanging = false;
			//t.changingObject = false;
			t.lineStyle = false;
			//修改选中的图形数组序号为空
			t.lineIndex = null;
			//重画所有绊线
			t.repaintAllLineShow();
			return;
		}

		//判断是否放在绊线中
		for(var i = (t.tripThreads.length - 1); i >= 0; i--){
			var tripThread = t.tripThreads[i];
			if(!t.showNumList.in_array(tripThread.getNumber())){
				continue;
			}
			tripThread.createBorderPath(t.context_tripThread);
			//找到当前鼠标选中的区域
			if (t.context_tripThread.isPointInPath(loc.x, loc.y)) {
				t.line = tripThread;
				t.line.lineWidth = 2;     //修改选中的样式
				t.lineIndex = i;
				t.linex = loc.x;
				t.liney = loc.y;
				t.lineStyle = true;
				t.lineBlocks = tripThread.getBlocks();
				t.blocksInTripThread = i;          //记录选中图形blocks对应图形数组中的序号
				break;			
			}
		}

		//判断是否有选中的，若有，则将选中的突出
		if(t.line){
			//重画除选中的所有绊线
			t.repaintLineShow();

			//画出选中图形，在另一图层
			t.paintChooseLine();
			
			//画出选中图形方向，在另一图层
			t.paintChooseLineDirect(e);
			return;
		} else {
			//将选中的方框置空
			t.lineBlocks = [];
			t.lineChanging = false;
			//t.changingObject = false;
			//清空canvascur画布
			t.clearContextCur();
			//如果鼠标点在其他区域，则将选中的图形样式还原
			if(t.lineStyle) {
				t.lineStyle = false;
				//修改选中的图形数组序号为空
				t.lineIndex = null;
				//重画所有绊线
				t.repaintAllLineShow();
			}
		}
		
	};
	
	this.canvas_cur.click_choose = function(posX, posY, e){
		t.right_click = true;
		//隐藏方向
		hideDirect();
		var loc = windowToCanvas(posX, posY, t.canvas);
		
		//说明鼠标右键时，放在某个区域中，则此区域改为选中
		for(var i = (t.area.length - 1); i >= 0; i--){
			var polygon = t.area[i];
			if(!t.showNumList.in_array(polygon.getNumber())){
				continue;
			}
			polygon.createPath(t.context);
			//找到当前鼠标选中的区域
			if (t.context.isPointInPath(loc.x, loc.y)) {
				t.dragging = polygon;
				t.dragging.lineWidth = 2;     //修改选中的样式
				t.draggingx = loc.x;
				t.draggingy = loc.y;
				t.draggingStyle = true;
				t.draggingIndex = i;       //记录选中图形的数组序号,不为空则可删除
				t.blocks = polygon.getBlocks();
				t.blocksInArea = i;          //记录选中图形blocks对应图形数组中的序号
				t.middleBlocks = polygon.getMiddle();     //选中中点
				t.middleInArea = i;
				//改为选中样式
				t.area[t.blocksInArea].lineWidth = 2;      //选中图形的样式
				//重画除选中的所有多边形
				t.repaintShow();
				
				//画出选中图形，在另一图层
				t.paintChoose();
				
				t.repaintAllLineShow();
				return true;		
			}
		}
		
		//判断是否放在绊线中
		for(var i = (t.tripThreads.length - 1); i >= 0; i--){
			var tripThread = t.tripThreads[i];
			if(!t.showNumList.in_array(tripThread.getNumber())){
				continue;
			}
			tripThread.createBorderPath(t.context_tripThread);
			//找到当前鼠标选中的区域
			if (t.context_tripThread.isPointInPath(loc.x, loc.y)) {
				t.line = tripThread;
				t.line.lineWidth = 2;     //修改选中的样式
				t.lineIndex = i;
				t.linex = loc.x;
				t.liney = loc.y;
				t.lineStyle = true;
				t.lineBlocks = tripThread.getBlocks();
				t.blocksInTripThread = i;          //记录选中图形blocks对应图形数组中的序号
				//重画除选中的所有绊线
				t.repaintLineShow();

				//画出选中图形，在另一图层
				t.paintChooseLine();
				
				//画出选中图形方向，在另一图层
				t.paintChooseLineDirect(e);	
				
				t.repaintAllShow();
				return true;
			}
		}
		return false;
	};

	this.canvas_cur.onmousemove = function(e) {
		e.preventDefault();
		
		if(t.right_click){
			return;
		}
		var loc = windowToCanvas(e.clientX, e.clientY, t.canvas);
		//先判断鼠标是否在边框上，若是，则为改变图形形状
		if(t.changing){
			var posx = loc.x - t.changingx;
			var posy = loc.y - t.changingy;
			t.changingx = loc.x;
			t.changingy = loc.y;
			var polygon = t.area[t.blocksInArea];
			//修改选中的顶点坐标
			var point = polygon.points[t.blocksIndex];
			polygon.points[t.blocksIndex] = new Point(point.x + posx, point.y + posy);
			t.blocks = polygon.getBlocks();               //移动后blocks值会边，所以需要刷新
			//更新中点值
			t.middleBlocks = polygon.getMiddle();

			t.movePaint();

			return;
		}
		//拖动多边形
		if(t.dragging){
			//计算移动后的图形位置
			var posx = loc.x - t.draggingx;
      		var posy = loc.y - t.draggingy;
			t.draggingx = loc.x;
			t.draggingy = loc.y;
			deviate(t.dragging.points, posx, posy);

			//画出选中图形，在另一图层
			t.paintChoose();
			//更新blocks值
			t.blocks = t.dragging.getBlocks();
			//更新中点值
			t.middleBlocks = t.dragging.getMiddle();

			return;
		}

		//先判断鼠标是否在边框上，若是，则为改变绊线形状
		if(t.lineChanging){
			var posx = loc.x - t.lineChangingx;
			var posy = loc.y - t.lineChangingy;
			t.lineChangingx = loc.x;
			t.lineChangingy = loc.y;
			var tripThread = t.tripThreads[t.blocksInTripThread];
			//修改选中的顶点坐标
			var point = tripThread.points[t.lineBlocksIndex];
			tripThread.points[t.lineBlocksIndex] = new Point(point.x + posx, point.y + posy);
			t.lineBlocks = tripThread.getBlocks();               //移动后blocks值会边，所以需要刷新

			t.moveLine();

			return;
		}

		//拖动绊线
		if(t.line){
			if(!$("#paint-sltdown").is(":hidden")){
				$("#paint-sltdown").hide();
			}
			//计算移动后的图形位置
			var posx = loc.x - t.linex;
      		var posy = loc.y - t.liney;
			t.linex = loc.x;
			t.liney = loc.y;
			deviate(t.line.points, posx, posy);

			//画出选中图形，在另一图层
			t.paintChooseLine();
			t.paintChooseLineDirect(e);
			//更新blocks值
			t.lineBlocks = t.line.getBlocks();

			return;
		}
		
		//单边缩放区域
		if(t.middle){
			var polygon = t.area[t.middleInArea];
			
			if(t.middleChoose%2 == 0){
				var deltaY = loc.y - t.middleY;
				var rst = polygon.scaleY(deltaY, t.middleChoose, (t.middleChoose+1)%4);
				if(rst){
					t.middleX = loc.x;
					t.middleY = loc.y;
				}
					
			} else {
				var deltaX = loc.x - t.middleX;
				var rst = polygon.scaleX(deltaX, t.middleChoose, (t.middleChoose+1)%4);
				if(rst){
					t.middleX = loc.x;
					t.middleY = loc.y;
				}
			}

			//画出选中图形，在另一图层
			t.paintChooseMiddle(t.middleInArea);
			//更新中点值
			t.middleBlocks = t.area[t.middleInArea].getMiddle();
			//更新blocks值
			t.blocks = t.area[t.middleInArea].getBlocks();
			return;
		}
	};

	this.canvas_cur.onmouseup = function(e) {
		e.preventDefault();
		//若有选中的，则需要将样式还原
		if(t.dragging){
			t.dragging.lineWidth = polygonLineWidth;
		}
		if(t.changing){
			t.area[t.blocksInArea].lineWidth = polygonLineWidth; 
		}
		if(t.lineChanging){
			t.tripThreads[t.blocksInTripThread].lineWidth = polygonLineWidth; 
		}
		if(t.line){
			t.line.lineWidth = polygonLineWidth; 
			
		}
		if(t.middle){
			t.area[t.middleInArea].lineWidth = polygonLineWidth; 
		}
		
		t.dragging = false;
		t.changing = false;
		t.lineChanging = false;
		t.line = false;
		t.middle = false;
	};
	
	this.canvas_cur.oncontextmenu = function(e){
		e.preventDefault();
		var loc_x = e.clientX;
		var loc_y = e.clientY;
		t.draggingIndex = null;
		t.lineIndex = null;
		contextChoose(loc_x, loc_y, t);
//		popMenu(popMenuId, max_condition_group_num, loc_x, loc_y, t);
		event.returnValue=false;
		event.cancelBubble=true;
		return false;
	};
};
function contextChoose(  posx, posy, paintobj){
	//点击鼠标左键
	var flag = paintobj.canvas_cur.click_choose(posx, posy);
	//判断是否有选中条件，有选中才能添加进条件组
	if(paintobj.draggingIndex == null && paintobj.lineIndex == null){
		return;
	}
	
	var num;
	var type;
	if(paintobj.draggingIndex != null){
		num = paintobj.area[paintobj.draggingIndex].getNumber();
		type = paintobj.area[paintobj.draggingIndex].type;
	}
	if(paintobj.lineIndex != null){
		num = paintobj.tripThreads[paintobj.lineIndex].getNumber();
		type = paintobj.tripThreads[paintobj.lineIndex].type;
	}
	return flag;
}
//画图右键弹窗
//function popMenu(menuId, max_group_num, posx, posy, paintobj){
function popMenu(menuId, max_group_num,  posx, posy, paintobj){
	var num;
	var type;
	if(paintobj.draggingIndex != null){
		num = paintobj.area[paintobj.draggingIndex].getNumber();
		type = paintobj.area[paintobj.draggingIndex].type;
	}
	if(paintobj.lineIndex != null){
		num = paintobj.tripThreads[paintobj.lineIndex].getNumber();
		type = paintobj.tripThreads[paintobj.lineIndex].type;
	}
	
	var tableCont = "<table cellspacing='0' border='0' cellpadding='0' style='width:100%;'>";
	
	//获取当前条件组合编号序列
	var list = getConditionGroupsList();
	
	for(var i = 0; i < list.length; i++){
		tableCont = tableCont + "<tr onclick='addToConditionGroups(this)' conditionGroup=" + list[i] + " conditionNum=" + num + " conditionType=" + type + " ><td class='borderb'>"+$.i18n.prop('addToGroupN',list[i]) + "</td></tr>";
	}
	
	if(list.length==0){
		tableCont = tableCont + "<tr onclick='addToConditionGroups(this)' conditionGroup=1 conditionNum=" + num + " conditionType=" + type + " ><td>"+$.i18n.prop('addToNewGroup') + "</td></tr>";
		tableCont = tableCont + "</table>";
	}else{
		tableCont = tableCont + "<tr onclick='addToConditionGroups(this)' conditionGroup=" + (list[list.length-1]+1) + " conditionNum=" + num + " conditionType=" + type + " ><td>"+$.i18n.prop('addToNewGroup') + "</td></tr>";
		tableCont = tableCont + "</table>";
	}
	
	
	$("#" + menuId).html(tableCont);
	$("#" + menuId).css("top", posy+$(window).scrollTop());
	$("#" + menuId).css("left", posx+20);
	$("#" + menuId).show();
}
//获取当前条件组合的所有编号
function getConditionGroupsList(){
	var list = [];
	$("div[name=paint_conditions]", $("#condition_groups")).each(function(){
		list.push(parseInt($(this).attr("conditionGroup")));
	});
	return list;
}
//隐藏右键弹窗
function hidePop(){
	$('#' + popMenuId).hide();
}
//隐藏右键弹窗
function hideDirect(){
	$('#' + directMenuId).hide();
}
//将选中元素添加进对应条件组合中 
function addToConditionGroups(obj){
	hidePop();
	var condition_index = $(obj).attr("conditionGroup");
	var condition_num = $(obj).attr("conditionNum");
	var condition_type = $(obj).attr("conditionType");
	//添加至条件组
	var flag = false;      //为false表示为新增条件组
	$("div[name=paint_conditions]", $("#condition_groups")).each(function(){
		var num = $(this).attr("conditionGroup");
		if(condition_index == num){
			var text = [];
			
			$("a[name=condition_group]", $(this)).each(function(){
				var _this = this;
				text.push($(_this).text());
			});
			var borderColor;
			switch(condition_type){
				case "1":borderColor="green";
				break;
				case "2":borderColor="red";
				break;
				case "3":borderColor="black";
				break;
				case "4":borderColor="blue";
				break;
			}
			//判断添加的条件是否在条件组中，在则不添加
			if(text.length>0){

				if(!text.in_array(condition_num)){
					$("#condition_groups .paint_conditions[conditiongroup="+num+"] .condition_box").append("<a class='conDetail draggable' data-set='con_"+condition_num+"' status='1' style='border-color:"+borderColor+";' name='condition_group'><span class='closeSmall'></span>" + condition_num + "</a>");
					//$(".paint_conditions[conditiongroup="+condition_index+"] .order_list").append("<a class='orderDetail' style='border-color:green;' onclick='showByConditionGroup(this)' isShow='false' conditionGroup=" + num + ">" + condition_num + "</a>");
				}
			} else {
				$("#condition_groups .paint_conditions[conditiongroup="+num+"] .condition_box").html("<a class='conDetail draggable' data-set='con_"+condition_num+"' status='1' style='border-color:"+borderColor+";' name='condition_group'><span class='closeSmall'></span>" + condition_num + "</a>");
				//$(".paint_conditions[conditiongroup="+condition_index+"] .order_list").html("<a class='orderDetail' style='border-color:green;' onclick='showByConditionGroup(this)' isShow='false' conditionGroup=" + num + ">" + condition_num + "</a>");
			}
			flag = true;
			return false;
		}
	});
	
	if(!flag){
		//添加条件组合
		max_condition_group_num++;
		addConditionGroup("condition_groups", condition_index, condition_num,condition_type);
	}
	
	$("div[name=paint_conditions]", $("#condition_groups")).each(function(){
		var flag = 0;
		var i = $(this).attr("conditiongroup");
		var arr=[];
		$(".paint_conditions[conditiongroup='"+i+"'] .condition_box a.draggable").draggable({//:not('.unDraggable')
			connectToSortable: "#orderList"+i,
			helper: "clone",
	        revert: "invalid",
			//revert:true,
	        revertDuration:200,
	        //snap : "#orderList"+i,
	        addClasses : false,
	        start:function(event,ui){
	        	
	        	var len = $("#orderList"+i+" a").length;
	        	//var len = $(this).find("a").length;
	        	if(len > 0 && len%4==0){
	        		var h = len/4*40;
	        		$("#orderList"+i).css("minHeight",h+40);
	        	}else{
	        		$("#orderList"+i).css("minHeight",40);
	        	};
	        	
	        	$("#orderList"+i+" a").each(function(){
	        		//$(this).attr("id","order"+j);
	        		var oNum = parseInt($(this).text());
	        		if(oNum!=null){
	        			if(arr.in_array(oNum)){
	        				//$(".paint_conditions[conditiongroup='"+i+"'] .condition_box a").draggable( "option", "revert", true );
		        			//return false;
		        			//if($("#order"+$(this).text()).length>1){
		        			//$(this).attr("id","order"+$(this).text());
		        				//$(this).closest(".paint_conditions").find(".condition_box a").draggable( "option", "revert", true );
		        				//$("#order"+j).remove();
		        			//}
		        			
	        			}else{
		        			//$(".paint_conditions[conditiongroup='"+i+"'] .condition_box a").draggable('enable');
		        			
		        		}
	        		}
	        		
	        		//return false;
	        		//j++;
	        	});
	        },
	        stop:function(event,ui){
	        	var len = $("#orderList"+i+" a").length;
	        	var $el = $(event.target).eq(0);
	        	
	        	if(len > 0 && len%4==0){
	        		var h = len/4*40;
	        		$("#orderList"+i).css("minHeight",h);
	        	};
	        	if(!$el.attr("status")){
	        		return;
	        	}
	        	if($el.attr("status")=="0"){
	        		$el.draggable("option","revert",true);//removeClass("draggable").
	        		
	        		if($("#orderList"+i+" a.conDetail").length>0){
	        			$("#orderList"+i+" a.conDetail").remove();
	        		}
	        		
	        	}else{
	        		$el.addClass("draggable").draggable("option","revert","invalid");
	        	}
	        	
	        	
	        }
		});
		
		$(".paint_conditions[conditiongroup='"+i+"'] .order_list").droppable({//:not('.unDraggable')
			accept: '.draggable',
			activate : function(event,ui){
//				console.log("ac");
			},
			deactivate :function(event,ui){
//				console.log("end");
			},
			drop : function(event,ui){
				//flag = 1;
				
					var $el = $(ui.draggable).eq(0);
					var dataSet  = $el.attr("data-set");
//					console.log("drop!");
					//return;
	        		if(dataSet){
	        			if($(".conDetail[data-set='"+dataSet+"']").attr("status")){
	        				$el.attr("name","condition_order").removeClass("conDetail").addClass("orderDetail");
	    	        		
		        			var tmp = dataSet;
		        			$el.attr("data-set",tmp.replace("con","order"));
		        			$(".conDetail[data-set='"+dataSet+"']").attr("status","0").removeClass("draggable");//.draggable("option","revert",true);
		        			//$(".condition_box .conDetail[data-set='"+dataSet+"']").draggable("disable");
		        			
			        		var oNum = parseInt($el.text());
			        		if(oNum!=null && !arr.in_array(oNum)){
			        			arr.push(oNum);
			        			//'.unDraggable'
			        			
			        		}
				        			
			        		removeEl($("#orderList"+i),"orderDetail");
	        			}
	        			
	        		}
	        		
	        	//});
			}
		});
		
		$(".paint_conditions[conditiongroup='"+i+"'] .order_list").sortable({
	        cursor: "move",
	        items :"a",                        //只是a可以拖动
	        width:30,
	        height:28,
	        opacity: 0.6,                       //拖动时，透明度为0.6
	        revert: false,                       //释放时，增加动画
	        //placeholder:'.conDetail',
	        connectWith: '#orderList'+i,
	        update : function(event, ui){       //更新排序之后
	            //alert($(this).sortable("toArray"));
	        	if(1){
	        		
	        	}
//	        	var len = $(this).find("a").length;
//	        	if(len > 0 && len%4==0){
//	        		$(this).css("minHeight",parseInt($(this).css("height"))+40);
//	        	};
	        	//arr.push(ui.helper);
	        	
	        }
	     });
		
		function removeEl(target,cls){
			var $parentDiv,groupId,i;
			$(".closeSmall",target).click(function(){
				
				$parentDiv = target.parent("div[name=paint_conditions]");
				groupId = $parentDiv.attr("conditiongroup");
				i = $(this).parent().attr("data-set").split("_")[1];
				
    			if($(this).parent("."+cls).length>0){
    				$(this).parent("."+cls).remove();
    			};
    			
    			if(cls=="conDetail"){
    				var $orders = $(".orderDetail",$("#orderList"+groupId));
    				
    				for(var j=0;j<$orders.length;j++){
    					if($orders.eq(j).attr("data-set")=="order_"+i){
    						$orders.eq(j).remove();
    					}
    				}
    				
    			}else if(cls=="orderDetail"){
    				var aLen = $("a",target).length;
        			if(aLen/4 == 0){
        				target.css("minHeight",40);
        			}else if(aLen%4==0){
        				target.css("minHeight",aLen/4*40);
        			}
        			
        			$(".conDetail[data-set='con_"+i+"']").attr("status","1").addClass("draggable").draggable("option","revert","invalid");
    			}
    			
        	});
		}
		for(var count=0;count<$(".condition_box").length;count++){
			removeEl($(".condition_box").eq(count),"conDetail");
		}
		
	 });
	
}
//新增一个条件组合 ok
function addConditionGroup(id, condition_group, condition_num , condition_type){
	if($("#condition_groups div[name='paint_conditions']").length>=5){
		return;
	}
	
	if(condition_group==null){
		var groups = $("#condition_groups div[name='paint_conditions']");
		var max = 0;
		
		for(var i=0;i<groups.length;i++){
			var index = parseInt(groups.eq(i).attr("conditiongroup"));
			if(index > max){
				max = index;
			}
		}
		
		condition_group = ++max;
	}
	
	if(condition_num ==null&&condition_type == null){
		$('#' + id).append("<div name='paint_conditions' class='paint_conditions' conditionGroup=" + condition_group + " ><div class='condition_title'><span class='eye'  onclick='showByConditionGroup(this)' isShow='true' conditionGroup="+condition_group+"></span>"+$.i18n.prop('conditionGroupN',condition_group) + "<span class='delete' onclick='delConditionGroup(this)'></span></div>"
				+ "<div class='condition_box'></div>"
				+ "<div class='order_title' id='show_condition_groups'><span>"+$.i18n.prop('iptRuleSort') + "</span><div class='order_list' id='orderList"+condition_group+"'></div></div>"
				+ "</div>");
	}else{
		var borderColor;
		switch(condition_type){
			case "1":borderColor="green";
			break;
			case "2":borderColor="red";
			break;
			case "3":borderColor="black";
			break;
			case "4":borderColor="blue";
			break;
		}
		
		
		$('#' + id).append("<div name='paint_conditions' class='paint_conditions' conditionGroup=" + condition_group + " ><div class='condition_title'><span class='eye'  onclick='showByConditionGroup(this)' isShow='true' conditionGroup="+condition_group+"></span>"+$.i18n.prop('conditionGroupN',condition_group) + "<span class='delete' onclick='delConditionGroup(this)'></span></div>"
				+ "<div class='condition_box'><a class='conDetail draggable' data-set='con_"+condition_num+"' status='1' style='border-color:"+borderColor+";' name='condition_group'><span class='closeSmall'></span>" + condition_num + "</a></div>"
				+ "<div class='order_title' id='show_condition_groups'><span>"+$.i18n.prop('iptRuleSort') + "</span><div class='order_list' id='orderList"+condition_group+"'></div></div>"
				+ "</div>");
		
		var _h = $('#demo-background').height();
		var _rh = $('.rst-select-condition').height();
		//var _th = $('#tip').height();
		
		if(_h > 0){
			$('#' + id).css('maxHeight',_h-_rh);//-_th
		}
		
		if($('#' + id).height()>parseFloat($('#' + id).css("maxHeight"))){
			$('#' + id).css("overflowY","scroll");
		}else{
			$('#' + id).css("overflowY","auto");
		}
	}
}

//删除某个条件组合
function delConditionGroup(obj){
	if(!conditions_paint){
		var canvas_show = document.getElementById('canvas_show');
		var canvas_cur = document.getElementById('canvas_cur');
		var canvas_tripThread = document.getElementById('canvas_tripThread');
		conditions_paint = new NewPaint(canvas_show, canvas_cur, canvas_tripThread);
	}
	$(obj).closest(".paint_conditions").remove();	
	
	//获取所有添加编号数组
	var all =conditions_paint.getAllConditionNums();
	//获取右边条件组合中所有条件编号
	var all_list = getAllConditions();
	var allConNums = getShowConditionNumList(all_list);
	//获取所有显示的条件编号数组
	var show_list = getAllShowConditions();//
	var nl = getShowConditionNumList(show_list);
	//获取所有不显示的条件编号数组
	var no_show = differenceSet(allConNums, nl);
	
	var all_show_left = differenceSet(all, no_show);
	
	conditions_paint.showNumList = all_show_left;
	conditions_paint.paintByConditionNums(all_show_left);
	
	
}

//获取显示条件组合对应的图形编号列表
function getShowConditionNumList(conditionGroupList){
	var numlist = [];
	$("div[name=paint_conditions]", $("#condition_groups")).each(function(){
		var num = $(this).attr("conditionGroup");
		if(!conditionGroupList.in_array(num)){
			return ;
		}
		
		$("a[name=condition_group]", $(this)).each(function(){
			var _t = this;
			var text = parseInt($(_t).text());
			if(text){
				numlist.push(text);
			}
			
		});
	});
	//去除重复元素
	numlist = uniqueArray2(numlist);
	return numlist;
}

NewPaint.prototype = {
	// 添加检测区域，默认添加在左上角
	addDetect : function(e) {
		var points = Rectangle(50, 50, 150, 100);
		var num = this.getMaxNumber()+1;
		var polygon = new Polygon(points, detectStrokeStyle, detectFillStyle,polygonLineWidth, 1, num);
		polygon.fill(this.context);
		polygon.stroke(this.context);
		this.area.push(polygon);
		this.showNumList.push(num);
	},
	// 添加屏蔽区域，默认添加在左上角
	addMask : function(e) {
		var points = Rectangle(60, 60, 150, 100);
		var num = this.getMaxNumber()+1;
		var polygon = new Polygon(points, maskStrokeStyle, maskFillStyle,polygonLineWidth, 2, num);
		polygon.fill(this.context);
		polygon.stroke(this.context);
		this.area.push(polygon);
		this.showNumList.push(num);
	},
	// 添加不经过区域，默认添加在左上角
	addWithout : function(e) {
		var points = Rectangle(70, 70, 150, 100);
		var num = this.getMaxNumber()+1;
		var polygon = new Polygon(points, withoutStrokeStyle, withoutFillStyle,polygonLineWidth, 3, num);
		polygon.fill(this.context);
		polygon.stroke(this.context);
		this.area.push(polygon);
		this.showNumList.push(num);
	},
	// 添加绊线，默认添加在左上角
	addTripThread : function(direct) {
		var points = Thread(80, 80, 150);
		var num = this.getMaxNumber()+1;
		var tripThread = new TripThread(points, tripThreadStrokeStyle, tripThreadLineWidth, 4, direct, num);
		tripThread.stroke(this.context_tripThread);
		tripThread.drawVertical(points[0].x, points[0].y, points[1].x, points[1].y, this.context_tripThread);
		this.tripThreads.push(tripThread);
		this.showNumList.push(num);
	},
	addGrid : function (v) {
		this.clearContextGrid();
		var arrTmp = [4,8,16,32];
		v = arrTmp[v];
		var grid = new Grid(v, "#fff");
		
		grid.drawGrid(this.context_grid);
	},
	getPolygon : function(){
		return this.area;
	},
	getTripThreads : function(){
		return this.tripThreads;
	},
	//获取当前最大编号
	getMaxNumber : function(){
		var max = 0;
		for(var i= 0; i < this.area.length; i++){
			if(this.area[i].getNumber() > max)
				max = this.area[i].getNumber();
		}
		for(var i = 0; i < this.tripThreads.length; i++){
			if(this.tripThreads[i].getNumber() > max)
				max = this.tripThreads[i].getNumber();
		}
		this.maxNumber = max;
		return max;
	},
	//获取当前画图的所有条件编号数组
	getAllConditionNums : function(){
		var numlist = [];
		for(var i= 0; i < this.area.length; i++){
			numlist.push(this.area[i].getNumber());
		}
		for(var i = 0; i < this.tripThreads.length; i++){
			numlist.push(this.tripThreads[i].getNumber());
		}
		return numlist;
	},
	clearContext : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	clearContextCur : function() {
		this.context_cur.clearRect(0, 0, this.canvas_cur.width, this.canvas_cur.height);
	},
	clearContextTripThread : function() {
		this.context_tripThread.clearRect(0, 0, this.canvas_tripThread.width, this.canvas_tripThread.height);
	},
	clearContextGrid : function() {
		this.context_grid.clearRect(0, 0, this.canvas_grid.width, this.canvas_grid.height);
		//this.context_grid.clearRect(0, 0, 800, 450);
	},
	//重画除了选中图形的其他图形
	repaint : function(){
		this.clearContext();
		for(var i = 0; i < this.area.length; i++){
			if(this.draggingIndex == i)
				continue;
			var polygon = this.area[i];
			polygon.fill(this.context);
			polygon.stroke(this.context);
			
		}
	},
	//重画除了选中图形的所有显示图形
	repaintShow : function(){
		this.clearContext();
		for(var i = 0; i < this.area.length; i++){
			if(this.draggingIndex == i)
				continue;
			var polygon = this.area[i];
			if(!this.showNumList.in_array(polygon.getNumber()))
				continue;
			polygon.fill(this.context);
			polygon.stroke(this.context);
			
		}
	},
	//重画所有的图形
	repaintAll : function(){
		this.clearContext();
		for(var i = 0; i < this.area.length; i++){
			var polygon = this.area[i];
			polygon.fill(this.context);
			polygon.stroke(this.context);
		}
	},
	//重画所有显示图形
	repaintAllShow : function(){
		this.clearContext();
		for(var i = 0; i < this.area.length; i++){
			var polygon = this.area[i];
			if(!this.showNumList.in_array(polygon.getNumber()))
				continue;
			polygon.fill(this.context);
			polygon.stroke(this.context);
		}
	},
	//重画除了选中图形的其他绊线
	repaintLine : function(){
		this.clearContextTripThread();
		for(var i = 0; i < this.tripThreads.length; i++){
			if(this.lineIndex == i)
				continue;
			var tripThread = this.tripThreads[i];
			tripThread.stroke(this.context_tripThread);
			var points = tripThread.points;
			tripThread.drawVertical(points[0].x, points[0].y, points[1].x, points[1].y, this.context_tripThread);
		}
	},
	//重画除了选中图形的其他显示绊线
	repaintLineShow : function(){
		this.clearContextTripThread();
		for(var i = 0; i < this.tripThreads.length; i++){
			if(this.lineIndex == i)
				continue;
			var tripThread = this.tripThreads[i];
			if(!this.showNumList.in_array(tripThread.getNumber()))
				continue;
			tripThread.stroke(this.context_tripThread);
			var points = tripThread.points;
			tripThread.drawVertical(points[0].x, points[0].y, points[1].x, points[1].y, this.context_tripThread);
		}
	},
	//重画所有绊线
	repaintAllLine : function(){
		this.clearContextTripThread();
		//隐藏方向选择框
		hideDirect();
		for(var i = 0; i < this.tripThreads.length; i++){
			var tripThread = this.tripThreads[i];
			tripThread.stroke(this.context_tripThread);
			var points = tripThread.points;
			tripThread.drawVertical(points[0].x, points[0].y, points[1].x, points[1].y, this.context_tripThread);
		}
	},
	//重画所有绊线
	repaintAllLineShow : function(){
		this.clearContextTripThread();
		//隐藏方向选择框
		hideDirect();
		for(var i = 0; i < this.tripThreads.length; i++){
			var tripThread = this.tripThreads[i];
			if(!this.showNumList.in_array(tripThread.getNumber()))
				continue;
			tripThread.stroke(this.context_tripThread);
			var points = tripThread.points;
			tripThread.drawVertical(points[0].x, points[0].y, points[1].x, points[1].y, this.context_tripThread);
		}
	},
	//画出选中图形，带样式
	paintChoose : function(){
		this.clearContextCur();
		if(this.dragging){
			this.dragging.fill(this.context_cur);
			this.dragging.stroke(this.context_cur);
			this.dragging.block(this.context_cur);
			this.dragging.middlePaint(this.context_cur);
		}
		//方向选择重置
		$("#paint-sltdown").hide();
		$('#ban-direct > a').html('选择方向');
		$("#ban-direct").unbind("click");
		$("#paint-sltdown > div").unbind("click");
		$('#ban-direct').attr('value', '0').attr('isopen', 'false');
	},
	//画出选中绊线，带样式
	paintChooseLine : function(){
		this.clearContextCur();
		if(this.line){
			this.line.stroke(this.context_cur);
			var points = this.line.points;
			this.line.drawVertical(points[0].x, points[0].y, points[1].x, points[1].y, this.context_cur);
			this.line.block(this.context_cur);
		}
	},
	//画出选中绊线方向，带样式
	paintChooseLineDirect : function(e) {
		if(e){
			e.preventDefault();
		}
		this.showDirectBox(this.line);
	},
	//显示方向选择框
	showDirectBox : function(tripThread){
		if (tripThread) {
			var _this = this;
			var directType = tripThread.direct;
			var directTypeStr;

			if (directType == "1") {
				directTypeStr = '<b class="fl">A</b><b class="rst-type-choosebox rst-right-icon fl"></b><b class="fl">B</b>';
			} else if (directType == "2") {
				directTypeStr = '<b class="fl">A</b><b class="rst-type-choosebox rst-left-icon fls"></b><b class="fl">B</b>';
			} else if (directType == "3") {
				directTypeStr = '<b class="fl">A</b><b class="rst-type-choosebox rst-right-left-icon fl"></b><b class="fl">B</b>';
			}
			$("#paint-sltdown").hide();
			$('#ban-direct').attr('value', '0').attr('isopen', 'false');
			$("#ban-direct > a").html(directTypeStr);// + "<span class='rst-direct-logo'></span>"
			$("#ban-direct").unbind("click").click(function(e) {
				if(e){
					e.preventDefault();
				}else if(window.event){
					window.event.cancelBubble = true;
				}
				
				var _t = this;
				var txt = $(_t).find('a').text();
				
				$(_t).next("#paint-sltdown > div").each(function() {
					if ($(this).text() == txt) {
						$(this).hide();
					}
				});
				
				$(_t).next("#paint-sltdown").show();
			});
			$("#paint-sltdown > div").unbind("click").click(function(e) {
				if(e){
					e.preventDefault();
				}else if(window.event){
					window.event.cancelBubble = true;
				}
				e.preventDefault();
				var loc_x = e.clientX;
				var loc_y = e.clientY;
				event.returnValue=false;
				event.cancelBubble=true;
				
				if(_this.lineIndex != null){
					var __this = this;
					var val = $(__this).attr("value");
					$("#ban-direct > a").html($(__this).html()).show();//.append("<span class='rst-direct-logo'></span>")
					$("#paint-sltdown").hide();
					$('#ban-direct').attr('value', val).attr('isopen', 'false');
					_this.changeDirect(val);
				}
			});
			
			
			var offset = $("#new_paint").offset();
			var points = tripThread.points;
			var mid_x = (points[0].x + points[1].x) / 2;
			var mid_y = Math.min(points[0].y, points[1].y);
			var show_x = mid_x + offset.left - 30;
			var show_y = mid_y + offset.top - 40;
			//		console.log("mid_x:" + mid_x + " mid_y:" + mid_y);
			//		console.log("offset_x:" + offset.left + " offset_y:" + offset.top);
//					console.log("show_x:" + show_x + " show_y:" + show_y);
			$("#level_1").css({
				"left" : show_x,
				"top" : show_y
			}).show();
		}
	},
	//画出选中图形，带样式
	paintChooseMiddle : function(i){
		this.clearContextCur();
		var polygon = this.area[i];
		polygon.fill(this.context_cur);
		polygon.stroke(this.context_cur);
		polygon.block(this.context_cur);
		polygon.middlePaint(this.context_cur);
	},
	//画出选中图形，带样式
	movePaint : function(){
		this.clearContextCur();
		if(this.changing){
			this.area[this.blocksInArea].fill(this.context_cur);
			this.area[this.blocksInArea].stroke(this.context_cur);
			this.area[this.blocksInArea].block(this.context_cur);
			this.area[this.blocksInArea].middlePaint(this.context_cur);
		}
	},
	//画出选中图形，带样式
	moveLine : function(){
		this.clearContextCur();
		if(this.lineChanging){
			var tripThread = this.tripThreads[this.blocksInTripThread];
			var points = tripThread.points;
			tripThread.stroke(this.context_cur);
			tripThread.drawVertical(points[0].x, points[0].y, points[1].x, points[1].y, this.context_cur);
			tripThread.block(this.context_cur);
			//带上方向选择框
			this.showDirectBox(tripThread);
		}
	},
	//删除选中图形,返回删除图形对应编号
	delChoose : function(){
		//若有选中的图形，则删除，否则不删除
		if(this.draggingIndex != null){
			var num = this.area[this.draggingIndex].getNumber();
			this.area.splice(this.draggingIndex, 1);
			this.draggingIndex = null;
			this.blocks = [];
			this.repaintAll();
			this.clearContextCur();
			//若删除的是最后一个，则需要修改max值
			if(num == this.maxNumber){
				this.maxNumber = this.maxNumber - 1;
			}
			return num;
		}
		if(this.lineIndex != null){
			var num = this.tripThreads[this.lineIndex].getNumber();
			this.tripThreads.splice(this.lineIndex, 1);
			this.lineIndex = null;
			this.lineBlocks = [];
			this.repaintAllLine();
			this.clearContextCur();
			//若删除的是最后一个，则需要修改max值
			if(num == this.maxNumber){
				this.maxNumber = this.maxNumber - 1;
			}
			return num;
		}
	},
	//删除选中图形,返回删除图形对应编号,且只显示
	delShowChoose : function(){
		//若有选中的图形，则删除，否则不删除
		if(this.draggingIndex != null){
			var num = this.area[this.draggingIndex].getNumber();
			this.area.splice(this.draggingIndex, 1);
			this.draggingIndex = null;
			this.blocks = [];
			this.repaintAllShow();
			this.clearContextCur();
			//若删除的是最后一个，则需要修改max值
			if(num == this.maxNumber){
				this.maxNumber = this.maxNumber - 1;
			}
			return num;
		}
		if(this.lineIndex != null){
			var num = this.tripThreads[this.lineIndex].getNumber();
			this.tripThreads.splice(this.lineIndex, 1);
			this.lineIndex = null;
			this.lineBlocks = [];
			this.repaintAllLineShow();
			this.clearContextCur();
			//若删除的是最后一个，则需要修改max值
			if(num == this.maxNumber){
				this.maxNumber = this.maxNumber - 1;
			}
			return num;
		}
	},
	delSelectChoose : function(numList){
		//若有选中的图形，则删除，否则不删除
		//if(this.draggingIndex != null){
			/*var num = this.area[this.draggingIndex].getNumber();
			this.area.splice(this.draggingIndex, 1);
			this.draggingIndex = null;
			this.blocks = [];
			this.repaintAllShow();
			this.clearContextCur();
			//若删除的是最后一个，则需要修改max值
			if(num == this.maxNumber){
				this.maxNumber = this.maxNumber - 1;
			}*/
			//return num;
		//}
		//if(this.lineIndex != null){
			/*var num = this.tripThreads[this.lineIndex].getNumber();
			this.tripThreads.splice(this.lineIndex, 1);
			this.lineIndex = null;
			this.lineBlocks = [];
			this.repaintAllLineShow();
			this.clearContextCur();
			//若删除的是最后一个，则需要修改max值
			if(num == this.maxNumber){
				this.maxNumber = this.maxNumber - 1;
			}*/
			//return num;
		//}
			for(var i=0;i<numList.length;i++){
				for(var j= 0; j < this.area.length; j++){
					var num = this.area[j].getNumber();
					if(num==numList[i]){
						this.area.splice(j, 1);
					}
					
					
					//return num;
				}
				
				for(var k= 0; k < this.tripThreads.length; k++){
					var num = this.tripThreads[k].getNumber();
					if(num==numList[i]){
						this.tripThreads.splice(k, 1);
					}
					
					/*this.blocks = [];
					this.repaintAllShow();
					this.clearContextCur();
					
					if(num == this.maxNumber){
						this.maxNumber = this.maxNumber - 1;
					}*/
					//return num;
				}
				this.blocks = [];
				this.repaintAllShow();
				this.clearContextCur();
				
				if(num == this.maxNumber){
					this.maxNumber = this.maxNumber - 1;
				}
			}
	},
	delAllPaint: function(){
		//若有选中的图形，则删除，否则不删除
		this.area = [];
		this.tripThreads = [];
		
		this.draggingIndex = null;
		this.blocks = [];
		this.repaintAll();
		this.clearContextCur();
		this.lineIndex = null;
		this.lineBlocks = [];
		this.repaintAllLine();
		this.clearContextCur();
		this.maxNumber = 0;
		//TODO:
		//this.destroy();
	},
	delGrid : function(){
		this.clearContextGrid();
	},
	//修改选中绊线方向
	changeDirect : function(direct){
		if(this.lineIndex != null){
			this.clearContextCur();
			var tripThread = this.tripThreads[this.lineIndex];
			tripThread.direct = direct;
			tripThread.lineWidth = 2;
			tripThread.stroke(this.context_cur);
			tripThread.lineWidth = 2;
			var points = tripThread.points;
			tripThread.drawVertical(points[0].x, points[0].y, points[1].x, points[1].y, this.context_cur);
			tripThread.block(this.context_cur);
		}
	},
	//判断序号是否存在,numlist为以逗号隔开的序号列表
	judgNumberIn : function(num){
		for(var i= 0; i < this.area.length; i++){
			var polygon = this.area[i];
			if(num == polygon.getNumber())
				return true;
		}
		for(var i= 0; i < this.tripThreads.length; i++){
			var tripThread = this.tripThreads[i];
			if(num == tripThreads.getNumber())
				return true;
		}
		return false;
	},
	//根据用户选择显示的图像编号进行显示
	paintByConditionNums : function(numlist){
		this.clearContextCur();
		//根据图像编号，重画显示图形
		this.clearContext();
		for(var i = 0; i < this.area.length; i++){
			var curnum = this.area[i].getNumber();
			if(numlist.in_array(curnum)){
				var polygon = this.area[i];
				polygon.fill(this.context);
				polygon.stroke(this.context);
			}
		}
		//根据图像编号，重画显示绊线
		this.clearContextTripThread();
		for(var i = 0; i < this.tripThreads.length; i++){
			var curnum = this.tripThreads[i].getNumber();
			//在数组中的才显示
			if(numlist.in_array(curnum)){
				var tripThread = this.tripThreads[i];
				tripThread.stroke(this.context_tripThread);
				var points = tripThread.points;
				tripThread.drawVertical(points[0].x, points[0].y, points[1].x, points[1].y, this.context_tripThread);
			}
		}
	}
};
