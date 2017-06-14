'use strict';

var config = require(process.cwd() + '/config'),
    stripe = require('stripe'),
    _ = require('lodash'),
    client;


function createClient() {
    if (!config.stripe || !config.stripe.privateKey || !config.stripe.publicKey) {
        return console.log('error retrieving Stripe settings');
    }
    client = stripe(config.stripe.privateKey);
}

createClient();

exports.client = client;
