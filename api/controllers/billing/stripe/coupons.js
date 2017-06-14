'use strict';

var stripe = require('../../../providers/stripe');

exports.create = function(coupon, cb) {

    stripe.client.coupons.create({
        percent_off: coupon.percentOff,
        duration: coupon.duration,
        id: coupon.id
    }, function(err, coupon) {
        if (err) return cb(err);
        cb(null, coupon);
    });
};
