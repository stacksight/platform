'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    producer = require('../producers');


var limits = {
    appupdates: 200,
    apphealth: 50,
    appextensions: 300,
    appevents: 500,
    applogs: 500,
    appinventory: 100
};

limits['appintegrations-platform'] = 200;
limits['appintegrations-bitbucket'] = 200;
limits['appintegrations-github'] = 200;
limits['appintegrations-gitlab'] = 200;


module.exports = function (message, error, done) {

    var data = {},
        collection = message.params.collection,
        limit = limits[collection] || 200;


    mongoose.connection.db.collection(collection, function (err, collection) {
        if (err) {
            (error || Function)(err);
            return console.error('REINDEX CONSUMER ERR', err);
        }
        collection.count({}, function (err, count) {
            if (err) {
                (error || Function)(err);
                return console.error('================ REINDEX ERR ==========', err);
            }
            for (var i = 0; i < count; i += limit) {
                data = {
                    offset: i,
                    limit: ((count - i) >= limit) ? limit : count - i,
                    collection: message.params.collection,
                    params: message.params
                };
                console.log('REINDEX CREATE SEARCH MONGO JOB ', message.params.collection, data.offset, data.limit);
                producer.createJob('reindex-1-sts', data);
            };
            (done || Function)();
        });
    });
};