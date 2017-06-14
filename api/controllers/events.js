'use strict';

var stsEvents = require('../services/events'),
    producer = require('../producers');


stsEvents.on('index', function(index, doc) {
    doc = JSON.parse(JSON.stringify(doc));
    doc = doc['_doc'] || doc;
    if (!doc._id) return;
    var message = {
        internalIndex: true,
        index: index,
        type: index,
        id: doc._id.toString(),
        data: doc
    };
    delete doc._id;
    producer.createJob('index-sts', message);
});
