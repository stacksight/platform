'use strict';

/* jshint -W098 */
angular.module('mean.apps').controller('StackDashboardController', [
    '$scope', '$filter', '$location', '$timeout', 'Global', 'Health', 'Apps', '$rootScope', '$stateParams', 'Platforms', '_', '$state', 'Stacks', 'Updates', 'localStorageService', 'Sapi', 'EventsComponents', '$uibModal',
    function ($scope, $filter, $location, $timeout, Global, Health, Apps, $rootScope, $stateParams, Platforms, _, $state, Stacks, Updates, localStorageService, Sapi, EventsComponents, $uibModal) {

        //$stateParams.appId = '57d957a15315d86c72d684d1';
        var vmd = this,
            threshold = {},
            appId = $stateParams.appId,
            groupStacks;
        //
        //console.log($stateParams.appId);
        //
        //vmd.defaultPolicy = {
        //    value: 50
        //};
        //
        //vmd.events = [];
        //vmd.sessions = [];
        //
        //vmd.design = EventsComponents.design();




        //$scope.labels = [];
        //$scope.origin_labels = [];
        //$scope.series = [];
        //$scope.data = [];
        //vmd.Math = window.Math;
        //
        //vmd.stacks = [];
        //
        vmd.init = function() {
            Stacks.find(function(err, data) {
                console.log(data);
            });
            //console.log($scope);
            //groupStacks = $scope.vm.app.stacks;
            //groupStacks = _.indexBy(groupStacks, '_id');
        };
        //
        //vmd.selectState = false;
        //vmd.eventsControlller = false;
        //
        //$scope.$watch('vmd.stacks', function() {
        //    vmd.stacks_ready = true;
        //    if(vmd.stacks[0]){
        //        $stateParams.id = vmd.stacks[0]._id;
        //        vmd.eventsControlller.find();
        //    }
        //});
        //
        //$rootScope.sliceDashboardChartDays = {
        //    startDate: moment().subtract(29, 'days'),
        //    endDate: moment()
        //}
        //
        //var d = new Date();
        //vmd.datePicker = {
        //    min: '2015-01-23',
        //    max: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(),
        //    date: {
        //        startDate: moment().subtract(29, 'days'),
        //        end: moment()
        //    },
        //    opts: {
        //        locale: {
        //            applyClass: 'btn-green',
        //            applyLabel: "Apply",
        //            fromLabel: "From",
        //            format: "YYYY-MM-DD",
        //            toLabel: "To",
        //            cancelLabel: 'Cancel',
        //            customRangeLabel: 'Custom range'
        //        },
        //        ranges: {
        //            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        //            'Last 30 Days': [moment().subtract(29, 'days'), moment()]
        //        },
        //        eventHandlers: {
        //            'apply.daterangepicker': function(picker) {
        //                $rootScope.sliceDashboardChartDays = {
        //                    startDate: picker.model.startDate,
        //                    endDate: picker.model.endDate
        //                }
        //            }
        //        }
        //    }
        //};
        //
        //
        //$scope.tabs = {
        //    general: {
        //        title: 'General',
        //        type: 'general',
        //        link: 'app.dashboard.general',
        //        active: $state.current.name == 'app.dashboard.general',
        //        "inner_title": "General Dashboard",
        //        "score_title": "General Strength",
        //        "description": "All Strength over time"
        //    },
        //    security: {
        //        "inner_title": "Security Dashboard",
        //        "score_title": "Security Strength",
        //        "description": "Security strength over time",
        //        title: 'Security',
        //        type: 'security',
        //        link: 'app.dashboard.security',
        //        active: $state.current.name == 'app.dashboard.security'
        //    },
        //    performance: {
        //        title: 'Performance',
        //        type: 'performance',
        //        link: 'app.dashboard.performance',
        //        active: $state.current.name == 'app.dashboard.performance',
        //        "inner_title": "Performance Dashboard",
        //        "score_title": "Performance Strength",
        //        "description": "Performance strength over time"
        //    },
        //    // availability: {
        //    //     title: 'Availability',
        //    //     type: 'availability',
        //    //     link: 'app.dashboard.availability',
        //    //     active: $state.current.name == 'app.dashboard.availability',
        //    //     "inner_title": "Availability Dashboard",
        //    //     "score_title": "Availability Strength",
        //    //     "description": "Availability strength over time"
        //    // },
        //    seo: {
        //        title: 'SEO',
        //        type: 'seo',
        //        link: 'app.dashboard.seo',
        //        active: $state.current.name == 'app.dashboard.seo',
        //        "inner_title": "SEO Dashboard",
        //        "score_title": "SEO Strength",
        //        "description": "SEO strength over time"
        //    },
        //    accessibility: {
        //        title: 'Accessibility',
        //        type: 'accessibility',
        //        link: 'app.dashboard.accessibility',
        //        active: $state.current.name == 'app.dashboard.accessibility',
        //        "inner_title": "Accessibility Dashboard",
        //        "score_title": "Accessibility Strength",
        //        "description": "Accessibility strength over time"
        //    },
        //    backups: {
        //        title: 'Backups',
        //        type: 'backups',
        //        link: 'app.dashboard.backups',
        //        active: $state.current.name == 'app.dashboard.backups',
        //        "inner_title": "Backups Dashboard",
        //        "score_title": "Backups Strength",
        //        "description": "Backups strength over time"
        //    }
        //};
        //
        //$scope.notSorted = function(obj) {
        //    if (!obj) {
        //        return [];
        //    }
        //    return Object.keys(obj);
        //}
        //
        //$scope.goTo = function(type, total) {
        //    $state.go('app.dashboard.' + type);
        //};
        //
        //$scope.isActive = function(type, total) {
        //    if (total == type)
        //        return true;
        //    return false;
        //}
        //
        //Health.avgScore(appId).then(function(data) {
        //    $scope.policy = $scope.vm.app.policy;
        //    var data = _.map(data, function(val, key) {
        //        $scope.origin_labels.push($filter('date')(key, 'MM/dd/yyyy'));
        //        $scope.labels.push($filter('date')(key, 'MM/dd/yyyy'));
        //        var types = ['security', 'performance', /*'availability',*/ 'seo', 'accessibility', 'backups'];
        //        $scope.types = types;
        //        var without = [];
        //        var tmp_data = {
        //            'security': [],
        //            'performance': [],
        //            // 'availability': [],
        //            'seo': [],
        //            'accessibility': [],
        //            'backups': []
        //        };
        //        var data = _.map(val, function(val, data_key) {
        //            switch (val.type) {
        //                case 'security':
        //                    tmp_data['security'].push(val.score);
        //                    without.push('security');
        //                    break;
        //                case 'performance':
        //                    tmp_data['performance'].push(val.score);
        //                    without.push('performance');
        //                    break;
        //                case 'availability':
        //                    tmp_data['availability'].push(val.score);
        //                    without.push('availability');
        //                    break;
        //                case 'seo':
        //                    tmp_data['seo'].push(val.score);
        //                    without.push('seo');
        //                    break;
        //                case 'accessibility':
        //                    tmp_data['accessibility'].push(val.score);
        //                    without.push('accessibility');
        //                    break;
        //                case 'backups':
        //                    tmp_data['backups'].push(val.score);
        //                    without.push('backups');
        //                    break;
        //            }
        //            return tmp_data;
        //        });
        //
        //        return tmp_data;
        //    });
        //
        //    var tempory_array = {
        //        'security': [],
        //        'performance': [],
        //        // 'availability': [],
        //        'seo': [],
        //        'accessibility': [],
        //        'backups': []
        //    };
        //
        //    _.each(data, function(val, key) {
        //        _.each(val, function(inside_val, inside_key) {
        //            if (_.isEmpty(inside_val)) {
        //                tempory_array[inside_key].push(0);
        //            } else {
        //                tempory_array[inside_key].push(Math.round(inside_val[0]));
        //            }
        //        });
        //    });
        //
        //    $scope.chartsKey = [];
        //
        //    $scope.data = [
        //        tempory_array['security'],
        //        tempory_array['performance'],
        //        // tempory_array['availability'],
        //        tempory_array['seo'],
        //        tempory_array['accessibility'],
        //        tempory_array['backups']
        //    ];
        //    _.map(tempory_array, function(val, key) {
        //        $scope.chartsKey.push(key);
        //        $scope['origin_chart_data_' + key] = [val];
        //        $scope['chart_data_' + key] = [val];
        //    });
        //
        //    $scope.series = ['Security', 'Performance', /*'Availability',*/ 'SEO', 'Accessibility', 'Backups'];
        //
        //    $scope.options = {
        //        animation: false,
        //        responsive: true,
        //        maintainAspectRatio: false,
        //        datasetFill: false,
        //        pointDotStrokeWidth: 1,
        //        pointDotRadius: 4,
        //        scaleShowVerticalLines: false,
        //        customTooltips: function(tooltip) {
        //            if (!tooltip) {
        //                return;
        //            }
        //        },
        //        datasetStrokeWidth: 4,
        //        scaleOverride: true,
        //        scaleSteps: 4,
        //        scaleStepWidth: Math.ceil(100 / 4),
        //        scaleStartValue: 0,
        //        tooltipXOffset: 0,
        //        tooltipCaretSize: 8,
        //        tooltipTitleFontSize: 14,
        //        tooltipTitleFontStyle: "bold",
        //        tooltipTitleFontColor: "#fff",
        //        tooltipYPadding: 6,
        //        tooltipXPadding: 6
        //    };
        //
        //    $scope.onHover = function(points, chart, evt) {
        //        $timeout(function() {
        //            _.each(points, function(val, key) {
        //                if ($scope.show[key] === true) {
        //                    var x = val.x;
        //                    var y = val.y;
        //                    var radius = 14;
        //
        //                    var ctx = chart.chart.ctx;
        //                    ctx.beginPath();
        //                    ctx.arc(x, y, radius, 0, Math.PI * 2);
        //                    ctx.closePath();
        //                    ctx.strokeStyle = val.strokeColor;
        //                    ctx.lineWidth = 4;
        //                    ctx.fillStyle = val.fillColor;
        //                    ctx.fill();
        //                    ctx.stroke();
        //
        //                    chart.chart.ctx.textAlign = 'center';
        //                    chart.chart.ctx.textBaseline = 'middle';
        //                    chart.chart.ctx.fillStyle = val.strokeColor;
        //                    chart.chart.ctx.font = 'bold 12px Helvetica';
        //                    chart.chart.ctx.fillText(val.value, val.x, val.y);
        //                }
        //            });
        //            //chart.update();
        //        });
        //    };
        //
        //    vmd.setDefault = function() {
        //        _.each($scope.chartsKey, function(value, key) {
        //            $scope['chart_data_' + value] = $scope['origin_chart_data_' + value];
        //        });
        //        $scope.data = [
        //            $scope['chart_data_security'][0],
        //            $scope['chart_data_performance'][0],
        //            // $scope['chart_data_availability'][0],
        //            $scope['chart_data_seo'][0],
        //            $scope['chart_data_accessibility'][0],
        //            $scope['chart_data_backups'][0]
        //        ];
        //        $scope.labels = $scope.origin_labels;
        //    };
        //
        //    $rootScope.$watch('sliceDashboardChartDays', function(newValue, oldValue) {
        //        if (newValue.startDate && newValue.endDate) {
        //            var indexStart = _.findIndex($scope.origin_labels, function(val) {
        //                var parts = val.split('/');
        //                var date = new Date(parts[2], parts[0] - 1, parts[1], 23, 59, 59);
        //                return newValue.startDate._d <= date;
        //            });
        //
        //            var indexEnd = _.findIndex($scope.origin_labels, function(val) {
        //                var parts = val.split('/');
        //                var date = new Date(parts[2], parts[0] - 1, parts[1], 0, 0, 0);
        //                //console.log(newValue.endDate._d >= date, newValue.endDate._d);
        //                return newValue.endDate._d <= date;
        //            });
        //
        //            if (!(indexStart == -1 && indexEnd == -1)) {
        //                if (indexEnd == -1) {
        //                    $scope.labels = $scope.origin_labels.slice(indexStart);
        //                    _.each($scope.chartsKey, function(value, key) {
        //                        $scope['chart_data_' + value] = [];
        //                        $scope['chart_data_' + value].push($scope['origin_chart_data_' + value][0].slice(indexStart));
        //                    });
        //                } else {
        //                    $scope.labels = $scope.origin_labels.slice(indexStart, indexEnd);
        //                    _.each($scope.chartsKey, function(value, key) {
        //                        $scope['chart_data_' + value] = [];
        //                        $scope['chart_data_' + value].push($scope['origin_chart_data_' + value][0].slice(indexStart, indexEnd));
        //                    });
        //                }
        //                $scope.data = [
        //                    $scope['chart_data_security'][0],
        //                    $scope['chart_data_performance'][0],
        //                    // $scope['chart_data_availability'][0],
        //                    $scope['chart_data_seo'][0],
        //                    $scope['chart_data_accessibility'][0],
        //                    $scope['chart_data_backups'][0]
        //                ];
        //
        //            } else {
        //                //    Default values
        //                vmd.setDefault();
        //            }
        //        } else {
        //            //    Default values
        //            vmd.setDefault();
        //        }
        //
        //        $timeout(function() {
        //            $scope.chartData = $scope.data;
        //            $scope.show = [true, true, true, true, true, true];
        //            $scope.show_security = [true];
        //            $scope.show_accessibility = [true];
        //            // $scope.show_availability = [true];
        //            $scope.show_backups = [true];
        //            $scope.show_performance = [true];
        //            $scope.show_seo = [true];
        //
        //            $scope.generalChart = {
        //                "data": [],
        //                "series": $scope.series,
        //                "colors": ['#7b52a0', '#58b655', /*'#fbce01',*/ '#ef5150', '#32a8d6', '#989898', '#64f231'],
        //                "labels": $scope.labels,
        //                "options": $scope.options,
        //                "name": 'generalChart',
        //                "redline": false,
        //                "show": $scope.show,
        //                "onHover": $scope.onHover,
        //                "chartOptions": $scope.options,
        //                "handleShow": function() {
        //                    $scope.handleShow();
        //                }
        //            };
        //
        //            $scope.securityChart = {
        //                "data": $scope.chart_data_security,
        //                "series": [$scope.series[0]],
        //                "colors": ['#7b52a0'],
        //                "labels": $scope.labels,
        //                "options": $scope.options,
        //                "name": 'securityChart',
        //                "redline": $scope.policy.security || vmd.defaultPolicy,
        //                "show": $scope.show_security,
        //                "onHover": $scope.onHover,
        //                "chartOptions": $scope.options
        //            };
        //
        //            $scope.performanceChart = {
        //                "data": $scope.chart_data_performance,
        //                "series": [$scope.series[1]],
        //                "colors": ['#58b655'],
        //                "labels": $scope.labels,
        //                "options": $scope.options,
        //                "name": 'performanceChart',
        //                "redline": $scope.policy.performance || vmd.defaultPolicy,
        //                "show": $scope.show_performance,
        //                "onHover": $scope.onHover,
        //                "chartOptions": $scope.options
        //            };
        //
        //            // $scope.availabilityChart = {
        //            //     "data": $scope.chart_data_availability,
        //            //     "series": [$scope.series[2]],
        //            //     "colors": ['#fbce01'],
        //            //     "labels": $scope.labels,
        //            //     "options": $scope.options,
        //            //     "name": 'availabilityChart',
        //            //     "redline": false,
        //            //     "show": $scope.show_availability,
        //            //     "onHover": $scope.onHover,
        //            //     "chartOptions": $scope.options
        //            // };
        //
        //            $scope.seoChart = {
        //                "data": $scope.chart_data_seo,
        //                "series": [$scope.series[2]],
        //                "colors": ['#ef5150'],
        //                "labels": $scope.labels,
        //                "options": $scope.options,
        //                "name": 'seoChart',
        //                "redline": $scope.policy.seo || vmd.defaultPolicy,
        //                "show": $scope.show_seo,
        //                "onHover": $scope.onHover,
        //                "chartOptions": $scope.options
        //            };
        //
        //            $scope.accessibilityChart = {
        //                "data": $scope.chart_data_accessibility,
        //                "series": [$scope.series[3]],
        //                "colors": ['#32a8d6'],
        //                "labels": $scope.labels,
        //                "options": $scope.options,
        //                "name": 'accessibilityChart',
        //                "redline": $scope.policy.accessibility || vmd.defaultPolicy,
        //                "show": $scope.show_accessibility,
        //                "onHover": $scope.onHover,
        //                "chartOptions": $scope.options
        //            };
        //
        //            $scope.backupsChart = {
        //                "data": $scope.chart_data_backups,
        //                "series": [$scope.series[4]],
        //                "colors": ['#989898'],
        //                "labels": $scope.labels,
        //                "options": $scope.options,
        //                "name": 'backupsChart',
        //                "redline": $scope.policy.backups || vmd.defaultPolicy,
        //                "show": $scope.show_backups,
        //                "onHover": $scope.onHover,
        //                "chartOptions": $scope.options
        //            };
        //
        //            $scope.handleShow = function() {
        //                var output = [];
        //                angular.copy($scope.chartData, output);
        //                for (var i = 0; i < output.length; i++) {
        //                    if ($scope.generalChart.show[i] === false) {
        //                        for (var j = 0; j < output[i].length; j++) {
        //                            output[i][j] = null
        //                        }
        //                    }
        //                }
        //                $scope.generalChart.data = output;
        //            }
        //            $scope.handleShow();
        //        });
        //    });
        //}, function(error) {
        //    console.log(error);
        //});
        //
        //// Health.latestScore(appId).then(function(data) {
        ////     vmd.avgGroupScore = data.score;
        //// }, function(error) {
        ////     console.log('LATEST SCORE ERROR', error);
        //// })
        //
        ////TEMPORARY CODE
        //vmd.initType = function(type) {
        //    vmd.currentType = type;
        //    var obj = {};
        //    var stacks;
        //    vmd.stacks = [];
        //    //only for now default policy is 50. (policy.js)
        //    console.log($scope.vm);
        //    //$scope.vm.app.policy = $scope.vm.app.policy || {};
        //    obj[type] = ($scope.vm.app.policy[type] && $scope.vm.app.policy[type].value) ? $scope.vm.app.policy[type].value : vmd.defaultPolicy.value;
        //    Health.stacksUnderThreshold(appId, obj, function(err, data) {
        //        if (err) return console.log('an error accourd, try again please', 'failed');
        //        vmd.stackScore = _.indexBy(data.stacks, 'id');
        //        console.log(vmd.stackScore);
        //        stacks = _.pick(groupStacks, _.map(data.stacks, 'id'));
        //        vmd.avgGroupScore = data.score;
        //        setScoreClass();
        //        for (var index in stacks) {
        //            var initialVal = ($scope.vm.app.policy && $scope.vm.app.policy[vmd.currentType]) ? $scope.vm.app.policy[vmd.currentType].value : vmd.defaultPolicy.value;
        //            stacks[index].distance = initialVal - Math.floor(vmd.stackScore[index].score);
        //            stacks[index].distance = -stacks[index].distance;
        //            vmd.stacks.push(stacks[index]);
        //        }
        //    });
        //}
        //
        //function setScoreClass() {
        //    for (var index in vmd.avgGroupScore) {
        //        try {
        //            vmd.avgGroupScore[index].avgScore = parseInt(vmd.avgGroupScore[index].avgScore);
        //            vmd.avgGroupScore[index].avgScore = vmd.avgGroupScore[index].avgScore || '';
        //        } catch (e) {
        //            vmd.avgGroupScore[index].avgScore = '';
        //        }
        //        vmd.avgGroupScore[index].class = (!vmd.avgGroupScore[index] || !vmd.avgGroupScore[index].avgScore) ? 'purple-bg' : ((vmd.avgGroupScore[index].avgScore >= 50) ? 'green-bg' : 'red-bg');
        //    }
        //}
    }
]);