'use strict';

angular.module('mean.general').factory('Serialize', ['Sapi', '$q',
    function(Sapi, $q) {

        return {
            obj2qs: function(obj) { //object to query string
                var str = [];
                for (var p in obj)
                    if (obj.hasOwnProperty(p)) {
                        if (obj[p])
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                return str.join("&");
            }
        };
    }
]);