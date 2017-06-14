'use strict';

angular.module('mean.wixmedia').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider
            .state('wixmedia settings', {
                url: '/wixmedia/settings',
                templateUrl: 'wixmedia/views/settings.html',
                controller: 'SettingsWixController',
                resolve: {
                    settings: ['Wixmedia', function(Wixmedia) {
                        return Wixmedia.getSettings();
                    }]
                }
            })
            .state('wixmedia example page', {
                url: '/wixmedia/example',
                templateUrl: 'wixmedia/views/example.html'
            });
    }
]);
