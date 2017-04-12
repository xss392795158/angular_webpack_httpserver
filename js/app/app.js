require.config({
    // 改变基目录（baseUrl）
    baseUrl : "./js",
    waitSeconds: 200,
    paths : {

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
        'text' : 'lib/requirejs/text'//,
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
    },
    priority: ['angular'],
    urlArgs: "ts=" + (new Date()).getTime()  //防止读取缓存，调试用
    //deps : ['app']
});

require(['angular', 'app/config/frame-app'], function (angular, app) {
    angular.bootstrap(document, ['app']);//手动加载模块
});