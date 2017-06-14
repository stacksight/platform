'use strict';

angular.module('mean.stacks').factory('Events', ['Stacksun', '$q',
    function(Stacksun, $q) {
        return {
            keys: function(options, cb) {
                Stacksun.aggregation('eventsKeys', options, function(data) {
                    data.forEach(function(type) {
                        type.actions.buckets.forEach(function(action) {
                            action.checked = true;
                        });
                        type.subtypes.buckets.forEach(function(subtype) {
                            subtype.actions.buckets.forEach(function(action) {
                                actionIndex(type, action);
                                action.checked = true

                            });
                        });
                    });

                    function actionIndex(type, _action) {
                        type.actions.buckets.forEach(function(action, index) {
                            if (_action.key === action.key) {
                                type.actions.buckets[index]['doc_count'] -= _action['doc_count'];
                                return index;
                            }
                        });
                    }
                    cb(data);
                });
            }
        };
    }
]);
