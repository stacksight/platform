'use strict';

require('../models/notification');

var mongoose = require('mongoose'),
    Notification = mongoose.model('Notification');



exports.find = function(req, res, next) {
    Notification.find({
        to: req.user.email
    }).exec(function(err, notifications) {
        if (err) return res.status(500).send(err);
        res.send(notifications);
    });
};