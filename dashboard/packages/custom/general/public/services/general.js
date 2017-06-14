'use strict';

angular.module('mean.general').factory('General', ['Sapi',
    function(Sapi) {
        return {
            autocompleteSearch: function(options, cb) {
                options.cmd_api = '/sapi/autocomplete-search/' + options.index + '/' + options.type + '?text=' + options.text + '&displayFields=' + options.displayFields + '&searchField=' + options.searchField;
                Sapi.get(options).then(function(data) {
                    cb(null, data);
                }, function(err) {
                    cb(err);
                });
            }
        };
    }
]);
