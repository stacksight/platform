'use strict';

var q = require('../providers/busmq').get('mongoevents-sts'),
    elastic = require('../controllers/elastic'),
    appsunMongo = require('../controllers/appsun-mongo'),
    Elastic = require('../providers/elastic')(),
    mongoose = require('mongoose');

q.consume();

q.on('message', function(message) {

    message = JSON.parse(message);
    var index = 'user*,events*',
        type = 'event',
        size = message.limit,
        from = message.offset;

    var options = {
        index: index,
        type: type,
        from: from || 0,
        size: size || 0,
        body: {
            query: {
                filtered: {
                    query: {
                        match_all: {}
                    },
                    filter: {
                        bool: {
                            must: [{
                                    range: {
                                        created: {
                                            gte: '1440882027923'
                                        }
                                    }
                                }

                            ]
                        }

                    }
                }
            }
        }
    };
    Elastic.search(options, function(error, response) {
        console.log('ELASTIC SEARCH ERROR: ', error);

        if (error) return console.log('ERRORRRR =============== !!', error);

        if (response.hits && response.hits.hits) {
            response.hits.hits.forEach(function(hit) {
                var data = {
                    data: hit._source,
                    index: hit._index,
                    originalIndex: 'test',
                    type: 'event'
                };
                appsunMongo.create(data);

            });
        }
    });

});
