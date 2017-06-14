'use strict';
/* global D3Pie */
angular.module('mean.stacks')
    .directive('d3Pie', ['$rootScope', '$interval', '$filter', '_', function($rootScope, $interval, $filter, _) {
        return {
            scope: {
                id: '@',
                width: '=',
                height: '=',
                data: '=',
                detailListId: '@',
                tableconfig:'='
            },
            template: '',
            link: function(scope, element, attrs, controller) {
                var config = {
                    width: scope.width,
                    height: scope.height,
                    data: scope.data,
                    detailListId: '#'+scope.detailListId
                };

                var data = _.map(config.data, function(val, key) {
                    return {
                        "label": $filter('seotype')(key),
                        "value": val.count,
                        "color": $filter('colorize')(key),
                        "type": key
                    };
                });
                var pie = new d3pie(scope.id, {
                    "size": {
                        "canvasHeight": config.height,
                        "canvasWidth": config.width,
                        "pieOuterRadius": "100%"
                    },
                    "data": {
                        "sortOrder": "value-desc",
                        "content": data
                    },
                    "labels": {
                        "outer": {
                            "pieDistance": 26
                        },
                        "inner": {
                            "hideWhenLessThanPercentage": 4
                        },
                        "mainLabel": {
                            "fontSize": 11
                        },
                        "percentage": {
                            "color": "#ffffff",
                            "decimalPlaces": 0
                        },
                        "value": {
                            "color": "#adadad",
                            "fontSize": 11
                        },
                        "lines": {
                            "enabled": true
                        },
                        "truncation": {
                            "enabled": true
                        }
                    },
                    "effects": {
                        "pullOutSegmentOnClick": {
                            "effect": "elastic",
                            "speed": 400,
                            "size": 8
                        }
                    },
                    "misc": {
                        "gradient": {
                            "enabled": false,
                            "percentage": 100
                        }
                    }/*,
                    callbacks: {
                        onClickSegment: function(a) {
                            $rootScope.$broadcast('seoUpdate', a.data.type);
                        }
                    }*/
                });
            }
        };
    }]);