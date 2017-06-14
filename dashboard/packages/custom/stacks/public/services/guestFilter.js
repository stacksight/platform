'use strict';

angular.module('mean.stacks').filter('isGuest', function($filter){
    return function(list, arrayFilter, element){
        if(arrayFilter){
            return $filter("filter")(list, function(listItem){
                return _.indexOf(listItem.permissions, arrayFilter) == !-1
            });
        }
    };
});

angular.module('mean.stacks').filter('isntGuest', function($filter){
    return function(list, arrayFilter, element){
        if(arrayFilter){
            return $filter("filter")(list, function(listItem){
                return _.indexOf(listItem.permissions, arrayFilter) == -1
            });
        }
    };
});