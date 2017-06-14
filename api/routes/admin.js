'use strict';

var express = require('express'),
    router = express.Router(),
    users = require('../controllers/users'),
    admin = require('../controllers/admin/admin'),
    plans = require('../controllers/billing/plans'),
    features = require('../controllers/features'),
    coupons = require('../controllers/billing/coupons'),
    customers = require('../controllers/billing/customers'),
    subscriptions = require('../controllers/billing/subscriptions');
// var entities = require('../providers/crud').entities;


router.use(users.authorize, users.isAdmin);
router.get('/users', users.find);
router.get('/user/:uid', users.findById);
router.get('/counts', admin.counts);
router.get('/userApps', admin.userApps);
router.get('/elastic/users', admin.users);
router.get('/elastic/stacks', admin.stacks);
router.get('/elastic/usersAndStacks', admin.usersAndStacks);
router.get('/elastic/stats', admin.stats);

router.route('/plans/:id?')
    .get(function(req, res, next) {
        if (req.params.id) return next();
        plans.findAll(req, res);
    }, plans.plan, plans.findOne)
    .put(plans.plan, plans.update)
    .post(plans.create)
    .delete(plans.delete);

router.route('/features/:id?')
    .get(function(req, res, next) {
        if (req.params.id) return next();
        features.find(req, res);
    }, features.feature, features.findOne)
    .put(features.feature, features.update)
    .post(features.create)
    .delete(features.feature, features.delete);

router.route('/subscriptions/:id?')
    .get(function(req, res) {
        if (req.params.id) return subscriptions.findOne(req, res);
        subscriptions.find(req, res);
    })/*.put(subscriptions.update)*/
    .post(subscriptions.adminCreate)
    /*.delete(subscriptions.delete)*/;

router.route('/coupons/:id?')
    .get(function(req, res) {
        if (req.params.id) return coupons.findOne(req, res);
        coupons.findAll(req, res);
    }).put(coupons.update)
    .post(coupons.create)
    .delete(coupons.delete);

router.route('/customers/:id?')
    .get(function(req, res) {
        if (req.params.id) return customers.findOne(req, res);
        customers.find(req, res);
    }).put(customers.update)
    .post(customers.create)
    .delete(customers.delete);





// router.route('/:entity(feature|contract)/:id?')
//     .post(function(req, res) {
//         entities[req.params.entity].create(req.body, function(err, data) {
//             if (err) return res.status(500).send(err);
//             res.json(data);
//         });
//     }).get(function(req, res) {
//         if (req.params.id) {
//             entities[req.params.entity].get({
//                 id: req.params.id
//             }, function(err, data) {
//                 if (err) return res.status(500).send(err);
//                 res.json(data);
//             });

//         } else {
//             entities[req.params.entity].all({}, function(err, data) {
//                 if (err) return res.status(500).send(err);
//                 res.json(data);
//             });
//         }
//     }).delete(function(req, res) {
//         entities[req.params.entity].delete({
//             id: req.params.id
//         }, function(err, data) {
//             if (err) return res.status(500).send(err);
//             res.json(data);
//         })
//     });

module.exports = router;
