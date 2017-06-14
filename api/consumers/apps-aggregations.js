'use strict';

var mongoose = require('mongoose'),
    App = mongoose.model('App'),
    Elastic = require('../providers/elastic'),
    producer = require('../producers'),
    users = require('../controllers/users');

var q = require('../providers/busmq').get('apps-aggregations-sts');
q.consume();

var minutes = 30; //every 30 minutes, app aggregation can be updated for not subscribers users.

q.on('message', function(message) {

    message = JSON.parse(message);

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
        if (!apps) return;
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
    });
});
