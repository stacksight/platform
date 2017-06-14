'use strict';

/* jshint -W098 */
angular.module('mean.stack').controller('UpdatesController', ['$scope', 'Global', 'Stacks', 'Appsun', '$stateParams', 'MeanSocket', '$timeout', '$state', '$rootScope', '$location', 'Updates',
    function($scope, Global, Stacks, Appsun, $stateParams, MeanSocket, $timeout, $state, $rootScope, $location, Updates) {

        $scope.global = Global;

        var vm = this;

        var options = {};
        options.id = $stateParams.id;
        options.index = 'updates';
        options.from = 0;
        options.size = 1;
        options.type = 'update';

        vm.docs = [];
        vm.busy = false;

        var statusTypes = Updates.statusTypes;


        vm.find = function() {

            vm.busy = true;
            Appsun.updates(options, function(data) {
                vm.busy = false;

                if (!data) return;
                vm.updates = {
                    critical: [],
                    available: []
                };

                if (data.docs.length) {
                    vm.lastUpdated = data.docs[(data.docs.length) - 1]._source.created;
                    data.docs[(data.docs.length) - 1]._source.data.forEach(function(doc) {
                        if (doc.current_version === doc.latest_version || !doc.title) return;
                        if (statusTypes.critical.indexOf(doc.status) > -1) vm.updates.critical.push(doc);
                        else vm.updates.available.push(doc);
                    });
                }
            });
        };

        vm.objectKeys = function(obj) {
            if (!obj) {
                return [];
            }
            return Object.keys(obj);
        };

        MeanSocket.on('log added', function(log) {

            if (log._source.appId === $stateParams.id && log._type.indexOf('update') !== -1) {
                log._created = new Date(log._source.created).setHours(0, 0, 0, 0);

                vm.docs.push(log);
            }
        });
    }
]);
