angular.module('mean.stacks').directive('annotation', ['Articles', function(Articles) {
    return {
        restrict: 'E',
        templateUrl: '/stacks/directives/annotation/views/annotation.html',
        scope: {
            data: '=',
            type: '@',
            id: '@',
            cb: '&?',
            stackId: '@'
        },
        replace: true,
        link: function($scope, element, attrs) {

            $scope.addAnnotation = function() {
                if (!$scope.data || !$scope.data.content) return;
                $scope.showInput = false;
                var article = new Articles({
                    type: 'logs',
                    content: $scope.data.content,
                    id: $scope.id,
                    stackId: $scope.stackId
                });
                article.$save(function(response) {});
            };

        }
    };
}]);
