
define([
	'jquery',
	'angular',
	'app/config/frame-app',
	'domReady!',
	'angular.ui.router',
	'angular.resource'],

	function($, angular,runApp) {
		'use strict';
		var controller = runApp.register.controller('headerCtrl', ['$scope', '$rootScope', '$state','$location', '$timeout',function ($scope, $rootScope, $state, $location, $timeout) {
			console.warn('enter header-controller!');
		}]);	
//           *******弹出修改密码，退出栏
        // return controller;
	}
);
	
	
