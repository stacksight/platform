'use strict';

/* jshint -W098 */
angular.module('mean.stack').controller('SessionsController', ['$scope', 'Global', 'Stacks', 'Appsun', '$stateParams', 'MeanSocket', '$timeout', '$state', '$rootScope', '$location',
    function($scope, Global, Stacks, Appsun, $stateParams, MeanSocket, $timeout, $state, $rootScope, $location) {

        $scope.global = Global;

        var vm = this;

        var options = {};
        options.id = $stateParams.id;
        options.index = 'sessions';
        options.from = 0;
        options.size = 100;
        options.type = 'session';

        vm.docs = [];
        vm.busy = false;
        var hasMore = true;
        var prevScroll;
        var prevHeight;
        var divSessions; //sessionsContent

        vm.find = function() {

            vm.busy = true;
            Appsun.sessions(options, function(data) {
                vm.busy = false;

                if (!data) return;
                if (!data.docs.length) hasMore = false;
                if (options.from !== 0) scrollData('save');

                data.docs.forEach(function(doc) {
                    doc._created = new Date(doc._source.created).setHours(0, 0, 0, 0);
                    vm.docs.unshift(doc);
                });

                if (options.from === 0) {
                    $timeout(function() {
                        divSessions = $('#sessionsContent');
                        if (divSessions) divSessions.scrollTop($('#sessionsContent')[0].scrollHeight);
                    }, 0);
                } else scrollData('set');

            });
        };

        function scrollData(action) {
            if (action === 'save') {
                prevScroll = divSessions.scrollTop();
                prevHeight = divSessions[0].scrollHeight;
            } else if (action === 'set') {
                $timeout(function() {
                    divSessions.scrollTop(prevScroll + divSessions[0].scrollHeight - prevHeight);
                }, 100)
            }
        }

        Appsun.aggregation('date', options, function(data) {
            vm.histogram = data;
        });

        vm.goTo = function(to, session) {
            $location.url('/stack/' + $stateParams.id + '/' + to);
            $location.hash(session);
        };

        vm.loadMore = function() {
            if (vm.busy) return;
            options.from++;
            vm.find();
        };

        MeanSocket.on('log added', function(log) {

            if (log._source.appId === $stateParams.id && log._type.indexOf('session') !== -1) {
                log._created = new Date(log._source.created).setHours(0, 0, 0, 0);

                vm.docs.push(log);
            }
        });

        vm.timelineChange = function(range) {
            options.from = 0;
            hasMore = true;
            options.range = range;
            vm.docs = [];
            vm.find();
        };
    }
]);
