'use strict';

/* jshint -W098 */
angular.module('mean.billing').controller('BillingController', ['$scope', 'config', 'Global', 'Billing', 'StripeService', '$stateParams', '_', '$timeout', '$state', 'Profile',
    function($scope, config, Global, Billing, StripeService, $stateParams, _, $timeout, $state, Profile) {

        var vmb = this;
        var planId = $stateParams.id;
        vmb.global = Global;

        var billingProvider = config.billingProvider;
        vmb.billingProvider = billingProvider;

        vmb.sideBarData = {
            dir: 'right'
        };

        function pay(plan, coupon) {

            Billing.pay(plan, coupon, function(err, data) {
                vmb.payClicked = false;
                if (err) return sweetAlert("Cancelled", "Subscription failed :(, try again", "error");
                sweetAlert("Subscribe success!", "", "success");
                vmb.global.user.plan = data.user.plan;
                vmb.global.user.profile.billing[billingProvider] = data.user.profile.billing[billingProvider];
                vmb.currentPlan = vmb.planToUpgrade;
                Billing.setCurrentPlan(vmb.planToUpgrade);
                $timeout(function() {
                    $state.go('profile.billing');
                }, 1000);
            });
        }

        vmb.plans = function() {

            Billing.plans(planId, function(err, data) {
                if (err) console.log(err);
                vmb.plans = data.plans;
                vmb.features = data.features;
                vmb.currentPlan = data.currentPlan;
                if (planId) {
                    vmb.planToUpgrade = _.find(vmb.plans, function(o) {
                        return o._id === planId;
                    });
                }
            });
        };

        vmb.findCurrentPlan = function() {
            Billing.findPlan(vmb.global.user.plan, function(err, doc) {
                if (err) console.log(err);
                vmb.currentPlan = doc;
            });
        };

        var defaultCardFunctions = {
            stripe: function() {
                // vmb.currentCard = vmb.global.user.profile.billing[billingProvider].sources.data[0];
                vmb.currentCard = _.find(vmb.global.user.profile.billing[billingProvider].sources.data, function(o) {
                    return o.id === vmb.global.user.profile.billing[billingProvider].default_source;
                });
            }
        };

        vmb.findCurrentCard = function() {
            if (vmb.global.user.profile.billing[billingProvider] && defaultCardFunctions[billingProvider]) defaultCardFunctions[billingProvider]();
        };

        vmb.init = function() {
            vmb.findCurrentPlan();
            vmb.findCurrentCard();
            vmb.getCharges();
        };

        function createCustomer(data, cb) {
            Billing.createCustomer(data, function(err, data) {
                console.log('createCustomer response', err, data);
                if (err) return sweetAlert("Cancelled", "Create customer failed :(, try again", "error");
                vmb.global.user.profile.billing[billingProvider] = data.user.billing[billingProvider];
                cb();
            });
        }

        vmb.subscribe = function() {
            vmb.payClicked = true;

            updateProfile(function() {
                if (vmb.global.user.profile.billing[billingProvider])
                    return pay(vmb.planToUpgrade, vmb.coupon);
                if (billingProvider === 'stripe') {
                    var data = { email: vmb.global.user.email, publicKey: config[billingProvider].publicKey };
                    StripeService.addCard(data, function(err, token) {
                        createCustomer(token, function(data) {
                            pay(vmb.planToUpgrade, vmb.coupon);
                        });
                    });
                }
            });
        };

        vmb.addCard = function() {
            if (billingProvider === 'stripe') {
                var data = { email: vmb.global.user.email, publicKey: config[billingProvider].publicKey };
                StripeService.addCard(data, function(err, token) {
                    Billing.addCard(token, function(err, data) {
                        vmb.global.user.profile.billing[billingProvider] = data.user.profile.billing[billingProvider];
                        vmb.findCurrentCard();
                        console.log('####', err, data);
                    });
                });
            }
        };

        vmb.successApplyCoupon = false;

        vmb.applyCoupon = function(token) {
            Billing.applyCoupon(token, vmb.planToUpgrade._id, function(err, coupon) {
                if (err) return sweetAlert("Cancelled", err, "error");
                vmb.coupon = coupon;
                vmb.successApplyCoupon = true;
                vmb.couponAppliedText = (coupon.name || coupon.id) + ' applied. ' + coupon.percentOff + '% discount on ' + vmb.planToUpgrade.name + ' plan.';
                // sweetAlert("", (coupon.name || coupon.id) + ' applied. ' + coupon.percentOff + '% discount on ' + vmb.planToUpgrade.name + ' plan.', "success");
            });
        };

        function updateProfile(cb) {
            Profile.update(vmb.global.user, function(err, data) {
                if (err) console.log('update profile err', err);
                else console.log('update profile - success');
                cb();
            });
        }

        vmb.getCharges = function() {
            Billing.charges(function(err, charges) {
                if (err) return console.log(err);
                vmb.charges = charges;
            });
        };
    }
]);
