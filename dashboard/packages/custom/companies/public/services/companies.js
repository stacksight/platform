(function() {
    'use strict';
    angular
        .module('mean.companies')
        .factory('Companies', Companies);

    Companies.$inject = ['Sapi', '$q'];

    function Companies(Sapi, $q) {
        return {
            update: function(id, data, cb) {
                Sapi.put({
                    cmd_api: '/companies/' + id,
                    data: data
                }).then(function(data) {
                    cb(null, data);
                }, function(err) {
                    cb(err);
                });
            },
            findOne: function(id) {
                var defer = $q.defer();
                Sapi.get({
                    cmd_api: '/sapi/companies/' + id + '?populate=stacks,collaborators'
                }).then(function(data) {
                    if (data && data.collaborators) {
                        data.collaborators.forEach(function(col) {
                            if (!col.id) return;
                            var cData = col.id;
                            delete col.id;
                            col.id = cData._id;
                            col.name = cData.name;
                            col.profile = cData.profile;
                        });
                    }
                    defer.resolve(data);
                }, function(err) {
                    defer.reject(err);
                });
                return defer.promise;
            },
            my: function(companies) {
                for (var i = 0; i < companies.length; i++) {
                    if (companies[i].permission === 'owner')
                        return companies[i];
                }
            }
        };
    }
})();