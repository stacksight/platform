'use strict';

var mongoose = require('mongoose'),
    Notification = mongoose.model('Notification'),
    notifyService = require('../services/notify'),
    User = mongoose.model('User'),
    producer = require('../producers'),
    config = require(process.cwd() + '/config');

module.exports = function (frequency, error, done) {

    done();

    // If we're NOT on production, only send mails to ourselves.
    var production = false;
    if (config.host == "https://api.stacksight.io") {
        production = true;
    }

    var query = User.find();
    if (!production) {
        query.where('email').equals('zohar@linnovate.net');
    }

    query.exec(function(err, users) {

        users.forEach(function (user) {
            var data = {
                isSent: false,
                frequency: frequency,
                email: user.email,
                uname: user.name
            };

            producer.createJob('user-notifications-sts', data);
        });
    });
};