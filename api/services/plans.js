'use strict';

var plansCtrl = require('../controllers/billing/plans'),
    _ = require('lodash'),
    PLANS, FEATURES, DEFAULT_PLAN_ID;



var Plan = function(data) {
    this._id = data._id;
    this.id = data.id;
    this.features = data.flattenFeatures;
};

//types: A-array, B-bool, S-string, N-munber
Plan.prototype.getFeature = function(name, type, val) {
    var _val;
    if (!this.features || !this.features[name]) return null;
    switch (type) {
        case 'A':
            if (!val) _val = null;
            else if (this.features[name].indexOf(val) > -1) _val = true;
            break;
        case 'B':
            if (this.features[name] && (this.features[name] === true || this.features[name] === 'true'))
             _val = true;
            break;
        case 'S':
            _val = this.features[name].toLowerCase();
            break;
        case 'N':
            try {
                _val = parseInt(this.features[name])
            } catch (error) {
                _val = null;
            }
            break;
        default:
            break;
    }
    return _val;
};

var findOne = exports.findOne = function(id, cb) {
    id = id || DEFAULT_PLAN_ID;
    if (PLANS) return cb(null, PLANS[id], FEATURES);
    var query, data;
    plansCtrl.getPlansAndFeatures(query, data, function(err, data) {
        if (err) return cb(err);
        PLANS = _.indexBy(data.plans, '_id');
        for (var index in PLANS) {
            PLANS[index] = new Plan(PLANS[index]);
        }
        FEATURES = data.features;
        DEFAULT_PLAN_ID = data.defaultPlanId;
        id = id || DEFAULT_PLAN_ID;
        cb(null, PLANS[id], FEATURES);
    });
};

exports.clear = function() {
    PLANS = null;
    FEATURES = null;
    DEFAULT_PLAN_ID = null;
};

exports.getFeature = function(options, cb) {
    findOne(options.plan, function(err, plan) {
        if (err) return cb(err);
        var data = {
            plan: plan,
            feature: plan.getFeature(options.name, options.type, options.val)
        };
        return cb(null, data);
    });
};

exports.get = function(cb) {
    if (PLANS) return cb(null, PLANS, DEFAULT_PLAN_ID);
    var query, data;
    plansCtrl.getPlansAndFeatures(query, data, function(err, data) {
        if (err) return cb(err);
        PLANS = _.indexBy(data.plans, '_id');
        for (var index in PLANS) {
            PLANS[index] = new Plan(PLANS[index]);
        }
        FEATURES = data.features;
        DEFAULT_PLAN_ID = data.defaultPlanId;
        cb(null, PLANS, DEFAULT_PLAN_ID);
    });
    
};