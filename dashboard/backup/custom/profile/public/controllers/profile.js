'use strict';

/* jshint -W098 */
angular.module('mean.profile').controller('ProfileController', ['$scope', 'config', 'Global', 'Profile', 'Sapi',
    function($scope, config, Global, Profile, Sapi) {

        var vm = this;
        vm.global = Global;
        $scope.profileImage = {
            url: vm.global.user.profile.pictures.profile
        };

        $scope.slack_app_id = config.slack.app_id

        $scope.tabs = [{
            title: 'General',
            link: 'profile.general',
            platforms: ['all']
        }, {
            title: 'Password',
            link: 'profile.password',
            platforms: ['all']
        }, {
            title: 'Billing',
            link: 'profile.billing',
            platforms: ['all']
        }, {
            title: 'Notifications',
            link: 'profile.notifications',
            platforms: ['all']
        }, {
            title: 'Integrations',
            link: 'profile.integrations',
            platforms: ['all']
        }];

        vm.updatePassword = function(valid) {
            if (valid)
                Sapi.put({
                    cmd_api: '/user',
                    data: {
                        password: vm.password
                    }
                }).then(function(data) {
                    sweetAlert("Your password has changed!", "", "success");
                    vm.password = '';
                    vm.confirmPassword = '';
                }, function(data) {
                    sweetAlert("Cancelled", ":(  Your password has not changed, try again", "error");
                });
            else sweetAlert("Passwords do not match");
        };

        vm.update = function(valid) {
            if (valid)
                Profile.update(vm.global.user, function(err, data) {
                    if (err) return sweetAlert("Cancelled", ":(  Your details have not been changed, try again", "error");
                    sweetAlert("Your details have been changed!", "", "success");
                });
        };

        $scope.$watch('profileImage', function(val) {
            vm.global.user.profile.pictures.profile = val.url;
        }, true);

        vm.notificationsTypes = [{
            label: 'Updates',
            name: 'updates'
        }, {
            label: 'Integrations',
            name: 'integrations',
            subTypes: [{
                name: 'integrations-platform',
                label: 'Platform.sh'
            }]
        }, {
            label: 'Logs',
            name: 'logs',
            subTypes: [{
                name: 'logs-error',
                label: 'Error Logs'
            }]
        }];
    }
]);
