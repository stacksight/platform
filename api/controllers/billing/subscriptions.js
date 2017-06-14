'use struct';

require('../../models/billing/subscription');

var mongoose = require('mongoose'),
    Subscription = mongoose.model('Subscription'),
    Plan = mongoose.model('Plan'),
    config = require(process.cwd() + '/config'),
    billingProvider = config.billingProvider,
    billingSubscriptionController = require('./' + billingProvider + '/subscriptions'),
    stacks = require('../stacks'),
    mails = require('../../providers/mails'),
    couponsCtrl = require('./coupons'),
    usersCtrl = require('../../controllers/users');


function saveUserData(subscription, uid, cb) {
    usersCtrl._findById(uid, function(err, user) {
        if (err) return cb(err);

        user.roles.addToSet('subscriber');
        user.plan = subscription.plan._id;
        user.subscription = subscription._id;
        user.save(function(err, doc) {
            console.log('user save', err, doc);
            //ORIT: CHECK THE STACKS CREATED BY COLLABORATORS !!!
            stacks.updateIndexName(doc);
            // mails.send('invoice', {
            //     to: doc.email,
            //     subject: 'Invoice',
            //     locals: {
            //         name: doc.name
            //     }
            // });
            cb(err, doc);
        });

    });
}

exports.active = function(req, res) {


    var subscription = req.subscription;
    console.log(subscription);
    activeSubsciption(subscription, req.user, function(err, data) {
        if (err) return res.status(500).send(err);
        res.send(data);

    });
};

exports.hasPermissions = function(req, res, next) {
    if (req.user._id.toString() !== req.subscription.user._id.toString()) return res.status(401).send('You do not have permissions to buy this plan');
    next();
};

exports.update = function(req, res) {

};

exports.delete = function(req, res) {

};

exports.find = function(req, res) {
    Subscription.find().exec(function(err, subscriptions) {
        if (err || !subscriptions.length) return res.status(500).send(err || 'There are no subscriptions yet');
        res.send(subscriptions);
    });
};

exports.subscription = function(req, res, next) {

    var subscriptionId = req.params.id;
    Subscription.findOne({
        _id: subscriptionId
    }).populate('plan coupon user').exec(function(err, subscription) {
        if (err || !subscription) return res.status(500).send(err || 'Subscription does not exist');
        req.subscription = subscription;
        next();
    });
}

exports.findOne = function(req, res) {
    return res.send(req.subscription);
};

var findByUser = exports.findByUser = function(query, cb) {
    Subscription.find(query).populate('plan').exec(function(err, subscriptions) {
        if (err) return cb(err);
        cb(null, subscriptions);
    });
};

exports.checkCoupon = function(req, res, next) {
    if (!req.body.coupon) req.skipCheckCoupon = true;
    next();
};

var create = exports.create = function(user, plan, coupon, cb) {
    var subscription = new Subscription({
        plan: plan,
        user: user,
        status: ['new']
    });
    if (coupon) subscription.coupon = coupon;

    subscription.save(function(err, doc) {
        if (err) return cb(err);
        cb(null, doc);
    });
};

exports.adminCreate = function(req, res) {
    var data = req.body;
    if (!data.user || !data.plan) return res.status(400).send('missing details: plan or user');
    create(data.user, data.plan, data.coupon, function(err, subscription) {
        if (err) return res.status(500).send(err);
        res.send(subscription);
    });
};

exports.findOrCreate = function(req, res, next) {
    // subscription exists in user req.user - findByUser is unneeded
    var query = {},
        user;

    user = req.company.owner;
    query.user = user._id;

    // if (req.body.plan) query.plan = req.body.plan;

    findByUser(query, function(err, subscriptions) {
        if (err) return res.status(500).send(err);

        if (subscriptions && subscriptions.length) {
            if (subscriptions.length > 1)
            for (var i = 0; i < subscriptions.length; i++) {
                var element = subscriptions[i];
                if (element[billingProvider]) req.subscription = element;
            }
            req.subscription = req.subscription || subscriptions[0]; // user have only 1 subscription per plan and the query with plan
            if (req.subscription[billingProvider])
                req.action = 'update';
            else
                req.action = 'create';
            return next();
        }

        create(user._id, req.body.plan, req.coupon, function(err, subscription) {
            if (err) return res.status(500).send(err);
            req.subscription = subscription;
            req.action = 'create';
            next();
        });
    });
};

//TODO split this function to midddleware or async
exports.pay = function(req, res, next) {
    var subscription = req.subscription;
    subscription.plan = req.body.plan;

    subscription.populate('plan', function(err) {
        if (subscription.coupon && !req.coupon) {
            subscription.deleteCoupon = true; //if there is prev coupon we need to delete it before upgrading/downgrading
        }
        subscription.coupon = req.coupon || null;
        subscription.history.push(subscription[billingProvider]);
        subscription.changes.push({
            from: req.user.plan || config.defaultPlan,
            to: req.body.plan
        });
        billingSubscriptionController[req.action](subscription, req.user, function(err, data) {
            if (err) return res.status(500).send(err);
            if (subscription.coupon) couponsCtrl.updateUses(req.coupon, req.user);
            var confirmedText = billingProvider + '.confirmed';
            subscription[billingProvider] = data;
            subscription.status.pull('new');
            subscription.status.addToSet(confirmedText);
            subscription.company = req.company;
            subscription.save(function(err) {
                if (err) console.log('Subscription did not save in mongo');
                // TODO : save company owner data, not req.user !!!
                // saveUserData(subscription, req.user, function(err, doc) {
                //     if (err) return res.status(500).send(err);
                //     res.send({
                //         upsession: {
                //             key: 'user',
                //             value: doc
                //         },
                //         user: doc
                //     });
                // });
                saveUserData(subscription, req.company.owner._id, function(err, doc) {
                    if (err) return res.status(500).send(err);
                    res.send({
                        upsession: {
                            key: 'user',
                            value: doc
                        },
                        user: doc
                    });
                });
            });
        });
    });
};