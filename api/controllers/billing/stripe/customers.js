'use strict';

var stripe = require('../../../providers/stripe');

exports.create = function(token, user, cb) {
    stripe.client.customers.create({
        source: token.id,
        email: user.email,
        description: user.username
    }, function(err, customer) {
        if (err) return cb(err);
        cb(null, customer);
    });
};

exports.addCard = function(token, user, cb) {
    stripe.client.customers.createSource(
        user.profile.billing.stripe.id, { source: token },
        function(err, card) {
            if (err) return cb(err);
            update({default_source: card.id}, user, function(err, customer) {
                cb(err, customer);
            });
        }
    );
};

var update = exports.update = function(data, user, cb) {
    stripe.client.customers.update(user.profile.billing.stripe.id, data, function(err, customer) {
        return cb(err, customer);
    });
};