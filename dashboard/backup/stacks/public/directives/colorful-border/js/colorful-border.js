
angular.module('mean.stacks').directive('colorfulBorder',[function (){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/stacks/directives/colorful-border/views/colorful-border.html',
        scope: {
        	colors: '='
        },
        link: function($scope, element, attrs) {
        }
    };
}]);