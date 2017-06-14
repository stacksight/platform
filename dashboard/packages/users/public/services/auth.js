'use strict';

angular.module('mean.users')
    .factory('Auth', ['$q', '$timeout', '$location', '$http', authFactory]);

function authFactory($q, $timeout, $location, $http) {
    var userLoggedin = false;
    return {
        checkLoggedin: function() {
            var deferred = $q.defer();
            if (userLoggedin) return $timeout(deferred.resolve);
            else {
                // Make an AJAX call to check if the user is logged in
                $http.get('/loggedin').success(function(user) {
                    // Authenticated
                    if (user !== '0') {
                        userLoggedin = true;
                        $timeout(deferred.resolve);
                    }

                    // Not Authenticated
                    else {
                        $timeout(deferred.reject);
                        $location.url('/login');
                    }
                });

            }


            return deferred.promise;

        },
        checkAdmin: function() {
            var deferred = $q.defer();

            // Make an AJAX call to check if the user is logged in
            $http.get('/loggedin').success(function(user) {
                // Authenticated
                if (user !== '0' && user.roles.indexOf('admin') !== -1) $timeout(deferred.resolve);

                // Not Authenticated or not Admin
                else {
                    $timeout(deferred.reject);
                    $location.url('/');
                }
            });
        }
    };
}
