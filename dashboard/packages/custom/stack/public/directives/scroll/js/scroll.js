angular.module('mean.stack').directive("scroll", function($window) {
    return {
        link: function(scope, element, attrs) {
            angular.element($window).bind("scroll", function() {
                if (($window.innerHeight + $window.scrollY) >= document.body.scrollHeight) {
                    scope.sDown();
                }
                if (scope.sAll) scope.sAll();
            });
        },
        scope: {
            sDown: '&',
            sAll: '&',
            sUp: '&'
        }
    };
});
