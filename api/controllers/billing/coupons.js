'use strict';

require('../../models/billing/coupon');

var mongoose = require('mongoose'),
    Coupon = mongoose.model('Coupon'),
    config = require(process.cwd() + '/config'),
    billingProvider = config.billingProvider,
    billingCouponsController = require('./' + billingProvider + '/coupons');


exports.create = function(req, res) {
    var coupon = new Coupon(req.body);
    coupon.save(function(err, doc) {
        if (err) return res.status(500).send(err);

        billingCouponsController.create(coupon, function(err, data) {
            if (err) return res.status(500).send(err);
            coupon[billingProvider] = data;
            coupon.save(function(err, doc) {
                if (err) {
                    console.log('Stripe coupon did not saved in db');
                    return res.status(500).send(err);
                }
                return res.send(doc);
            });
        })
    });
};


exports.update = function(req, res) {

};

exports.delete = function(req, res) {

};

exports.find = function(req, res) {};

exports.findAll = function(req, res) {
    Coupon.find({}).exec(function(err, coupons) {
        if (err) return res.status(500).send(err);
        res.send(coupons);
    });
};

exports.findOne = function(req, res) {
    res.send(req.coupon);
};

exports.hasPermissions = function(req, res, next) {
    if (req.skipCheckCoupon) return next();

    var token = req.body.token, // first checking
        planId = req.body.plan,
        coupon = req.body.coupon, // second checking
        query;

    if ((!token && !coupon) || !planId) return res.status(500).send('Require parameters are missing.');

    query = (token) ? { token: token } : { _id: coupon };
    Coupon.findOne(query).exec(function(err, coupon) {
        if (err || !coupon) return res.status(500).send(err || 'coupon does not exist');
        if (coupon.plan && (coupon.plan.toString() !== planId)) return res.status(401).send('Coupon ' + coupon.name + ' is not allowed for this plan!');
        if (coupon.totalNumberOfUses < coupon.uses.length + 1) return res.status(401).send('All ' + coupon.name + ' coupons are used');

        req.coupon = coupon;
        next();
    });
};

exports.updateUses = function(coupon, user) {
    coupon.uses.push(user);
    coupon.save(function(err, doc) {
        if (err) return console.log('COUPON UPDATE USES ERR: ', err);
        console.log('COUPON' + coupon.name + ' USES UPDATED');
    });
};