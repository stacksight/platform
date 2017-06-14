angular.module('mean.stacks').directive("scroll", function() {
    return {
        link: function(scope, element, attrs) {

            angular.element(element).bind("scroll", function() {

                var middle = document.getElementsByClassName('middle')[0];
                var middleContent = document.getElementsByClassName('middle-content')[0];

                var s = middle.scrollTop + middle.clientHeight;
                var h = middleContent.scrollHeight;

                if (scope.sDown && s >= h) scope.sDown();
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
