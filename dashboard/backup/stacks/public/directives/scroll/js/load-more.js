angular.module('mean.stacks').directive('loadMore', [function() {
    return {
        restrict: 'A',
        scope: {
            loadMore: '&'
        },
        link: function($scope, element, attrs) {
            var lastScrollTop = 0;
            element.scroll(function(event) {
                var st = $(this).scrollTop();
                // if (st <= lastScrollTop) {
                if (st <= attrs.top) {
                    $scope.loadMore();
                }
                lastScrollTop = st;
            });
        }
    };
}]);
