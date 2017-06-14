'use strict';

/* jshint -W098 */
angular.module('mean.stacks').controller('StacksController', ['$scope', 'Global', 'Stacks', '$stateParams', '$state', '$uibModal', '$rootScope', 'Apps', 'Updates', '$timeout', 'MeanSocket', 'ConfigApp', 'Integrations', 'localStorageService',
    function($scope, Global, Stacks, $stateParams, $state, $uibModal, $rootScope, Apps, Updates, $timeout, MeanSocket, ConfigApp, Integrations, localStorageService) {
        $scope.global = Global;
        $scope.$state = $state;

        var vms = this;

        $scope.env = $stateParams.env;

        $scope.$params = $stateParams;

        $scope.collapse = {
            opened: false
        };

        var features = {
            events: ['mean', 'wordpress', 'drupal', 'nodejs', 'symfony2', 'magento2'],
            logs: ['mean', 'wordpress', 'drupal', 'nodejs', 'symfony2', 'magento2'],
            sessions: ['mean', 'nodejs'],
            updates: ['wordpress', 'drupal', 'nodejs', 'magento2'],
            health: ['wordpress', 'drupal', 'web'],
            inventory: ['wordpress', 'drupal'],
            integrations: ['all'],
            builds: [],
            settings: ['all']
        };

        ConfigApp.get().then(function(config) {
            vms.billingProvider = config.billingProvider;
        }, function(err) {
            console.log(err);
        });

        $timeout(function() {
            $scope.scrollTopHeight = ($('.page-header').height() + $('.top').height());
        }, 10);

        $scope.sideBarData = {
            tabs: [{
                title: 'events',
                link: 'stack.events',
                platforms: features.events,
                views: ['grid', 'list']
            }, {
                title: 'logs',
                link: 'stack.logs',
                platforms: features.logs,
                views: ['grid', 'list']
            }, {
                title: 'sessions',
                link: 'stack.sessions',
                platforms: features.sessions
            }, {
                title: 'updates',
                link: 'stack.updates',
                platforms: features.updates,
                template: '<updates-notifications data="data.updates"></updates-notifications>'
            }, {
                title: 'health',
                link: 'stack.health.type',
                params: {
                    type: 'performance'
                },
                views: ['grid', 'list'],
                platforms: features.health
            }, {
                title: 'inventory',
                link: 'stack.inventory',
                platforms: features.inventory
            }, {
                title: 'integrations',
                link: 'stack.integrations.main',
                childrenLinks: ['stack.integrations.service.settings'], //for active parent state
                platforms: features.integrations
            }, {
                title: 'builds',
                link: 'stack.builds.service',
                params: {},
                platforms: features.builds
            }, {
                title: 'settings',
                link: 'stack.settings',
                platforms: features.settings,
                views: ['grid', 'list']
            }],
            src: 'stack',
            isCollapse: true
        };

        $scope.groups = [];
        $scope.group = {};

        setQuickLinks();

        $scope.findOne = function() {
            var id = $stateParams.id;
            Stacks.findOne(id, function(data) {
                $scope.stack = data;
                $scope.selectedStackId = id;
                $scope.sideBarData.stack = $scope.stack;
                displayBuildsTabs();
            });
            Updates.all([id], function(err, updates) {
                if (err) return console.log('GET UPDATES ERR:', err);
                $scope.sideBarData.updates = updates[id];
            });
        };

        function displayBuildsTabs() {
            var integrations = _.map(Integrations.services.ci.subServices, 'name');
            if (!$scope.stack.integrations || !$scope.stack.integrations.length) return;
            var buildsTabIndex = _.findIndex($scope.sideBarData.tabs, function(o) {
                return o.title == 'builds';
            });
            delete $scope.sideBarData.tabs[buildsTabIndex].params.service;
            integrations.forEach(function(service) {
                var o = _.find($scope.stack.integrations, {
                    name: service,
                    enable: true
                });
                if (o) findTabEndDisplay(buildsTabIndex, o.name);
            });
        };

        function findTabEndDisplay(index, name) {
            $scope.sideBarData.tabs[index].platforms.push('all');
            if (!$scope.sideBarData.tabs[index].params.service) $scope.sideBarData.tabs[index].params.service = name;
        }

        function setQuickLinks() {
            if (!$scope.vm || !$scope.vm.app) return;
            var stacks = $scope.vm.app.stacks;
            stacks.forEach(function(stack) {
                stack.links = [];
                $scope.sideBarData.tabs.forEach(function(link) {
                    link = JSON.parse(JSON.stringify(link));
                    if (link.views && (link.platforms.indexOf(stack.platform) > -1 || link.platforms.indexOf('all') > -1)) {
                        link.params = link.params || {};
                        link.params.id = stack._id;
                        stack.links.push(link);
                    }
                });
            });
        }

        $scope.changeStack = function(stack) {
            $state.go('.', {
                id: stack._id
            });
        };

        $scope.clear = function() {
            $scope.group.selected = undefined;
        };

        vms.initSetting = function() {
            Apps.find(function(err, data) {
                if (!err) {

                    _.each(data.apps, function(value, key) {
                        var group = {
                            '_id': value._id,
                            'name': value.name
                        };
                        $scope.groups.push(group);
                        if ($scope.stack.app._id == value._id) {
                            $scope.group.selected = group;
                        }
                    });
                }
            });
        }

        vms.update = function(valid, stack, src) {
            if (valid) {
                Stacks.update(stack._id, stack, function(err, data) {
                    if (err && err.status === 401) return sweetAlert("Canceled!", "You do not have permissions to update this stack", "error");
                    if (err) return console.log('update stack err', err);
                    stack.edit = false;
                    stack.origName = stack.name;
                    // if($scope.group.selected && $scope.group.selected._id){
                    //     vms.relocationStack(stack, $scope.group.selected._id);
                    // }
                    if (src === 'settingsTab') {
                        sweetAlert("Settings saved !", "", "success");
                    } else if (src === 'stack-form-up' || src === 'stack-form-emup') {
                        sweetAlert("Domain updated! You can see first data after ~3 min.", "", "success");
                    } else if (src === 'stack-form-add') {
                        sweetAlert("Domain saved! You can see first data after ~3 min.", "", "success");
                    }
                });
            }
        };


        //stacks gallery removed !
        vms.relocationStack = function(stack, toAppId) {
            if (toAppId === stack._id) return;
            Stacks.relocation(stack._id, toAppId, function(err, data) {
                // if (err) return console.log('RELOCATION STACK ERROR', err);
                if (err) return sweetAlert("Canceled!", "You do not have permissions to relocation this stack", "error");
                $scope.stack.app = {
                    _id: $scope.group.selected._id,
                    name: $scope.group.selected.name
                };
                sweetAlert("", "Stack group changed successfully!", "success");
            });
        };

        vms.moveToStack = function(stack) {
            var state = (stack.platform === 'web') ? 'stack.health.type' : 'stack.events';
            $state.go(state, {
                id: stack._id,
                type: 'performance'
            });
        };

        vms.delete = function(stack, index) {
            Stacks.delete(stack._id, function(err, data) {
                if (err && err.status === 401) return sweetAlert("Canceled!", "You do not have permissions to delete this stack", "error");
                if (err) return console.log('delete stack err', err);
                $rootScope.$broadcast('stackDeleted', {
                    stack: stack
                });
            });
        };

        var storageType = localStorageService.getStorageType();
        var filter_type = localStorageService.get('stacks_filter_type');
        if (!filter_type) {
            vms.filer_view = 'grid';
            localStorageService.set('stacks_filter_type', 'grid');
        } else {
            if (filter_type == 'grid')
                vms.filer_view = 'grid';
            else
                vms.filer_view = 'list';
        }

        vms.change_view_filter = function(type) {
            if (type == 'grid') {
                vms.filer_view = 'grid';
                localStorageService.set('stacks_filter_type', 'grid');
            } else {
                vms.filer_view = 'list';
                localStorageService.set('stacks_filter_type', 'list');
            }
        };

        vms.openModal = function(size) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'addStackModal',
                controller: 'ModalsController as vmodal',
                windowClass: 'addStackModalClass',
                resolve: {
                    vms: function() {
                        return vms;
                    },
                    vm: function() {
                        return $scope.vm
                    }
                }
            });
        };

        MeanSocket.emit('user joined token', {
            id: $scope.global.user.profile.token
        });

        $scope.$on('update stack tabs', function(event, args) {
            displayBuildsTabs();
        });
    }
]);