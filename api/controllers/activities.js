'use strict';

require('../models/activity');
var mongoose = require('mongoose'),
Activity = mongoose.model('Activity');

exports.register = function(objName, objVal, user, action, description) {
    var activity = new Activity({
        object: objName,
        id : objVal,
        action: action,
        user: user,
        description: description
    });
    activity.save(function(err) {
        if (err) return console.error('save activity err', err);
        console.log('Activity ' + description + ' has been successfully saved!');
    });
};