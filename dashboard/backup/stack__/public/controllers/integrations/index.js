'use strict';

/* jshint -W098 */
angular.module('mean.stack').controller('IntegrationsController', ['$scope', 'Global', '$stateParams', 'MeanSocket', 'Integrations', 'Stacks', '$state', '_',
    function($scope, Global, $stateParams, MeanSocket, Integrations, Stacks, $state, _) {

        var vmi = this;
        vmi.$stateParams = $stateParams;

        vmi.viewTabs = $state.current.name.indexOf('builds') > -1;

        vmi.bodyJson = {
            "category": "backups",
            "title": "Custom BackupSight",
            "desc": "Our custom backups",
            "widgets": [{
                "type": "backup",
                "title": "Our backups",
                "desc": "Our custom backups",
                "group": 1,
                "order": 1,
                "data": {
                    "2016-05-30": [{
                        "timestamp": 1464601229,
                        "file": ["drupal.local-2016-05-30T15-57-25.mysql.gz", "backup_2016-05-30-1022_drupal1_1707e84eb400-themes.zip"],
                        "dest": ["local_destination"],
                        "source": "Default Database",
                        "size": "62806",
                        "links": {
                            "download": "http://drupal.local/admin/config/system/backup_migrate/settings/destination/downloadfile/local_destination/drupal.local-2015-11-05T15-57-25.mysql.gz",
                            "restore": "http://drupal.local/admin/config/system/backup_migrate/settings/destination/list/restorefile/local_destination/drupal.local-2015-11-05T15-57-25.mysql.gz",
                            "delete": "http://drupal.local/admin/config/system/backup_migrate/settings/destination/list/deletefile/local_destination/drupal.local-2015-11-05T15-57-25.mysql.gz"
                        }
                    }, {
                        "timestamp": 1464601300,
                        "file": ["drupal.local-2016-05-30T15-19-31.mysql.gz"],
                        "dest": ["local_destination"],
                        "source": "Default Database",
                        "size": "62803",
                        "links": {
                            "download": "http://drupal.local/admin/config/system/backup_migrate/settings/destination/downloadfile/local_destination/drupal.local-2015-11-05T15-19-31.mysql.gz",
                            "restore": "http://drupal.local/admin/config/system/backup_migrate/settings/destination/list/restorefile/local_destination/drupal.local-2015-11-05T15-19-31.mysql.gz",
                            "delete": "http://drupal.local/admin/config/system/backup_migrate/settings/destination/list/deletefile/local_destination/drupal.local-2015-11-05T15-19-31.mysql.gz"
                        }
                    }, {
                        "timestamp": 1464601326,
                        "file": ["drupal.local-2016-05-30T08-25-21.mysql.gz"],
                        "dest": ["local_destination"],
                        "source": "Default Database",
                        "size": "62798",
                        "links": {
                            "download": "http://drupal.local/admin/config/system/backup_migrate/settings/destination/downloadfile/local_destination/drupal.local-2015-11-05T08-25-21.mysql.gz",
                            "restore": "http://drupal.local/admin/config/system/backup_migrate/settings/destination/list/restorefile/local_destination/drupal.local-2015-11-05T08-25-21.mysql.gz",
                            "delete": "http://drupal.local/admin/config/system/backup_migrate/settings/destination/list/deletefile/local_destination/drupal.local-2015-11-05T08-25-21.mysql.gz"
                        }
                    }],
                    "2016-05-31": [{
                        "timestamp": 1464687726,
                        "file": ["drupal.local-2016-05-31T15-57-25.mysql.gz"],
                        "dest": ["local_destination"],
                        "source": "Default Database",
                        "size": "62806",
                        "links": {
                            "download": "http://drupal.local/admin/config/system/backup_migrate/settings/destination/downloadfile/local_destination/drupal.local-2015-11-05T15-57-25.mysql.gz",
                            "restore": "http://drupal.local/admin/config/system/backup_migrate/settings/destination/list/restorefile/local_destination/drupal.local-2015-11-05T15-57-25.mysql.gz",
                            "delete": "http://drupal.local/admin/config/system/backup_migrate/settings/destination/list/deletefile/local_destination/drupal.local-2015-11-05T15-57-25.mysql.gz"
                        }
                    }]
                }
            }]
        };

        vmi.services = Integrations.services;

        vmi.findIntegration = function(name) {
            vmi.currentIntegration = findIntegrationByName(name);
        };

        vmi.goTo = function (go, state, params) {
            if (!go) return;
            $state.go(state, params);
        };

        vmi.findIntegrationIndex = function(name) {
            return findIntegrationByName(name, true);
        };

        function findIntegrationByName(name, index) {
            var integration, integrationIndex;
            if (!$scope.stack.integrations) $scope.stack.integrations = [];
            var found = false;
            $scope.stack.integrations.forEach(function(_integration, i) {
                if (_integration.name === name) {
                    found = true;
                    integrationIndex = i;
                    integration = _integration;
                }
            });
            if (!found) {
                var o = {};
                o.name = name;
                o.enable = false;
                $scope.stack.integrations.push(o);
                integration = o;
            }
            if (index) return integrationIndex;
            return integration;
        }

        vmi.update = function() {
            Stacks.update($scope.stack._id, $scope.stack, function(err, data) {
                console.log('update integrations err:', err, 'data:', data);
                if (!err) $scope.$emit('update stack tabs');
            });
        };

        vmi.title = 'Integrations';
        vmi.showIntegrations = { all: true };
        vmi.setFilter = function(key) {
            if (key == 'all') {
                vmi.showIntegrations = { all: true };
            } else {
                vmi.showIntegrations = {
                    all: false
                };
                vmi.showIntegrations[key] = true;
            }
        }

        vmi.notSorted = function(obj) {
            if (!obj) {
                return [];
            }
            return Object.keys(obj);
        }

        function buildsTabs() {
            vmi.enabledBuildsTabs = $scope.stack.integrations.map(function(o) {
                if (o.enable) return o.name;
                return '';
            });
        }

        buildsTabs();
        vmi.buildsIntegrationsFilter = function(integration) {
            if (vmi.enabledBuildsTabs.indexOf(integration.name) > -1) return true;
            return false;
        };

        vmi.findGlobalIntegration = function() {
            var name = $stateParams.service;
            var found;
            for (var index in vmi.services) {
                vmi.services[index].subServices.forEach(function(o) {
                    if (o.name === name) {
                        found = true;
                        vmi.currentGlobalIntegration = o;
                    }
                    if (found) return;
                });
                if (found) break;
            }
        };

    }
]);
