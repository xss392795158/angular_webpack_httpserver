
define([
    'jquery',
    'angular',
    'angular.ui.router',
    'angular.resource'],
    function($, angular) {
        console.log('building frame.app......');
        var app = angular.module('app', ['ui.router', 'ngResource']);//, 'datatables', 'ngAnimate'
        
        var loadControllersAsync = function(controllers) {
	        return ['$q', function($q) {
	            var deferred = $q.defer();
	            require(controllers, function() {
	                deferred.resolve();
	            });
	            return deferred.promise;
	        }];
	    };
	    app.config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
            function($controllerProvider, $compileProvider, $filterProvider, $provide){
                app.register = {
                    //得到$controllerProvider的引用
                    controller : $controllerProvider.register,
                    //同样的，这里也可以保存directive/filter/service的引用
                    directive: $compileProvider.directive,
                    filter: $filterProvider.register,
                    provider: $provide.provider,
                    factory: $provide.factory,
                    service: $provide.service,
                    value: $provide.value,
                    constant: $provide.constant
                };

	    		app.register.constant('basePath', '');
            }
        ])
        .config(['$httpProvider',function($httpProvider){
        	$httpProvider.interceptors.push('securityInterceptor');
        }]).config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
			$urlRouterProvider.otherwise('/');
			$stateProvider
				/*.state("menu", {
	                url: "/",
	                cache: false,
					views: {
	                    '': {
	                        templateUrl: 'tpls/menu.html'
	                    },
	                    'content@menu':{
	                    	template: '<div ui-view></div>'
	                    }
	                }
	            })*/
				.state("index", {
	                url: "/",
	                cache: false,
					views: {
						/*'': {
	                        // template:'<div style="border:1px solid red;">index<div ui-view="header@index"></div><div ui-view="content@index"></div></div>'
	                        templateUrl: 'tpls/index.html'
	                    },*/
	                    'header@index': {
	                        controller: 'headerCtrl',
	                        // template:'<div>header</div>'
	                        templateUrl: 'tpls/header.html'
	                    },
	                    'content@index': {
	                    	controller: 'contentCtrl',
	                        // template:'<div ui-view>{{ctx}}<input type="number" ng-model="number" /><button ng-click = "square(1)">X<sup>2</sup></button><p>结果: {{result}}</p></div>'
	                        // templateUrl: 'tpls/content.html'
	                        template: '<div ui-view></div>'
	                    }
	                },
	                resolve: {
	                    loadCtrl: loadControllersAsync(['app/modules/header-controller','app/modules/content-controller'])
	                }
	            })
				.state("content", {
	                url: "/content",
					views: {
	                    '': {
	                        // template: '<div style="border:1px solid red;">here is content<ul><li ui-sref="content.a">content a</li><li ui-sref="content.b">content b</li></ul></div><div ui-view></div>'
	                        template: '<div ui-view></div>'
	                    }
	                }
	            })
	            .state("content1", {
	                url: "/content1",
					views: {
	                    '': {
	                        // template: '<div style="border:1px solid red;">here is content<ul><li ui-sref="content.a">content a</li><li ui-sref="content.b">content b</li></ul></div><div ui-view></div>'
	                        templateUrl: 'tpls/content1.html'
	                    }
	                }
	            })
	            .state("content2", {
	                url: "/content2",
					views: {
	                    '': {
	                        // template: '<div style="border:1px solid red;">here is content'
	                        templateUrl: 'tpls/content2.html'
	                    }
	                }
	            })
	            .state("content2.a", {
	                url: "/a",
					views: {
	                    '': {
	                        template: '<div style="border:1px solid red;">here is a</div>'
	                    }
	                }
	            })
	            .state("content2.b", {
	                url: "/b",
					views: {
	                    '': {
	                        template: '<div style="border:1px solid red;">here is b</div>'
	                    }
	                }
	            });
		}]).factory('securityInterceptor',['$q','$rootScope','$location',function($q,$rootScope,$location){
			return {
				request: function(config){
					return config|| $q.when(config);//$q.reject(response);
				},
				requestError: function(request){
					return $q.reject(request);
				},
				response: function(response){
					return response|| $q.when(response);
				},
				responseError: function(response){
					if(response && (response.status===401)){//||response.status===403
						//window.location.replace(base_path+"/login");
					}
					return $q.reject(response);
				}
			};
		}]).run(['$rootScope','$window','$location','$log','$templateCache',function($rootScope, $window, $location, $log, $templateCache) {
			var stateChangeSuccess = $rootScope.$on('$stateChangeSuccess',stateChangeSuccess); 
			function stateChangeSuccess($rootScope){
		    	$templateCache.removeAll();
		    }
		}]);
	    
        return app;
    }

);
