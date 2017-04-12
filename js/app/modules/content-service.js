
define(['angular','app/config/frame-app', 'angular.resource'], function(angular, runApp) {
    'use strict';

    runApp.register.service("contentServive", function($rootScope) {
        return {
            safeApply: function($scope, fn){
                var phase = $scope.$root.$$phase;
                if(phase == '$apply'||phase == '$digest'){
                    if (fn && typeof fn === 'function') {
                        fn();
                    }
                } else {
                    $scope.$apply(fn);
                }
            },
            change: function(n) {
                $rootScope.$broadcast("valueChange", n);

            }
        };
    });

    runApp.register.service('CalcService', function(MathService){
        this.square = function(a) {
           return MathService.multiply(a,a);
        }
     });

    runApp.register.factory('MathService', function() {
        var factory = {};
        factory.multiply = function(a, b) {
           return a * b;
        }
        return factory;
     });
    return runApp;
});
