'use strict';

require('../../models/user');

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    config = require(process.cwd() + '/config'),
    billingProvider = config.billingProvider,
    billingCustomersController = require('./' + billingProvider + '/customers');

exports.create = function(req, res) {
    var token = req.body;
    billingCustomersController.create(token, req.user, function(err, customer) {
        if (err) {
            console.log('Stripe create customer err: ', err);
            return res.status(500).send(err);
        }
        updateCustomerData(req.user, customer, function(err, data) {
            if (err) return res.status(500).send(err);
            res.send(data);
        });
    });
};

function updateCustomerData(user, customer, cb) {
    var setPath = 'profile.billing.' + billingProvider;
    var setObj = {};
    setObj[setPath] = customer;

    User.findOneAndUpdate({
        _id: user._id
    }, { $set: setObj }, { new: true }).exec(function(err, _user) {
        if (err) return cb(err);
        cb(null, { upsession: { key: 'user', value: _user }, user: _user });
    });
}


exports.update = function(req, res) {
    var action = req.body.action;
    if (!req.body.action === 'addCard') return res.send('Function is not supported');
    var token = req.body.card.id;
    billingCustomersController.addCard(token, req.user, function(err, customer) {
        if (err) {
            console.log('Stripe create customer err: ', err);
            return res.status(500).send(err);
        }
        updateCustomerData(req.user, customer, function(err, data) {
            if (err) return res.status(500).send(err);
            res.send(data);
        });
    });
};

exports.authorize = function(req, res, next) {
    if (!req.user.profile.billing[billingProvider]) return res.status(500).send('User is not authorize in stripe');
    next();
};

exports.delete = function(req, res) {

};

exports.find = function(req, res) {

};

exports.findOne = function(req, res) {

};
