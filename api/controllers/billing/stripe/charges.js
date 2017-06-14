'use strict';

var stripe = require('../../../providers/stripe');

exports.list = function(options, cb) {

    stripe.client.charges.list(options, function(err, charges) {
        if (err) return cb(err);
        cb(null, charges);
    });
};