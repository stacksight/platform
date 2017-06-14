angular.module('mean.stack').directive('lineChart', [function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/stack/directives/charts/view/line-chart.html',
        scope: {
            options: '='
        }
    };
}]);