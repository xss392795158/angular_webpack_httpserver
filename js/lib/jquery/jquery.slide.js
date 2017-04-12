var j = 0;
var magic = magic || {};
magic = {
	timer:null,
	m:function(e){
		return e.length;
	},
	h:function(e,index){
		e.hide().eq(index).show();
	},
	r:function(e,n){
		e.removeClass('current').eq(n).addClass('current');
	},
	s:{
		_common:function(e,t,o){
			e.live(t,o);
		},
		_event:function(options,i,v){
			magic.s._common($(v),this._choose(options['event']),function(o){
				o.preventDefault();
				j = options['isturns'] ? i : j;
				magic.r($(options['btn']),i),magic.h($(options['show']),i);
			});
		},
		_choose:function(t){
			var str  = 'click';
			switch(t){
				case 1:
				str = 'mouseover';
				break;
			}
			return str;
		}
	},
	interval:function(options){
        magic.timer = setInterval(function(){
        	j = (j >= magic.m($(options['btn']))-1 ? 0 : j + 1);
			magic.r($(options['btn']),j),
			magic.h($(options['show']),j);
		},3000);
    },
	p_n:function(options){
		var i = 0;
		magic.s._common($(options['prev']),'click',function(e){
			e.preventDefault();
			i = i > 0 ? i - 1:magic.m($(options['ul']))-1;
			magic.h($(options['ul']),i);
			magic.r($(options['ul']),i);
		});
		magic.s._common($(options['next']),'click',function(e){
			e.preventDefault();

			i = i < magic.m($(options['ul'])) -1 ? i + 1:0;
			magic.h($(options['ul']),i);
			magic.r($(options['ul']),i);
		});
	},
	e:function(options){
		if(typeof(options['isturns']) != 'undefined'){
			if(options['isturns']){ // 开启幻灯效果
				magic.interval(options);
				$(options['show']).each(function(){
					magic.s._common($(this),'mouseover',function(){ // 鼠标放到内容上，停止幻灯效果
						clearInterval(magic.timer);
					});
					magic.s._common($(this),'mouseout',function(){ // 鼠标离开内容，停止幻灯效果
						magic.interval(options);
					});
				});
			}
		}
		$(options['btn']).each(function(i,v){
			magic.s._event(options,i,v);
		});
		
	}
}