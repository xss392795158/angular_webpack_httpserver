require.config({
    // 改变基目录（baseUrl）
    baseUrl : "./js",
    waitSeconds: 200,
    paths : {
        // libraries config
//        'bootstrap': 'lib/bootstrap/js/bootstrap.min',
//        'bootstrap.respond': 'lib/bootstrap/respond.min',

        'jquery': 'lib/jquery/jquery-1.10.2', 
        'jquery-1.12.0': 'lib/plugins/datatable/js/jquery',

        'angular': 'lib/angularjs/angular-1.5.8/angular.min',
        'angularAMD': 'lib/angularjs/angular-amd/angularAMD.min',
        'ngload': 'lib/angularjs/angular-amd/ngload.min',

        'angular.resource': 'lib/angularjs/angular-1.5.8/angular-resource.min',
        'angular.animate': 'lib/angularjs/angular-1.5.8/angular-animate.min',
        'angular.ui.router': 'lib/angularjs/angular-ui-router',

        // plugins config
        'domReady' : 'lib/requirejs/domReady',
        'text' : 'lib/requirejs/text',
       'app': ['app/app']//,
        // controllers config
		// 控制器由于会有变动，因此一般不再这里进行配置，直接在相关业务模块中根据路径引用
    },
   map: {
   	'*': {
   		'css':'lib/css.min'
   	}
   },
    // require可以直接使用采用AMD规范编写的模块
    // shim用于配置与require不兼容的模块
    shim : {
        'angular': {
            exports: 'angular',
            deps: ['jquery']
        },
        'angularAMD': ['angular'],
        'ngload': ['angularAMD'],
        'angular.resource': ['angular'],
        'angular.animate':['angular'],
        'angular.ui.router': {
            deps: ['angular'],
            exports: 'uiRouter'
        },
        'app/config/frame-app': ['angular.ui.router']//,
//        'video/timeslider': ['video/calenderEx'],
//        'picList':['jquery'],
//        'videojs-in-global': ['videojs'],
//        'video/video-timeline': ['jquery.mousewheel','videojs.contrib.hls', 'videojs.playlist', 'videojs.lang.zh-CN', 'videojs-in-global', 'common/public-func', 'common/common', 'video/timeslider','picList'],
//        'common/record-config': ['jquery.ui.dialog'],
//        'setting/devices-controller': ['jquery.ui.dialog'],
//        'frame/record-list-controller': ['jquery.ui.dialog'],
//        'frame/record-plan-controller': ['jquery.ui.dialog'],
//        'frame/record-tpl-controller': ['jquery.ui.dialog','my97.datepicker'],
//        'video/videoMenu-controller': ['jquery.ui.dialog'],
//        'setting/system-controller': ['setting/system-directive'],
//        'frame/header-controller': ['common/common'],
//        'mBox': ['jquery'],
//        'dialog': ['jquery'],
//        'nstSlider': ['jquery'],
//        'knob': ['jquery'],
//        'plugins/paint/paint':['jquery','plugins/array'],
//        'video/video-controller': ['css!../plugins/zTree/css/ztree-style-black.css'],
//        'summary/summary-controller': ['css!../plugins/zTree/css/ztree-style-white.css'],
//        'setting/devices-controller': ['css!../plugins/zTree/css/ztree-style-white.css'],
//        'setting/system-controller': ['css!../plugins/zTree/css/ztree-style-white.css'],
//        'setting/record-controller': ['css!../plugins/zTree/css/ztree-style-white.css'],
//        'setting/log-controller': ['css!../plugins/zTree/css/ztree-style-white.css']
    },
    priority: ['angular'],
    urlArgs: "ts=" + (new Date()).getTime()  //防止读取缓存，调试用
    //deps : ['app']
});

//define('videojs-in-global', ['videojs'], function(videojs) {
//	window.videojs = videojs;
//});


