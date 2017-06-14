'use strict';

var mongoose = require('mongoose'),
    Stack = mongoose.model('Stack'),
    producer = require('../producers'),
    urlpattern = /^https?:\/\//;
var Stack = mongoose.model('Stack');
var App = mongoose.model('App');
var Tag = mongoose.model('Tag');
var Company = mongoose.model('Company');
var User = mongoose.model('User');
var _ = require('lodash');

module.exports = function(message, error, done) {
    App.find({}).exec(function(err, apps) {
        if (err) return console.log(1, err);
        apps.forEach(function(app) {
            producer.createJob('collaborators-sts', app);
        });
        done();
    });
}