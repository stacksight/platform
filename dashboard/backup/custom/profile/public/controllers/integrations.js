'use strict';

/* jshint -W098 */
angular.module('mean.profile').controller('ProfileIntegrationsController', ['$scope', 'Global', 'Profile', 'Sapi', 'Stacks','$state',
    function($scope, Global, Profile, Sapi, Stacks, $state) {

        var vmpi = this;
        vmpi.global = Global;

        vmpi.integrations = [{
            label: 'Slack',
            name: 'slack'
        }, {
            label: 'Platform.sh',
            name: 'platform'
        }];
        vmpi.bag = [{
            label: 'Glasses',
            value: 'glasses',
            children: [{
                label: 'Top Hat',
                value: 'top_hat'
            }, {
                label: 'Curly Mustache',
                value: 'mustachio'
            }]
        }];

        vmpi.importPlatformProjects = function() {
            // var appId = $stateParams.appId;
            Stacks.importFromPlatform(vmpi.global.user, function(err, data) {
                vmpi.pShowLoader = false;
                if (err) return sweetAlert("Cancelled", err, "error");
                vmpi.platformProjects = data.user.oauth_platform.projects;
            });
        };

        vmpi.createPlatformStacks = function() {
            Stacks.createFromPlatform(vmpi.platformProjects, function(err, data) {
                if (err) return sweetAlert("Cancelled", err, "error");
                // sweetAlert({ type: 'success',   text: "You have new platform groups. move to <a ui-sref=\"apps\">apps</a> page",   html: true });
                sweetAlert("", "You have new platform groups", "success");
                setTimeout(function() {
                    $state.go('apps');
                }, 1000);
               
                console.log('createFromPlatform', data);
            });
        };
    }
]);
