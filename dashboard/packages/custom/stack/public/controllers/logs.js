'use strict';

/* jshint -W098 */
angular.module('mean.stack').controller('LogsController', ['$scope', 'Global', 'Appsun', '$stateParams', 'MeanSocket', '$timeout', '$anchorScroll', 'Platforms', 'Articles', '$interval',
    function($scope, Global, Appsun, $stateParams, MeanSocket, $timeout, $anchorScroll, Platforms, Articles, $interval) {

        $scope.global = Global;

        var vm = this;

        var options = {};
        options.id = $stateParams.id;
        options.index = 'logs';
        options.from = 0;
        options.size = 200;
        options.type = 'log';
        options.query = {};
        var hasMore = true;
        var prevScroll;
        var prevHeight;
        var divLogs;

        vm.platforms = Platforms;

        vm.sessions = {};

        vm.indicatorConfig = {
            outerPath: {
                delay: 50,
                duration: 500
            },
            innerPath: {
                delay: 0,
                duration: 100
            }
        };

        function initSearch() {
            vm.docs = [];
            options.from = 0;
            hasMore = true;
        }


        vm.docs = [];
        vm.busy = false;
        vm.find = function() {

            if (!hasMore) return;

            vm.busy = true;
            Appsun.logs(options, function(data) {
                vm.busy = false;

                if (!data) return;
                if (!data.docs.length) hasMore = false;
                // if (options.from !== 0) vm.scrollBottom();

                data.docs.forEach(function(doc) {
                    doc._created = new Date(doc._source.created).setHours(0, 0, 0, 0);
                    vm.docs.unshift(doc);
                });

                if (options.from === 0) {
                    $timeout(function() {
                        divLogs = $('#logsContent');
                        if (divLogs) {
                            // vm.scrollBottom();
                        }
                    }, 0);
                } else {
                    // vm.scrollBottom();
                }
            });

        };

        vm.scrollBottom = function(){
            window.scrollTo(0,document.body.scrollHeight);
        };

        function scrollData(action) {
            if (action === 'save') {
                // vm.scrollBottom();
            } else if (action === 'set') {
                $timeout(function() {
                    // vm.scrollBottom();
                }, 100)
            }
        }

        vm.searchText = function(text) {
            if (text.length > 2 || !text) {
                initSearch();
                options.query.text = text;
                if (!text) delete options.query.text;
                vm.find();
            }
        };

        Appsun.aggregation('date', options, function(data) {
            vm.histogram = data;
        });

        Appsun.aggregation('ip', options, function(data) {
            console.log('================= ips =============');
            $scope.ips = data;
        });

/*        Appsun.sessions({
            size: 3000,
            index: 'sessions',
            id: options.id,
            from: 0,
            type: 'session'
        }, function(data) {
            data.docs.forEach(function(session) {
                vm.sessions[session._id] = session._source;
            });
            Appsun.aggregation('cpuMem', options, function(data) {
                data.forEach(function(s) {
                    if (vm.sessions[s.key]) {
                        vm.sessions[s.key].cpuAvg = s.cpu.value;
                        vm.sessions[s.key].memAvg = s.memory.value;
                    }
                });
            });
        });*/

        vm.logHover = function(log) {
            vm.session = vm.sessions[log._source.session];
            vm.cpu = log._source.loadavg;
            vm.memory = parseFloat(log._source.memory).toFixed(2);
            if (vm.session) {
                vm.cpuAvg = vm.session.cpuAvg || vm.cpuAvg;
                vm.memAvg = vm.session.memAvg || vm.memAvg;
                setSessionData();
            }
        };

        vm.timelineChange = function(range) {
            initSearch();
            options.range = range;
            vm.find();
        };

        $scope.searchIp = function(ip) {
            initSearch();
            options.query.ip = ip;
            vm.find();
        };


        MeanSocket.on('log added', function(log) {
            if (log._source.appId === $stateParams.id && log._type.indexOf('log') !== -1) {
                log._created = new Date(log._source.created).setHours(0, 0, 0, 0);
                vm.docs.push(log);
                $timeout(function () {
                    vm.scrollBottom();
                }, 300);
            }
        });

        vm.loadMore = function() {
            if (vm.busy) return;
            options.from++;
            vm.find();
        };

        function setSessionData(key) {
            if (!vm.sessionData)
                vm.sessionData = [{
                    key: 'platform',
                    label: 'Platform'
                }, {
                    key: 'hostname',
                    label: 'Host'
                }, {
                    key: 'architecture',
                    label: 'Architecture'
                }];

            for (var i = 0; i < vm.sessionData.length; i++) {
                vm.sessionData[i].content = vm.session[vm.sessionData[i].key];
            }
        };

        $scope.$watch('stack', function(val) {
            if (val && $scope.stack && $scope.stack.app && $scope.stack.app.collaborators) {
                Articles.query({
                    type: 'logs',
                    stackId: $stateParams.id,
                    collaborators: $scope.stack.app.collaborators
                }, function(data) {
                    vm.annotations = data.articles;
                });
            }
        });


    }
]);
