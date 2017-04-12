	/**
		 * 使用：
		 *
		 * $("#j_massageBox").msgSet({
		 * 	title : '标题一',
		 * 	txt0 : '内容一',
		 * 	txtIconClass:'questionBigIcon',
		 * 	width: 800,
		 *  btns:false
		 * 	btns:{confirm: 'ok',cancel: 'not ok'},
		 * 	txt1Content:'您的账号已经于'+data.loginTime+'在'+data.userIp+'登录，您被迫下线',
		 * 	onClose:function(){
		 * 		closeFn();
		 * 	},
		 * 	onConfirm:function(){
		 * 		confirmFn();
		 * 	},
		 * 	onCancel:function(){
		 * 		cancelFn();
		 * 	}
		 * });
		 *
		 */
    //$(function(){
		var _hide = function(elem) {
		    elem.style.opacity = '';
		    elem.style.display = 'none';
		};
		var fadeIn = function(elem, interval) {
		    if (+elem.style.opacity < 1) {
		      interval = interval || 16;
		      elem.style.opacity = 0;
		      elem.style.display = 'block';
		      var last = +new Date();
		      var tick = function() {
		        var newOpacity = +elem.style.opacity + (new Date() - last) / 100;
		        elem.style.opacity = (newOpacity > 1) ? 1 : newOpacity;
		        last = +new Date();
		
		        if (+elem.style.opacity < 1) {
		          setTimeout(tick, interval);
		        }
		      };
		      tick();
		    }
		  };
		
		  var fadeOut = function(elem, interval) {
		    if (+elem.style.opacity > 0) {
		      interval = interval || 16;
		      var opacity = elem.style.opacity;
		      var last = +new Date();
		      var tick = function() {
		        var change = new Date() - last;
		        var newOpacity = +elem.style.opacity - change / (opacity * 100);
		        elem.style.opacity = newOpacity;
		        last = +new Date();
		
		        if (+elem.style.opacity > 0) {
		          setTimeout(tick, interval);
		        } else {
		          _hide(elem);
		        }
		      };
		      tick();
		    }
		  };
		  
		$.fn.msgSet = function(setting){
			var defaults = {
				//renderTo : $(document.body),
				width : 600,
				title : '提醒',
				style: {
//					width:,
//					height:,
//					align:,
//					lineHeight:
				},
				txtIconClass : false,
				txt1Content: false,
				btns:{confirm: '确定',cancel: '取消'},
				onClose:false,
				onConfirm:false,
				onCancel:false
			};

			var setting = $.extend(defaults,setting);

			return this.each(function(){
				var thisDiv = this;
				thisDiv.innerHTML = '';
                var modalBlack = document.createElement('div');//遮罩层
                modalBlack.className = 'modal_black';//遮罩层
				var thisDiv1 = document.createElement('div');//
                var title = document.createElement('div');//
				var titleText = document.createElement('span');//
				var closeBtn = document.createElement('b');//
				thisDiv1.className = 'msgbox hideForm dialog del-box';
				thisDiv1.style.width = defaults.width+'px';
//				thisDiv.style.marginLeft = -parseInt(defaults.width/2)+'px';
				title.className = 'popTitle dialog-head del-boxhead clearfix';
				titleText.className = 'popTitleText fl';
				titleText.innerHTML = defaults.title;
				closeBtn.className = 'closeIcon fr dialog-head-b';
				closeBtn.innerHTML = 'X';

				if(defaults.onClose){
					closeBtn.onclick = function(){
						if($("#masker") && $("#masker").length > 0){
							$("#masker").hide();
						}
						fadeOut(thisDiv);
						defaults.onClose();
					};
				}else{
					closeBtn.onclick = function(){
						if($("#masker") && $("#masker").length > 0){
							$("#masker").hide();
						}
						fadeOut(thisDiv);
					};
				}

				title.appendChild(titleText);
				title.appendChild(closeBtn);
				thisDiv1.appendChild(title);
                thisDiv.appendChild(thisDiv1);
                thisDiv.appendChild(modalBlack);

				if(defaults.txt1Content){
					var txtCon = document.createElement('div');
                    var txtConTxt = document.createElement('div');
					txtCon.className = 'w300 dialog-body del-boxbody clearfix';
                    txtConTxt.className = 'f14 fl';
                    txtConTxt.innerHTML = defaults.txt1Content;
                    txtConTxt.style = 'overflow:auto;font-weight:normal;padding-left:45px;margin-left:'+Math.floor((defaults.width/8))+'px';
                    var s = defaults.style;
                    txtConTxt.style.textAlign = s.align ? s.align : '';
					txtConTxt.style.height = s.height ? s.height+'px' : '';
					txtConTxt.style.lineHeight = s.lineHeight ? s.lineHeight+'px' : '';
					
					if(defaults.txtIconClass){
						var txtConIcon = document.createElement('span');
						txtConIcon.className = 'msgBg fl' + defaults.txtIconClass;
                        txtCon.appendChild(txtConIcon);
					}

					if(defaults.txtIconClass){
						var _w = s.width || (defaults.width-258);
						txtConTxt.style.width = _w +'px';
					}else{
						var _w = s.width || (defaults.width-200);
						txtConTxt.style.width = _w +'px';
						
					}

					txtCon.appendChild(txtConTxt);
                    txtCon.style.display = "block";
                    thisDiv1.appendChild(txtCon);
				}

                if(defaults.btns){
                    var btns = document.createElement('div');
                    btns.className = 'mBoxBtns dialog-btn';
                    thisDiv1.appendChild(btns);

                    if(defaults.btns.confirm){
                        var confirmBtn = document.createElement('div');
                        confirmBtn.className = 'confirm fr btnn btn-blue';
                        confirmBtn.innerHTML = defaults.btns.confirm;
                        confirmBtn.style.display = "inline-block";
                        btns.appendChild(confirmBtn);

                        if(defaults.onConfirm){
                            confirmBtn.onclick = function(){
                                if($("#masker") && $("#masker").length > 0){
                                    $("#masker").hide();
                                }
                                fadeOut(thisDiv);
                                defaults.onConfirm();
                            };
                        }else{
                            confirmBtn.onclick = function(){
                                if($("#masker") && $("#masker").length > 0){
                                    $("#masker").hide();
                                }
                                fadeOut(thisDiv);
                            };
                        }
                    }

                    if(defaults.btns.cancel){
                        var cancelBtn = document.createElement('div');
                        cancelBtn.className = 'cancel fr btnn btn-gray';
                        cancelBtn.innerHTML = defaults.btns.cancel;
                        cancelBtn.style.display = "inline-block";
                        btns.appendChild(cancelBtn);

                        if(defaults.onCancel){
                            cancelBtn.onclick = function(){
                                if($("#masker") && $("#masker").length > 0){
                                    $("#masker").hide();
                                }

                                fadeOut(thisDiv);
                                defaults.onCancel();
                            };
                        }else{
                            cancelBtn.onclick = function(){
                                if($("#masker") && $("#masker").length > 0){
                                    $("#masker").hide();
                                }
                                fadeOut(thisDiv);
                            };
                        }
                    }
                }

				fadeIn(thisDiv);
				/*$(thisDiv).draggable({
					containment:"#dragArea"
				});*/
			});
		};
