angular
    .module('mean.profile')
    .directive('notificationSettings', notificationSettings);

function notificationSettings(Global, Profile, $location, _) {
    var directive = {
        link: link,
        templateUrl: '/profile/directives/notification-settings/views/notification-settings.html',
        restrict: 'E',
        scope: {
            data: '='
        }
    };
    return directive;

    function link(scope, element, attrs) {

        scope.global = Global;

        scope.frequencyOpts = [{
            label: 'Immediate',
            value: 'immediate',
            enabled: true
        }, {
            label: 'Daily',
            value: 'daily',
            enabled: false
        }, {
            label: 'Weekly',
            value: 'weekly',
            enabled: false
        }];

        scope.notifyByOpts = [{
            label: 'Email',
            value: 'email',
            enabled: true
        }, {
            label: 'Push notification',
            value: 'pushNotification',
            enabled: false
        }, {
            label: 'Slack',
            value: 'slack',
            enabled: Global.user.oauth_slack && Global.user.oauth_slack.access_token,
            message : '(To enable this option go to <a href="#!/profile/slack">here</a>)'
        }];
    }
}
