'use strict';

var stripe = require('../../../providers/stripe');

exports.create = function(subscription, user, cb) {

    var obj = {
        plan: subscription.plan.stripe.id
    };
    if (subscription.coupon)
        obj.coupon = subscription.coupon.stripe.id;

    stripe.client.customers.createSubscription(user.profile.billing.stripe.id,
        obj,
        function(err, subscription) {
            if (err) return cb(err);
            cb(null, subscription);
        });
};

exports.update = function(subscription, user, cb) {

    var cust = user.profile.billing.stripe.id;
    var obj = {
        plan: subscription.plan.stripe.id
    };


    if (subscription.coupon)
        obj.coupon = subscription.coupon.stripe.id;

    // console.log('_________________', subscription.deleteCoupon);
    /*if (subscription.deleteCoupon) {
        stripe.client.customers.deleteDiscount(cust, function(err, confirmation) {
            if (err) return cb(err);
            update();
        });
    }
    else*/ update();

    function update() {
        stripe.client.customers.updateSubscription(
            cust,
            subscription.stripe.id, obj,
            function(err, subscription) {
                if (err) return cb(err);
                cb(null, subscription);
            }
        );
    }
}