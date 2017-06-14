angular.module('mean.billing').directive('subscription', ['Global', 'StripeService', function(Global, StripeService) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/billing/directives/plan/views/subscription.html',
        scope: {
            data: '=',
            subscribe: '&',
        },
        link: function($scope) {}
    };
}]);
