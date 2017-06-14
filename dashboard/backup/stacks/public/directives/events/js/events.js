
angular.module('mean.stacks').directive('eventsComponents',[function (){
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/stacks/directives/events/views/events.html',
        scope: {
            data: '=',
            stackId: '='
        },
        link: function($scope, element, attrs) {}
    };
}]);