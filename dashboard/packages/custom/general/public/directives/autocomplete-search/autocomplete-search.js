'use strict';

angular.module('mean.general').directive('autoSearch', ['General', '$http', '$timeout', 'Serialize',
    function(General, $http, $timeout, Serialize) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/general/directives/autocomplete-search/autocomplete-search.html',
            scope: {
                exec: '&',
                noText: '&',
                noResultChanged: '&',
                options: '='
            },
            link: function($scope, element, attrs) {

                $scope.getData = function(val) {
                    $scope.options.text = val;
                    $scope.options.populate = 'author';
                    var cmd_api = '/sapi/autocomplete-search/' + $scope.options.index + '/' + $scope.options.type + '?' + Serialize.obj2qs($scope.options);
                    
                    return $http.get(cmd_api).then(function(response) {
                        return response.data.map(function(item) {
                            return item.fields;
                        });
                    });
                };

                $scope.callback = function($item, $model, $label) {
                    var data = {
                        item: $item,
                        model: $model,
                        label: $label
                    };
                    $scope.exec(data);
                };

                Object.defineProperty($scope, 'noResults', {
                    configurable: true,
                    set: function(value) {
                        $scope.wrapperNoResults = value;
                        $scope.noResultChanged({
                            noResults: value,
                            value: $scope.asyncSelected
                        });
                    }
                });

                $scope._change = function() {
                    if (!$scope.asyncSelected) $scope.noText();
                };

                $scope.enter = function() {
                    if ($scope.asyncSelected) return;
                    var val = element.children('input').val();
                    if (element.children('input').val()) {
                        var data = {
                            item: {
                                "label": [],
                                "nameNversion": [],
                                "name": [val],
                                "version": []
                            },
                            model: val,
                            label: val
                        };
                        $scope.exec(data);
                    }
                };
            }
        };
    }
]);