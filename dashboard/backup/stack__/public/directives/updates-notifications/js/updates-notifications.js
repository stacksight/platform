angular.module('mean.stack').directive('updatesNotifications', [function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/stack/directives/updates-notifications/views/updates-notifications.html',
        scope: {
            data: '='
        }
    };
}]);
