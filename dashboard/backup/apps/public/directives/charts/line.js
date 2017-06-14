angular.module('mean.apps').directive('lineChart', [function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/apps/directives/charts/view/line-chart.html',
        scope: {
            options: '='
        }
    };
}]);