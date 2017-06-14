'use strict';

angular.module('mean.system', ['ui.router', 'mean-factory-interceptor'])
    .run(['$rootScope', 'Global', function($rootScope, Global) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {});

        var states = ['company', 'stacks', 'stack', 'profile', 'health', 'integrations', 'builds'];

        $rootScope.$on('$stateChangeSuccess',
            function(event, toState, toParams, fromState, fromParams) {
                var found = false;
                states.forEach(function(state) {
                    if (found) return;
                    if (toState.name.indexOf(state) > -1) {
                        $rootScope.state = toState.name.replace(/\./g,'-');
                        found = true;
                    }
                });
                if (found) return;
                var toPath = toState.url;
                toPath = toPath.replace(new RegExp('/', 'g'), '');
                toPath = toPath.replace(new RegExp(':', 'g'), '-');
                $rootScope.state = toPath;
                if ($rootScope.state === '') {
                    $rootScope.state = 'firstPage';
                }
            });
    }]);
