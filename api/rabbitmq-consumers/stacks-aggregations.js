'use strict';

var mongoose = require('mongoose'),
    Stack = mongoose.model('Stack'),
    Elastic = require('../providers/elastic'),
    producer = require('../producers'),
    users = require('../controllers/users');

var q = require('../providers/busmq').get('stacks-aggregations-sts');
q.consume();

var minutes = 30; //every 30 minutes, app aggregation can be updated for not subscribers users.

q.on('message', function(message) {

    message = JSON.parse(message);

    var query = {};
    if (message.id) query['_id'] = message.id;

    // var populateQuery = [{
    //     path: 'stacks',
    //     select: 'check name'
    // }, {
    //     path: 'author',
    //     select: 'token roles'
    // }];

    Stack.find(query).skip(message.offset).limit(message.limit).exec(function(err, stacks) {
            if (!stacks) return;
            stacks.forEach(function(stack) {

                    // var d;
                    // if (app.updatedDates && app.updatedDates.healthPoints)
                    //     d = new Date(app.updatedDates.healthPoints.getTime() + minutes * 60 * 1000);

                    // if (!d || //no aggregation
                    //     app.author.roles.indexOf('subscriber') > -1 ||
                    //     d <= new Date()) { //for unsubsciber users.

                    producer.createJob('stack-aggregation-sts', {
                        stackId: stack._id,
                        index: users.indexName(stack.author)
                    });
                }
            });
    });
});
