angular.module('mean.general').directive('sideBar', ['$state', '$compile', function($state, $compile) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/general/directives/side-bar/views/side-bar.html',
        transclude: true,
        scope: {
            data: '='
        },
        link: function($scope, element, attrs) {

            $scope.$state = $state;

            $scope.compileTemplate = function(template, index) {
                if (template) {
                    var tplEl = $compile(template)($scope);
                    $('.template').append(tplEl);
                }
            };

            // $scope.go = $state.go.bind($state);
            $scope.go = function(link, params) {
                if (!link) return;
                $state.go(link, params);
            };

        }
    };
}]);
