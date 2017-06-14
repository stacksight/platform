'use strict';

var mongoose = require('mongoose'),
    App = mongoose.model('App'),
    producer = require('../../producers');

module.exports = function(message, error, done) {

  if (message.params.id) {
      (done || Function)();
      return producer.createJob('apps-aggregations-sts', {id: message.params.id});
    }

    var limit = 20;
    var data = {};

    App.count({}, function(err, count) {
        if (err) {
            (error || Function)(err);
            return console.error('========== App.count.err =========', err);
        }

        for (var i = 0; i < count; i += limit) {

            data = {
                offset: i,
                limit: limit
            };

            producer.createJob('apps-aggregations-sts', data);

        }
        (done || Function)();
    });
};
