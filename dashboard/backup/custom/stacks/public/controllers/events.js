'use strict';

/* jshint -W098 */
angular.module('mean.stacks').controller('EventsController', ['$scope', 'Global', 'Appsun', '$stateParams', 'MeanSocket', '$timeout', '$location', '$anchorScroll', 'EventsComponents', 'Events',
    function($scope, Global, Appsun, $stateParams, MeanSocket, $timeout, $location, $anchorScroll, EventsComponents, Events) {

        $scope.global = Global;

        var vm = this;
        vm.events = [];
        vm.sessions = [];

        vm.design = EventsComponents.design();

        var options = {};

        options.index = 'events';
        options.from = 0;
        options.size = 100;
        options.query = {};
        options.type = 'event';
        vm.showScrollDown = false;

        vm.docs = [];
        vm.busy = false;
        var hasMore = true;



        vm.initSearch = function() {
            vm.docs = [];
            options.from = 0;
            hasMore = true;
        }

        vm.find = function() {
            if (!hasMore) return;

            options.id = $stateParams.id;

            vm.busy = true;

            Appsun.events(options, function(data) {
                vm.busy = false;
                if (!data) return;
                if (!data.docs.length) hasMore = false;
                data.docs.forEach(function(doc) {
                    doc._created = new Date(doc._source.created).setHours(0, 0, 0, 0);
                    vm.docs.push(doc);
                    vm.getTemplate(doc);
                });
                vm.exists_any_events = true;
                if (options.from === 0 && vm.docs[0]) vm.headerDate = vm.docs[0]._created;
            });
        };

        Appsun.aggregation('date', options, function(data) {
            vm.histogram = data;
        });

        Events.keys(options, function(data) {
            vm.eventsKeys = data;
        });

        vm.searchEvent = '';
        vm.searchEventType = '';
        vm.exists_any_events = false;

        $scope.$watch('vm.searchEvent', function() {
            vm.searchText(vm.searchEvent);
        });

        $scope.$watch('vm.searchEventType', function() {
            if(vm.searchEventType != ''){
                options.query.type = vm.searchEventType;
            } else{
                //options.query.type = '';
            }
            vm.initSearch();
            vm.find();
        });

        vm.searchText = function(text) {
            if (text.length > 3) {
                options.query.text = text;
                vm.initSearch();
                vm.find();
            }
        };

        vm.timelineChange = function(range) {
            options.range = range;
            vm.initSearch();
            vm.find();
        };

        var element = angular.element('#events-date-title');
        vm.fixedHeader = function() {
            var index = $(".event:in-viewport:first").attr('id');
            if (vm.docs[index]) vm.headerDate = vm.docs[index]._created;
            element.scope().$apply();
        };

        vm.loadMore = function() {
            if (vm.busy) return;
            options.from++;
            vm.find();
        };

        vm.nameChecked = function(type, subtype, action, checked) {
            vm.initSearch();
            if (!options.query.types) options.query.types = {};
            if (!options.query.types[type]) options.query.types[type] = {};
            if (!options.query.types[type][subtype]) options.query.types[type][subtype] = {};
            options.query.types[type][subtype][action] = checked;
            vm.find();
        };

        vm.getTemplate = function(event) {
            if (event._source.desc) {
                event.template = 'desc-template';
                return;

            }
            if (vm.design[event._source.subtype] && vm.design[event._source.subtype].template) {
                event.template = event._source.subtype + '-template';
                return;
            }
            if (vm.design[event._source.type] && vm.design[event._source.type].template) {
                event.template = event._source.type + '-template';
                return;
            }

            if (event._source.user && event._source.user.name) {
                event.template = 'with-user-template';
                event._source.desc = event._source.user.name + ' has ' + event._source.action + ' the "' + event._source.name + '" ' + event._source.subtype || event._source.type;
                return;
            }

            event.template = 'without-user-template';
            event._source.desc = event._source.subtype || event._source.type + ' "' + event._source.name + '" has been ' + event._source.action;
        };

        MeanSocket.on('log added', function(log) {
            if (log._source.appId === $stateParams.id && log._type.indexOf('event') !== -1) {
                console.log('------EVENT ADDED----', log);
                log._created = new Date(log._source.created).setHours(0, 0, 0, 0);
                vm.docs.unshift(log);
                vm.getTemplate(log);

                //TODO: fix it with the new stracture of events

                // vm.eventsKeys.forEach(function(key) {
                //     if (key.key === log._source.key) {
                //         key.names.buckets.forEach(function(name) {
                //             if (name.key === log._source.name) {
                //                 name.doc_count++;
                //                 found = true;
                //                 return;
                //             }
                //         });
                //         if (!found) {
                //             key.names.buckets.push({
                //                 key: log._source.name,
                //                 doc_count: 1,
                //                 checked: true
                //             });
                //             found = true;
                //             return;
                //         }
                //     }
                // });
                // if (!found)
                //     vm.eventsKeys.push({
                //         key: log._source.key,
                //         names: {
                //             buckets: [{
                //                 key: log._source.name,
                //                 checked: true,
                //                 doc_count: 1
                //             }]
                //         }
                //     });

            }
        });
    }
]);
