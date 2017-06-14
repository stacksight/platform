'use strict';

/* jshint -W098 */
angular.module('mean.profile').controller('NotificationsController', ['$scope', 'Global', 'Profile', 'Sapi', 'Stacks', '$state', 'Companies',
    function($scope, Global, Profile, Sapi, Stacks, $state, Companies) {

        var vmn = this;
        vmn.global = Global;

        vmn.init = function() {
            Profile.notifications(function(err, data) {
                if (!err) vmn.notifications = data;
            });
        };
    }
]);