'use strict';
angular.module('mean.intercom', ['ui.router', 'mean-factory-interceptor'])
    .run(['$rootScope', function($rootScope) {
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            window.Intercom('update');
        });

        $rootScope.$on('loggedin', function(event) {
            window.Intercom('boot', {
                app_id: 'fszo6i9t',
                name: $rootScope.user.name,
                email: $rootScope.user.email,
                user_id: $rootScope.user._id,
                created_at: $rootScope.user.created,
                widget: {
                    activator: '#IntercomDefaultWidget'
                }
            });
        });
    }]);
