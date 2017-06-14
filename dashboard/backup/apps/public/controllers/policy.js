'use strict';

/* jshint -W098 */
angular.module('mean.apps').controller('PolicyController', ['$scope', 'config', '$stateParams', '_', 'Health', 'Apps', '$timeout',
    function($scope, config, $stateParams, _, Health, Apps, $timeout) {

        var vmp = this,
            threshold = {},
            appId = $stateParams.appId,
            groupStacks,
            app;

        vmp.stacks = {};

        vmp.slides = ['security', 'performance', 'seo', 'backups', 'accessibility'];

        vmp.init = function() {
            groupStacks = $scope.vm.app.stacks;
            app = $scope.vm.app;
            groupStacks = _.indexBy(groupStacks, '_id');
            if (!app.policy) app.policy = {};
            initSliders();
        };
        var updateData = {
            app: {},
            action: 'updateDetails'
        };

        vmp.buttons = [{
            name: 'Government',
            ico: 'ico-gov',
            id: 'government'
        }, {
            name: 'Enterprise',
            ico: 'ico-ent',
            id: 'enterprise'
        }, {
            name: 'University',
            ico: 'ico-unv',
            id: 'university'
        }, {
            name: 'Startup',
            ico: 'ico-str',
            id: 'startup'
        }, ];

        vmp.changePolicySettings = function(id) {
            if (config.appPolicy[id]) {
                _.each(config.appPolicy[id], function(val, key) {
                    vmp.slides[key].value = val;
                    saveValue(key);
                });
                updateApp();

            }
        }

        function saveValue(key) {
            app.policy[key] = {
                value: vmp.slides[key].value,
                updated: Date.now()
            };
            threshold[key] = vmp.slides[key].value;
            updateData.app.policy = app.policy;
        }

        function updateApp() {
            Apps.update(app._id, updateData, function(err, data) {
                if (err) {
                    $('#result-of-save-policy').html('<div class="didnt-save"><div class="dot"></div><div class="pulse red"></div></div>');
                } else {
                    $('#result-of-save-policy').html('<div class="saved"><i class="fa fa-check-circle" aria-hidden="true"></i> <span class="text">Saved!</span></div>');
                }

                $('#result-of-save-policy').fadeIn();
                $timeout(function() {
                    $('#result-of-save-policy').fadeOut();
                }, 3000);

                if (err) {
                    if(err.status === 401)
                        return console.log("Canceled!", "You do not have permissions to update this group", "error");
                    else
                        return console.log('update group err', err);
                }
            });

        }

        function initSliders() {
            vmp.slides = _.map(vmp.slides, function(slide) {
                var initialValue = (app.policy && app.policy[slide]) ? app.policy[slide].value : 50;
                threshold[slide] = initialValue;
                return {
                    value: initialValue,
                    key: slide,
                    title: slide,
                    options: {
                        floor: 0,
                        ceil: 100,
                        showSelectionBar: true,
                        hideLimitLabels: true,
                        getSelectionBarColor: function(value) {
                            return 'red';
                        },
                        onEnd: function() {
                            saveValue(slide);
                            updateApp();
                        }
                    }
                };
            });
            vmp.slides = _.indexBy(vmp.slides, 'key');
            // getStacks();

        }



        function getStacks() {
            Health.stacksUnderThreshold(appId, threshold, function(err, data) {
                console.log(err, data);
                if (err) return swal('an error accourd, try again please', 'failed');
                vmp.stacks = _.pick(groupStacks, data.stacks);
                vmp.score = data.score;
            });
        }
    }
]);
