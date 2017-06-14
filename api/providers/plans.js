'use strict';


require('../models/billing/plan');

var mongoose = require('mongoose'),
    Plan = mongoose.model('Plan'),
    _ = require('lodash'),
    plans;

function init() {
    Plan.find().populate('features.id').exec(function(err, data) {
        if (err) return console.error('Plan provider error', err);
        var freePlan;
        data.forEach(function(plan) {
            if (plan.id === 'free') {
                freePlan = JSON.parse(JSON.stringify(plan));
                freePlan._id = 'free';
                return;
            }
        });
        if (freePlan)
            data.push(freePlan);

        data = _.indexBy(data, '_id');
        data = _.mapValues(data, function(plan, index) {
            var obj = {};
            plan.features.forEach(function(feature, index) {
                obj[feature.id.id] = feature.value[feature.id.valueType];
            });
            return obj;
        });
        plans = data;
    });

}

// init();

exports.get = function(cb) {
    if (plans) return cb(plans);
    setTimeout(function() {
        cb(plans);
    }, 10);
};
