'use strict';

var mongoose = require('mongoose'),
    App = mongoose.model('App'),
    Elastic = require('../providers/elastic'),
    producer = require('../producers'),
    users = require('../controllers/users');

var minutes = 30; //every 30 minutes, app aggregation can be updated for not subscribers users.

module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {

    var query = {};
    if (message.id) query['_id'] = message.id;

    var populateQuery = [{
        path: 'stacks',
        select: 'check name'
    }, {
        path: 'author',
        select: 'token roles'
    }];

    App.find(query).skip(message.offset).limit(message.limit).populate(populateQuery).exec(function(err, apps) {
        if (err) {
            error(err);
            return console.error('APP AGGREGATION ERROR', err);
        }
        if (!apps) {
            done();
            return;
        }
        apps.forEach(function(app) {
            if (!app.author) return;


            var d;
            if (app.updatedDates && app.updatedDates.healthPoints)
                d = new Date(app.updatedDates.healthPoints.getTime() + minutes * 60 * 1000);

            if (!d || //no aggregation
                app.author.roles.indexOf('subscriber') > -1 ||
                d <= new Date()) { //for unsubsciber users.

                producer.createJob('app-aggregation-sts', {
                    groupId: app._id,
                    stacks: app.stacks,
                    author: app.author,
                    index: users.indexName(app.author)
                });
            }
        });
        done();
    });
};
