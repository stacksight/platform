'use strict';

angular.module('mean.stripe').factory('StripeService', ['$http', '$q',
    function($http, $q) {

        // var billingProvider = ConfigApp.billingProvider;
        return {
            getConfig: function() {
                var deferred = $q.defer();
                $http.get('stripe/config').success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).error(function(data, status, headers, config) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            setConfig: function(settings) {
                var deferred = $q.defer();
                $http.post('stripe/config', settings).success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).error(function(data, status, headers, config) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            cards: function() {
                var deferred = $q.defer();
                $http.get('stripe/cards').success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).error(function(data, status, headers, config) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            plans: function() {
                var deferred = $q.defer();
                $http.get('/stripe/plans').success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).error(function(data, status, headers, config) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            getPlan: function(id) {
                var deferred = $q.defer();
                $http.get('/stripe/plans/' + id).success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).error(function(data, status, headers, config) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            pay: function(planId) {
                var deferred = $q.defer();
                $http.post('/stripe/subscribe', {
                    planId: planId
                }).success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).error(function(data, status, headers, config) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            // addCard: function(token) {
            //     var deferred = $q.defer();
            //     $http.post('stripe/cards', {
            //         token: token
            //     }).success(function(data, status, headers, config) {
            //         deferred.resolve(data);
            //     }).error(function(data, status, headers, config) {
            //         deferred.reject(data);
            //     });
            //     return deferred.promise;

            // },
            getCustomer: function(cid) {
                var deferred = $q.defer();
                $http.get('/stripe/customer/' + cid).success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).error(function(data, status, headers, config) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            addCard: function(data, cb) {
                loadScript("https://checkout.stripe.com/checkout.js", function loadForm() {
                    var handler = StripeCheckout.configure({
                        key: data.publicKey,
                        image: 'https://apps.stacksight.io/system/assets/img/logo/2.png',
                        token: function(token) {
                            return cb(null, token);
                            // Billing.createCustomer(token).then(function(data) {
                            //     if (data.cid) $scope.global.user.stripe.cid = data.cid;
                            //     $scope.defaultCard = data.card;
                            //     if (cb) cb();
                            //     sweetAlert("Card added successfully!", "", "success");

                            // }, function(data) {
                            //     sweetAlert("Cancelled", "Card is not added :(, try again", "error");
                            // });
                        }
                    });
                    // https://stripe.com/docs/checkout#integration-custom
                    var _data = {
                        name: 'Stacksight',
                        panelLabel: 'Add Card',
                        allowRememberMe: false
                    };
                    if (data.email) _data.email = data.email;
                    // Open Checkout with further options
                    handler.open(_data);
                });
            }
        };
    }
]);

function loadScript(src, callback) {
    var oHead = document.getElementsByTagName('head')[0];
    var oScript = document.createElement('script');
    oScript.type = 'text/javascript';
    oScript.src = src;
    oHead.appendChild(oScript);
    oScript.onload = callback;
}
