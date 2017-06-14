'use strict';

require('../../models/billing/plan');

var _ = require('lodash'),
    mongoose = require('mongoose'),
    Plan = mongoose.model('Plan'),
    subscriptionsCtrl = require('./subscriptions'),
    config = require(process.cwd() + '/config'),
    billingProvider = config.billingProvider,
    billingPlansController = require('./' + billingProvider + '/plans'),
    featuresCtrl = require('../features'),
    plansService = require('../../services/plans'),
    interval = 'month';



exports.plan = function(req, res, next) {
    var planId = req.params.id;
    var query = {};

    if (planId === config.defaultPlan) query.id = planId;
    else query._id = planId;

    Plan.findOne(query).exec(function(err, plan) {
        if (err || !plan) return res.status(500).send(err || 'plan does not exist');
        req.plan = plan;
        next();
    });
};

exports.create = function(req, res) {
    var plan = new Plan(req.body);
    plan.interval = req.body.interval || interval;
    featuresCtrl.saveDescriptions(plan, function(err) {
        plan.save(function(err, doc) {
            if (err) return res.status(500).send(err);
            plansService.clear();
            registerToBillingProvider(plan, function(err, data) {
                if (err) return res.status(500).send(err);
                res.send(data);
            });
        });
    });
};


function registerToBillingProvider(plan, cb) {
    billingPlansController.create(plan, function(err, data) {
        if (err) {
            console.log('Stripe create plan err: ', err);
            return cb(err);
        }
        plan[billingProvider] = data;
        plan.save(function(err, doc) {
            if (err) {
                console.log('Stripe plan did not saved in db');
                return cb(err);
            }
            cb(null, doc);
        });
    });
};


exports.update = function(req, res) {

    var uneditableFields = ['amount', 'id', 'trialPeriodDays'],
        plan = req.plan,
        updateProvider = false;

    uneditableFields.forEach(function(field) {
        delete req.body[field];
    });


    if (plan.name !== req.body.name && req.body.name) updateProvider = true;

    plan = _.extend(plan, req.body);

    if (!plan[billingProvider])
        return registerToBillingProvider(plan, function(err, data) {
            if (err) return res.status(500).send(err);
            res.send(data);
        });

    if (!updateProvider) return save();

    billingPlansController.update(plan, function(err, data) {
        if (err) return res.status(500).send(err);
        plan[billingProvider] = data;
        save();
    });

    function save() {
        featuresCtrl.saveDescriptions(plan, function(err) {
            plan.save(function(err, doc) {
                if (err) return res.status(500).send(err);
                plansService.clear();
                res.send(doc);
            });
        });
    }
};

exports.delete = function(req, res) {
    return res.status(500).send('Delete plan is not supported yet.');
};

exports.company = function(req, res) {

    var data = {},
        query = {},
        plansIds,
        query1 = {};

    query1.user = req.company.owner._id;

    subscriptionsCtrl.findByUser(query1, function(err, subscriptions) {
        if (!err) data.subscriptions = subscriptions;
        if (subscriptions.length) {
            plansIds = _.map(data.subscriptions, 'plan');
            plansIds = _.map(plansIds, '_id');
        }
        query._id = {
            $nin: plansIds
        };
        query.visible = true;
        query[billingProvider] = {
            $exists: true
        };
        getPlansAndFeatures(query, data, function(err, data) {
            if (err) return res.status(500).send(err);
            res.send(data);
        });
    });
};

exports.personal = function(req, res) {

    var data = {},
        query = {
            $and: []
        },
        plansIds,
        query1 = {};

    query1.user = req.user._id;

    subscriptionsCtrl.findByUser(query1, function(err, subscriptions) {
        if (!err) data.subscriptions = subscriptions;
        if (subscriptions.length) {
            plansIds = _.map(data.subscriptions, 'plan');
            plansIds = _.map(plansIds, '_id');
        }
        // query._id = { $nin: plansIds };
        // query.visible = true;
        // query[billingProvider] = { $exists: true };
        query['$and'].push({
            _id: {
                $nin: plansIds
            }
        });
        query['$and'].push({
            visible: true
        });
        var or = [{}, {}];
        or[0][billingProvider] = {
            $exists: true
        };
        or[1].contactUs = true;
        query['$and'].push({$or: or});
        getPlansAndFeatures(query, data, function(err, data) {
            if (err) return res.status(500).send(err);
            res.send(data);
        });
    });
};


//find plans to the main dashboard
exports.find = function(req, res) {
    var query = {};
    query.visible = true;
    query[billingProvider] = {
        $exists: true
    };
    getPlansAndFeatures(query, null, function(err, data) {
        if (err) return res.status(500).send(err);
        res.send(data);
    });
};

var getPlansAndFeatures = exports.getPlansAndFeatures = function(query, data, cb) {
    var defaultPlanId;
    query = query || {};
    data = data || {};

    Plan.find(query).lean().exec(function(err, plans) {
        if (err) return cb(err);
        data.plans = plans;
        if (!data.plans || !data.plans.length) return cb('There are no saved plans');
        defaultPlanId = _.find(data.plans, function(o) {
            return o.id === config.defaultPlan;
        })._id;
        data.plans = _.map(data.plans, function(plan) {
            plan.features = _.indexBy(plan.features, 'id');
            return plan;
        });
        featuresCtrl.all(function(err, features) {
            if (err) return cb(err);
            data.features = features;
            data.defaultPlanId = defaultPlanId;
            cb(null, data);
        });
    });
}

//find plans to admin dashboard
exports.findAll = function(req, res) {
    Plan.find({}).exec(function(err, plans) {
        if (err) return res.status(500).send(err);
        res.send(plans);
    });
};

exports.findOne = function(req, res) {
    res.send(req.plan);
};