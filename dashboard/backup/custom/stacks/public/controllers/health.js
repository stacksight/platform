'use strict';

/* jshint -W098 */
angular.module('mean.stacks')
    .controller('HealthController', ['$scope', 'Global', 'Stacks', 'Appsun', '$stateParams', 'MeanSocket', '$timeout', '$interpolate', '$filter', '$state', '$rootScope', '$location', '_', 'Sapi', 'Health', 'Availability',
        function($scope, Global, Stacks, Appsun, $stateParams, MeanSocket, $timeout, $interpolate, $filter, $state, $rootScope, $location, _, Sapi, Health, Availability) {

            $scope.global = Global;

            var vmh = this;
            vmh.moment = window.moment;
            vmh.$stateParams = $stateParams;

            var options = {};
            options.id = $stateParams.id;
            options.index = 'health';
            options.type = 'security,backups,performance,seo,accessibility';
            options.from = 0;
            options.size = 1;

            $scope.health_objects = [];

            $scope._ = _;

            $scope.templates = {
                meter: 'stacks/views/health/meter.html',
                availability: 'stacks/views/health/availability.html',
                checklist: 'stacks/views/health/checklist.html',
                backup: 'stacks/views/health/backup.html',
                pointslist: 'stacks/views/health/pointslist.html',
                performance: 'stacks/views/health/performance.html',
                seo_meter: 'stacks/views/health/seo_meter.html',
                seo_chart: 'stacks/views/health/seo_chart.html',
                seo_detail: 'stacks/views/health/seo_detail.html',
                accessibility: 'stacks/views/health/accessibility.html'
            };

            $scope.health_objects = Health.tabs(options);

            function getAvailability(check) {
                Availability.get(check, function(err, data) {
                    if (err) return console.log(err);

                    for (var i = 0; i < $scope.health_objects.length; i++) {
                        if ($scope.health_objects[i].category === 'availability') {
                            $scope.health_objects[i].data = data;
                            break;
                        }
                    };
                });
            }

            function prepareBackupsData(data) {
                var backupsArr = data['top-types-hits'].hits.hits;
                var _data = data['top-types-hits'].hits.hits[0]._source.data;
                var dates = _data.widgets[0].data;
                backupsArr.forEach(function(hit, index) {
                    if (index === 0) return;
                    for (var index1 in hit._source.data.widgets[0].data) {
                        if (!dates[index1])
                            dates[index1] = hit._source.data.widgets[0].data[index1];
                    }
                });
                return data;
            }

            vmh.find = function() {
                Appsun.aggregation('health', options, function(data) {
                    data.forEach(function(d) {
                        if (d.key === 'backups')
                            d = prepareBackupsData(d);

                        var created = d['top-types-hits'].hits.hits[0]._source.created,
                            createdAt = d['top-types-hits'].hits.hits[0]._source.createdAt;

                        d = d['top-types-hits'].hits.hits[0]._source.data;
                        if (_.isArray(d)) d = d[0];
                        var widgets_input = [];
                        d.created = created;
                        d.createdAt = createdAt;
                        if (_.isArray(d.widgets))
                            widgets_input = d.widgets;
                        else
                            widgets_input.push(d.widgets);

                        var widgets = _.map(widgets_input, function(widget) {
                            var chart = {};
                            switch (widget.type) {

                                case 'meter':

                                    $scope.security = {};
                                    $scope.security.point_max = widget.point_max;
                                    $scope.security.point_cur = widget.point_cur;
                                    if (typeof widget.type.created !== 'undefined') {
                                        $scope.security.created = widget.type.created;
                                    }
                                    _.extend(chart, widget, {
                                        nativedata: widget,
                                        class: 'col-md-6'
                                    });
                                    break;
                                case 'checklist':

                                    _.extend(chart, widget, {
                                        nativedata: widget,
                                        class: 'col-md-6'
                                    });
                                    break;
                                case 'backup':

                                    $scope.backup = {};
                                    if (typeof widget.type.created !== 'undefined') {
                                        $scope.backup.created = widget.type.created;
                                    }
                                    $scope.backup.today = function() {
                                        $scope.backup.date = new Date();
                                    };
                                    $scope.backup.today();

                                    // Disable weekend selection
                                    $scope.backup.disabled = function(date, mode) {
                                        return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
                                    };
                                    $scope.backup.toggleMin = function() {
                                        var last_date = _.last(_.keys(widget.data));
                                        $scope.backup.minDate = (last_date) ? last_date : new Date();
                                    };
                                    $scope.backup.toggleMin();
                                    $scope.backup.maxDate = $filter('date')(new Date(), 'yyyy-MM-dd');
                                    $scope.backup.open = function($event) {
                                        $scope.backup.status.opened = true;
                                    };
                                    $scope.backup.dateOptions = {
                                        formatYear: 'yy',
                                        startingDay: 1
                                    };
                                    $scope.backup.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                                    $scope.backup.format = $scope.backup.formats[0];
                                    $scope.backup.status = {
                                        opened: false
                                    };

                                    $scope.backup.getDayClass = function(date, mode) {
                                        var filter_date = $filter('date')(date, 'yyyy-MM-dd');
                                        var indexOf = _.indexOf(_.keys(widget.data), filter_date);
                                        if (indexOf == -1)
                                            return '';
                                        else
                                            return 'full';
                                    };

                                    $scope.backup.count = _.size(widget.data[$scope.backup.maxDate]);
                                    $scope.$watch('backup.date', function(newDate) {
                                        var new_date = $filter('date')(newDate, 'yyyy-MM-dd');
                                        $scope.backup.format_date = new_date;
                                        $scope.backup.count = _.size(widget.data[new_date]);

                                        if ($scope.backup.count == 0) {
                                            $scope.latest_backup = _.first(widget.data[_.first(_.keys(widget.data))])['timestamp'];
                                        } else {
                                            $scope.latest_backup = _.first(widget.data[$scope.backup.format_date])['timestamp'];
                                        }
                                    });

                                    $scope.backup.actions = false;

                                    $scope.backup.data_flat = _.flatten(_.map(widget.data, function(data) {
                                        if ($scope.backup.actions == false) {
                                            _.each(data, function(object) {
                                                if (_.isMatch(object.links) && !_.isEmpty(object.links))
                                                    $scope.backup.actions = true;
                                            });
                                        }
                                        return _.flatten(data);
                                    }));

                                    _.extend(chart, widget, {
                                        nativedata: {
                                            type: widget.type
                                        },
                                        class: 'col-md-12'
                                    });
                                    break;
                                case 'pointslist':

                                    chart = _.map(widget.pointslist, function(array) {
                                        var returned = {};
                                        returned.title = array.title;
                                        returned.points = array.points;
                                        if (array.data)
                                            returned.color = (array.data[0].status == 1) ? '#7eb762' : '#aeabb3';;
                                        returned.data = array.data;
                                        return returned;
                                    });
                                    _.extend(chart, widget, {
                                        nativedata: {
                                            type: widget.type
                                        },
                                        class: 'col-md-12'
                                    });
                                    break;
                                case 'performance':

                                    $scope.performance = {};
                                    $scope.performance.tabs = [];
                                    $scope.performance.collapsed = {};
                                    if (typeof widget.type.created !== 'undefined') {
                                        $scope.performance.created = widget.type.created;
                                    }
                                    $scope['header_ico'] = [];
                                    chart = _.mapObject(widget.data, function(array, key) {
                                        var returned = array;
                                        returned.data.screenshot.data = $filter('googleBase64')(returned.data.screenshot.data);
                                        var grouped = _.groupBy(returned.data.formattedResults.ruleResults, function(val, key) {
                                            returned.data.formattedResults.ruleResults[key] = $filter('speedsummary')(val);
                                            $scope.performance.collapsed[key] = {};
                                            $scope.performance.collapsed[key].isCollapsed = true;
                                            val.index = key;
                                            return val.groups;
                                        });

                                        var warn_obj = {};
                                        var warn_grouped = _.mapObject(grouped, function(val, w_key, itt) {
                                            if (!warn_obj[key])
                                                warn_obj[key] = {};
                                            return _.groupBy(val, function(val_item) {
                                                if (val_item.ruleImpact > 10) {
                                                    warn_obj[key]['necessarily'] = (warn_obj[key]['necessarily']) ? warn_obj[key]['necessarily'] + 1 : 1
                                                    return '1_necessarily';
                                                }
                                                if (val_item.ruleImpact > 0) {
                                                    warn_obj[key]['desirable'] = (warn_obj[key]['desirable']) ? warn_obj[key]['desirable'] + 1 : 1
                                                    return '2_desirable';
                                                }
                                                warn_obj[key]['done'] = (warn_obj[key]['done']) ? warn_obj[key]['done'] + 1 : 1
                                                return '3_done';
                                            });
                                        });

                                        if (warn_obj[key]['necessarily'] > 0) {
                                            $scope['header_ico'][key] = 'necessarily';
                                        } else if (warn_obj[key]['desirable'] > 0) {
                                            $scope['header_ico'][key] = 'desirable';
                                        } else {
                                            $scope['header_ico'][key] = 'done';
                                        }

                                        returned.data.formattedResults.ruleResults = warn_grouped;
                                        $scope.performance.tabs.push({
                                            key: key,
                                            title: array.title,
                                            content: returned.data
                                        });
                                        return returned;
                                    });
                                    angular.module('mean.stacks').config(function($compileProvider) {
                                        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
                                    });
                                    _.extend(chart, widget, {
                                        nativedata: {
                                            type: widget.type
                                        },
                                        class: 'col-md-12'
                                    });
                                    break;
                                case 'seo_meter':

                                    var type_meter = 'percent'; // Can percent or score
                                    $scope.seo_meter = {};
                                    if (typeof widget.type.created !== 'undefined') {
                                        $scope.seo_meter.created = widget.type.created;
                                    }
                                    switch (type_meter) {
                                        case 'percent':
                                            $scope.seo_meter.point_max = 100;
                                            $scope.seo_meter.point_cur = $filter('number')(widget.seo_meter.performance_percent, 2);
                                            break;
                                        case 'score':
                                            $scope.seo_meter.point_max = widget.seo_meter.max_score;
                                            $scope.seo_meter.point_cur = $filter('number')(widget.seo_meter.total_score, 2);
                                            break;
                                    }

                                    _.extend(chart, widget, {
                                        nativedata: widget,
                                        class: 'col-md-6'
                                    });
                                    break;
                                case 'seo_chart':

                                    $rootScope.seo_chart = {};
                                    $rootScope.seo_chart.select_type = '';
                                    if (typeof widget.type.created !== 'undefined') {
                                        $scope.seo_chart.created = widget.type.created;
                                    }
                                    _.extend(chart, widget, {
                                        nativedata: {
                                            type: widget.type
                                        },
                                        class: 'col-md-6'
                                    });
                                    break;
                                case 'seo_detail':

                                    $scope.seodetail = {};
                                    $scope.seodetail.collapsed = {};
                                    if (typeof widget.type.created !== 'undefined') {
                                        $scope.seo_detail.created = widget.type.created;
                                    }
                                    _.each(widget.seo_detail, function(val, key) {
                                        $scope.seodetail.collapsed[key] = {};
                                        $scope.seodetail.collapsed[key].isCollapsed = true;
                                    });

                                    _.extend(chart, widget, {
                                        nativedata: {
                                            type: widget.type
                                        },
                                        class: 'col-md-12'
                                    });
                                    break;
                                case 'accessibility':

                                    widget.data = _.groupBy(widget.data, 'type'),
                                        function(widget) {
                                            return _.sortBy(widget, 'code');
                                        };

                                    $scope.accessibility = {};
                                    $scope.accessibility.collapsed = {};
                                    if (typeof widget.type.created !== 'undefined') {
                                        $scope.accessibility.created = widget.type.created;
                                    }
                                    _.each(widget.data, function(val, key) {
                                        $scope.accessibility.collapsed[key] = {};
                                        $scope.accessibility.collapsed[key].isCollapsed = true;
                                    });

                                    _.extend(chart, widget, {
                                        nativedata: {
                                            type: widget.type
                                        },
                                    });
                                    break;
                            }
                            return chart;
                        });

                        var processing_widgets = _.map(_.groupBy(widgets, 'group'), function(widget) {
                            return _.sortBy(widget, 'order');
                        });


                        for (var i = 0; i < $scope.health_objects.length; i++) {
                            if (d.category === $scope.health_objects[i].category) {
                                $scope.health_objects[i].category = angular.lowercase(d.category);
                                $scope.health_objects[i].title = d.title;
                                $scope.health_objects[i].tabTitle = (d.title) ? d.title : d.category;
                                $scope.health_objects[i].desc = d.desc;
                                $scope.health_objects[i].widgets = processing_widgets;
                                $scope.health_objects[i].noData = $scope.health_objects[i].noData;
                                $scope.health_objects[i].created = (d.created) ? d.created : null;
                                $scope.health_objects[i].createdAt = (d.createdAt) ? d.createdAt : null;
                                break;
                            }
                        };

                    });
                    vmh.health_objects = _.indexBy($scope.health_objects, 'category');
                });

            };
            /*

            */

            $scope.export_items = [
                'The first export!',
                'The second export',
                'The third export!'
            ];

            $scope.rescan = function(type) {
                Sapi.get({
                    cmd_api: '/sapi/crons/' + type + '?tokenName=' + type + '&stackId=' + options.id
                }).then(function(data) {
                    console.log('rescan data', data);
                }, function(error) {
                    console.log('rescan error', error);
                });
            };

            MeanSocket.on('log added', function(log) {
                if (log._source.appId === $stateParams.id && options.type.indexOf(log._type) !== -1) {
                    // swal('Rescan completed.')
                    console.log('Rescan completed');
                    vmh.find();
                }
            });


            // $scope.$watch('stack', function(val) {
            //     if (val && $scope.stack.check) {
            //         getAvailability($scope.stack.check);
            //     }
            // });
        }
    ]);
