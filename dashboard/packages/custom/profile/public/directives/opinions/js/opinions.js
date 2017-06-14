angular.module('mean.profile').directive('opinions', opinions);

function opinions(Global, $http) {
    var directive = {
        link: link,
        templateUrl: '/profile/directives/opinions/views/opinions.html',
        restrict: 'E',
        scope: {
            options: '='
        }
    };
    return directive;
    function link(scope, element, attrs) {
        scope.global = Global;
        $http.get('/profile/directives/opinions/opinions.json').success(function(data) {
            scope.opinions = data;
        });
    }
}