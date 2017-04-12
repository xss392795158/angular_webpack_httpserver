
define([
	'jquery',
	'angular',
	'app/config/frame-app',
	'domReady!',
	'angular.ui.router',
	'angular.resource',
	'app/modules/content-service'],

	function($, angular,runApp) {
		'use strict';

		 runApp.register.constant('b', 'bConstant');
		 runApp.register.provider('a', function(b) {
         	this.$get = function(b){
         		var s = 'a'+b;
         		return s;
         	}
         });
         
		var controller = runApp.register.controller('contentCtrl', ['$scope', '$rootScope', '$state','$location', 'CalcService','b','a',function ($scope, $rootScope, $state, $location,CalcService,b,a) {
		    console.warn('enter content-controller!');
		    console.log('b:'+b);
		    console.log('a:'+a);
		    $scope.ctx = 'content build by js';
		    $scope.goRecordMenu = function(type){
		    	$scope.isSelect = type;
		    };
		    var defaultInput = 5;
		    var url = $location.absUrl();
		    var tab = '';//url.split('#')[1].split('/index/')[1].split('/')[0];
		    if(!url.split('#')[1] ||!url.split('#')[1].split('/index/')[1]){
		    	
		    } else {
		    	tab = url.split('#')[1].split('/index/')[1].split('/');
		    	if(tab[0] == 'record'){
			    	$scope.goRecordMenu(tab[1]);
			    }
		    }
		    $rootScope.$on('goRecordMenu',function(event,param){
		    	//console.log('goRecordMenu: '+param);
		    	$scope.goRecordMenu(param);
		    });
	    	
	    	$scope.editUser = function(id){
	    		alert('id = '+id);
	    	};

	    	$scope.number = defaultInput;
            $scope.result = CalcService.square($scope.number);

            $scope.square = function() {
               $scope.result = CalcService.square($scope.number);
            }

		}]);
        runApp.register.provider('MathService', function() {
           this.$get = function() {
              var factory = {};
              
              factory.multiply = function(a, b) {
                 return a * b;
              }
              return factory;
           };
        });

		//return controller;
	}
);
	
	
