'use strict';

angular.module('mean.billing').factory('Billing', ['Sapi', 'ConfigApp', '_', 'Global',
    function(Sapi, ConfigApp, _, Global) {
        var features;
        var plansData;
        return {
            plans: function(id, cb) {
                if (plansData) return cb(null, plansData);
                Sapi.get({
                    cmd_api: '/sapi/plans'
                }).then(function(data) { //data contains plans and subscriptions
                    // if (data.subscriptions) {
                    //     data.subscriptions.forEach(function(subscription) {
                    //         subscription.plan.subscriptionId = subscription._id;
                    //         subscription.plan.coupon = subscription.coupon;
                    //         data.plans.push(subscription.plan);
                    //     });
                    // }
                    var currentPlan = Global.user.plan || data.defaultPlanId;
                    data.currentPlan = _.find(data.plans, function(o) {
                        return o._id === currentPlan;
                    });
                    plansData = data;
                    cb(null, data);
                }, function(error) {
                    cb(error);
                });
            },
            setCurrentPlan: function(plan) {
                if (plansData) plansData.currentPlan = plan;
            },
            createCustomer: function(data, cb) {
                Sapi.post({
                    cmd_api: '/customers',
                    data: data
                }).then(function(customer) {
                    cb(null, customer);
                }, function(error) {
                    cb(error);
                });
            },
            pay: function(plan, coupon, cb) {
                var data = { plan: plan._id };
                if (coupon) data.coupon = coupon._id;
                Sapi.post({
                    cmd_api: '/subscriptions',
                    data: data
                }).then(function(subscription) {
                    cb(null, subscription);
                }, function(error) {
                    cb(error);
                });
            },
            findPlan: function(id, cb) {
                ConfigApp.get().then(function(config) {
                    id = id || config.defaultPlan;
                    Sapi.get({
                        cmd_api: '/sapi/plans/' + id
                    }).then(function(data) {
                        cb(null, data);
                    }, function(error) {
                        cb(error);
                    });
                }, function(err) {
                    console.log('get public config err', err);
                    return cb(err);
                });
            },
            applyCoupon: function(token, plan, cb) {
                var data = {
                    plan: plan,
                    token: token
                };
                Sapi.post({
                    cmd_api: '/coupons',
                    data: data
                }).then(function(data) {
                    cb(null, data);
                }, function(error) {
                    cb(error);
                });
            },
            addCard: function(token, cb) {
                console.log(token);
                Sapi.put({
                    cmd_api: '/customers',
                    data: { action: 'addCard', card: token }
                }).then(function(customer) {
                    cb(null, customer);
                }, function(error) {
                    cb(error);
                });
            },
            charges: function(cb) {
                Sapi.get({
                    cmd_api: '/sapi/charges'
                }).then(function(charges) {
                    cb(null, charges.data);
                }, function(error) {
                    cb(error);
                }); 
            }
        };
    }
]);