'use strict';

/* jshint -W098 */
angular.module('mean.stripe').controller('StripeController', ['$scope', '$http', 'Global', 'StripeService', '$q', '$timeout',
    function($scope, $http, Global, StripeService, $q, $timeout) {
        /*

        This will be refactored - dont panic - POC only

        */
        $scope.global = Global;

        $scope.stripe = {
            settings: {}
        };

        $scope.sideBarData = {
            dir: 'right'
        };

        $scope.alerts = [];

        var Stripe = this;

        function getSettings() {
            var deferred = $q.defer();
            if ($scope.stripe.settings.publicKey)
                deferred.resolve($scope.stripe.settings);

            else
                StripeService.getConfig().then(function(data) {
                    $scope.stripe.settings = data;
                    deferred.resolve(data);
                }, function(data) {
                    deferred.reject(data);
                    $scope.stripe.response = data;
                })
            return deferred.promise;
        }


        function updateSettings() {
            StripeService.setConfig($scope.stripe.settings).then(function(data) {
                $scope.stripe.settings = data;
                alert("Update Settings success!");
            }, function(data) {
                $scope.stripe.response = data;
                alert("Update settings failed");
            });
        }

        function getCards() {
            StripeService.getCards().then(function(data) {
                $scope.stripe.cards = data.data;
                $scope.stripe.cards.forEach(function(card) {
                    if (card.id === $scope.global.user.stripe.defaultCard) {
                        $scope.stripe.defaultCard = card;
                    }
                });

            }, function(data) {});
        }

        function getPlans() {
            StripeService.plans().then(function(data) {
                $scope.stripe.plans = [];
                $scope.stripe.plans[0] = {
                    name: 'Free',
                    amount: 0,
                    interval: 'month',
                    features: ['realtime only (24 hr data retention)', 'single user', 'up to 3 applications']
                };
                $scope.stripe.plans = $scope.stripe.plans.concat(data);
                $scope.stripe.plans.push({
                    name: 'Enterprise',
                    amount: 1000000,
                    features: ['30 day data retention', 'team support', 'unlimited applications', 'ssl']
                });

            }, function(data) {});
        }

        function getPlan(id) {
            if (!id) return;
            StripeService.getPlan(id).then(function(data) {
                $scope.currentPlan = data;
            }, function(data) {
                console.log('get plan error: ', data);
            });
        }

        function pay(planId) {
            StripeService.pay(planId).then(function(data) {
                sweetAlert("Subscribe success!", "", "success");
                $timeout(function() {
                    $scope.alerts = [];
                    window.history.back();
                }, 1000);

            }, function(data) {
                sweetAlert("Cancelled", "Subscription failed :(, try again", "error");
            });
        }

        var handler;

        function addCard(cb) {
            getSettings().then(function(data) {
                loadScript("https://checkout.stripe.com/checkout.js", function loadForm() {
                    handler = StripeCheckout.configure({
                        key: data.publicKey,
                        image: 'https://apps.stacksight.io/system/assets/img/logo/2.png',
                        token: function(token) {
                            StripeService.addCard(token).then(function(data) {
                                if (data.cid) $scope.global.user.stripe.cid = data.cid;
                                $scope.defaultCard = data.card;
                                if (cb) cb();
                                sweetAlert("Card added successfully!", "", "success");

                            }, function(data) {
                                sweetAlert("Cancelled", "Card is not added :(, try again", "error");
                            });
                        }
                    });
                    // Open Checkout with further options
                    handler.open({
                        name: 'Stacksight',
                        // description: '2 widgets',
                        panelLabel: 'Add Card',
                        allowRememberMe: false
                    });

                });
            });
        }

        function subscribe(planId) {
            if ($scope.global.user && $scope.global.user.stripe && $scope.global.user.stripe.cid)
                return pay(planId);
            addCard(function() {
                pay(planId);
            });
        }

        function getCustomer() {
            if ($scope.global.user.stripe && $scope.global.user.stripe.cid)
                StripeService.getCustomer($scope.global.user.stripe.cid).then(function(data) {
                    if (data.subscriptions && data.subscriptions.data.length) {
                        $scope.currentPlan = data.subscriptions.data[0].plan;
                    }
                    if (data.sources && data.sources.data.length)
                        data.sources.data.forEach(function(src) {
                            if (src.id === data.default_source) {
                                $scope.defaultCard = src;
                            }
                        });
                }, function(data) {
                    console.log('get customer error: ', data);
                });
        }

        Stripe.getSettings = getSettings;
        Stripe.updateSettings = updateSettings;
        Stripe.getCards = getCards;
        Stripe.getPlans = getPlans;
        Stripe.getPlan = getPlan;
        Stripe.subscribe = subscribe;
        Stripe.pay = pay;
        Stripe.addCard = addCard;
        Stripe.getCustomer = getCustomer;

        // Refactor Stripe
        function loadScript(src, callback) {
            var oHead = document.getElementsByTagName('head')[0];
            var oScript = document.createElement('script');
            oScript.type = 'text/javascript';
            oScript.src = src;
            oHead.appendChild(oScript);
            oScript.onload = callback;
        }



        $('#customButton').on('click', function(e) {
            addCard(function() {});
            e.preventDefault();
        });

        // Close Checkout on page navigation
        $(window).on('popstate', function() {
            if (handler) handler.close();
        });

    }
]);
