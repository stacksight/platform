angular.module('mean.general').directive('eventsBar', ['$state', '$compile', 'Appsun', 'Stacksun', 'EventsComponents', '$anchorScroll', '$window', 'Events', 'ShowHits',
    function($state, $compile, Appsun, Stacksun, EventsComponents, $anchorScroll, $window, Events, ShowHits) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/general/directives/events-bar/views/events-bar.html',
        // transclude: true,
        scope: {
            ids: '=ngIds',
            transferIds: '=ngTransferIds',
            stacksIsReady: '=ngStacksReady'
        },
        link: function(scope, element, attrs) {
            var options = {};
            options.index = 'events';
            options.from = 0;
            options.size = 100;
            options.query = {
                ids: (scope.ids && scope.ids.length > 0) ? scope.ids : scope.transferIds
            };
            options.type = 'event';

            scope.$state = $state;

            scope.histogram = [];
            scope.docs = [];
            scope.design = EventsComponents.design();

            scope.exists_any_events = false;
            scope.busy = true;

            var hasMore = false;

            scope.getTemplate = function(event) {
                if (event._source.desc) {
                    event.template = 'desc-template';
                    return;

                }
                if (scope.design[event._source.subtype] && scope.design[event._source.subtype].template) {
                    event.template = event._source.subtype + '-template';
                    return;
                }
                if (scope.design[event._source.type] && scope.design[event._source.type].template) {
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

            Appsun.aggregation('date', options, function(data) {
                scope.histogram = data;
            });

            var dynamicHeight = 0;
            if(!$window.dynamicEventHeight){
                var dynamicHeight = 66;
            } else{
                var dynamicHeight = $window.dynamicEventHeight;
            }

            scope.hgt = $window.innerHeight - dynamicHeight;

            angular.element($window).bind('resize', function () {
                scope.hgt = $window.innerHeight - dynamicHeight;
                scope.$apply();
            });

            scope.timelineChange = function(range) {
                options.range = range;
                scope.initSearch();
                scope.find();
            };

            // var element = angular.element('#events-date-title');
            // scope.fixedHeader = function() {
            //     var index = $(".event:in-viewport:first").attr('id');
            //     if (scope.docs[index]) scope.headerDate = scope.docs[index]._created;
            //     element.scope().$apply();
            // };

            scope.initSearch = function() {
                // scope.docs = [];
                scope.busy = true;
                options.from = 0;
                hasMore = true;
            }

            scope.loadMore = function() {
                if (scope.busy || !hasMore) return;
                scope.busy = true;
                options.from = options.from + options.size;
                scope.find(false);
            };

            scope.nameChecked = function(type, subtype, action, checked) {
                scope.initSearch();
                if (!options.query.types) options.query.types = {};
                if (!options.query.types[type]) options.query.types[type] = {};
                if (!options.query.types[type][subtype]) options.query.types[type][subtype] = {};
                options.query.types[type][subtype][action] = checked;
                scope.find();
            };

            scope.find = function(isFirst){
                if (!hasMore && isFirst == undefined) return;
                Stacksun.events(options, function(data) {
                    scope.busy = false;
                    if (!data) return;
                    if (!data.docs.length || data.docs.length < options.size){
                        hasMore = false;
                    } else{
                        hasMore = true;
                    }

                    if(data && data.docs){
                        data.docs.forEach(function(doc) {
                            doc._created = new Date(doc._source.created).setHours(0, 0, 0, 0);
                            scope.docs.push(doc);
                            scope.getTemplate(doc);
                        });
                        ShowHits.show();
                    }

                    scope.exists_any_events = true;
                    if (options.from === 0 && scope.docs[0]) scope.headerDate = scope.docs[0]._created;
                    if(data && data.docs){
                        if(isFirst){
                            scope.docs = data.docs;
                        }
                        //
                        scope.exists_any_events = true;
                    } else{
                        scope.exists_any_events = false;
                    }
                });
            }

            scope.find();

            scope.$watch('ids', function(newVal,oldVal) {
                if(newVal == undefined) return;
                scope.busy = true;
                options.from = 0;
                scope.docs = [];
                options.query = {
                    ids: (newVal && newVal.length > 0) ? newVal : scope.transferIds
                };
                scope.find(true);
            },true);

            scope.$watch('transferIds', function(newVal,oldVal) {
                if(newVal == undefined) return;
                scope.busy = true;
                options.from = 0;
                scope.docs = [];
                options.query = {
                    ids: newVal
                };
                scope.find(true);
            },true);

            scope.compileTemplate = function(template, index) {
                if (template) {
                    var tplEl = $compile(template)(scope);
                    $('.template').append(tplEl);
                }
            };

            scope.sel_optgroup = '';
            scope.sel_val = '';

            scope.applyFilter = function(filter){
                var tmp_obj = {};
                if(filter == ''){
                    delete options.query.type;
                    scope.sel_optgroup = '';
                    scope.sel_val = '';
                } else{
                    filter = JSON.parse(filter);
                    for(var i = 0; i < scope.eventsKey.length; i++){
                        var key = scope.eventsKey[i].key;
                        tmp_obj[key] = {};
                        tmp_obj[key].sts_no_sub_type = {};
                        for(var j = 0; j < scope.eventsKey[i].actions.buckets.length; j++){
                            var buckkey = scope.eventsKey[i].actions.buckets[j].key;
                            if(filter.group == key && filter.value == buckkey){
                                tmp_obj[key].sts_no_sub_type[buckkey] = true;
                                scope.sel_optgroup = key;
                                scope.sel_val = buckkey;
                            } else{
                                tmp_obj[key].sts_no_sub_type[buckkey] = false;
                            }
                        }
                    }
                }
                options.query.types = tmp_obj;
                scope.initSearch();
                // scope.find();
            }

            Events.keys(options, function(data) {
                scope.eventsKey = data;
            });
        }
    };
}]);
