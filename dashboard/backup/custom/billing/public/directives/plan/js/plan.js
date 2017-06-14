angular.module('mean.billing').directive('plan', ['Global', function (Global) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/billing/directives/plan/views/plan.html',
        scope: {
            data: '=',
            promo: '=',
            features: '=',
            currentPlan: '=',
            src: '@'
        },
        link: function ($scope) {

            $scope.global = Global;

            if ($scope.src === 'plans') {
                $scope.btnText = ($scope.data.contactUs) ? 'contact us' :
                    ($scope.currentPlan._id === $scope.data._id) ? 'my current plan' :
                        ($scope.currentPlan.amount > $scope.data.amount) ? 'downgrade' : 'upgrade';
                $scope.disabled = ($scope.currentPlan._id === $scope.data._id) ? true : false;
            }

        }
    };
}]);