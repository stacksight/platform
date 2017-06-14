'use strict';

var stripe = require('../../../providers/stripe');

exports.create = function(plan, cb) {

    var planObj = {
        amount: plan.amount,
        interval: plan.interval,
        name: plan.name,
        currency: 'usd',
        id: plan.id
    };
    if (plan.trialPeriodDays) planObj.trial_period_days = plan.trialPeriodDays;

    stripe.client.plans.create(planObj, function(err, plan) {
        if (err) return cb(err);
        cb(null, plan);
    });

};

exports.update = function(plan, cb) {

    var updatedPlan = {
        name: plan.name
    };

    stripe.client.plans.update(plan.stripe.id, updatedPlan, function(err, plan) {
        if (err) return cb(err);
        cb(null, plan);
    });

};
