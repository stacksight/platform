
angular.module('mean.stacks').directive('eventComponents',[function (){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/stacks/directives/event/views/event.html',
        scope: {
        	data: '='
        },
        link: function($scope, element, attrs) {}
    };
}]);