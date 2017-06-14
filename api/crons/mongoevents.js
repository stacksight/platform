'use strict';

var producer = require('../producers');
var Elastic = require('../providers/elastic')();

module.exports = function(message) {
    var limit = 200;
    var index = 'user-*,events*',
        type = 'event';

    var options = {
        index: index,
        type: type,
        from: 0,
        size: 0,
        body: {
            query: {
                filtered: {
                    query: {
                        match_all: {}
                    }
                }
            }
        }
    };

    Elastic.search(options, function(error, response) {
        var count = response.hits.total;
        console.log(count);
        for (var i = 0; i < count; i += limit) {
            var data = {
                offset: i,
                limit: limit
            };
            producer.createJob('mongoevents-sts', data);
        };
    });
};
