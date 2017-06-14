angular.module('mean.apps').directive('updatesNotifications', [function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/apps/directives/updates-notifications/views/updates-notifications.html',
        scope: {
            data: '='
        }
    };
}]);
