angular.module('mean.stack').directive('ngSlideMenu', function(slideMenu) {
    return {
        restrict: "A",
        link: function (scope, elem, attrs) {
            return elem.click(function () {
                var menu;
                menu = angular.element("#" + attrs.ngSlideMenu);
                return slideMenu.slide(menu, elem);
            });
        }
    };
});