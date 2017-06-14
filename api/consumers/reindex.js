'use strict';

var q = require('../providers/busmq').get('reindex-sts'),
    elastic = require('../controllers/elastic'),
    config = require(process.cwd() + '/config'),
    appsunIndexes = config.appsunIndexes,
    mongoose = require('mongoose');

q.consume();

q.on('message', function(message) {
    message = JSON.parse(message);
    q.stop();
    message.query = {};
    var bulkArr = [];
    find(message, function(err, docs) {
        if (err) return console.log('===== REINDEX ERR ================', err);
        docs.forEach(function(doc) {
            doc.etype = message.params.type || doc.etype || doc.type;
            doc.index = message.params.index || doc.index;
            if (!doc.etype || !doc.index) return console.log('ETYPE OR INDEX IS MISSING');
                        
            bulkArr.push({
                index: {
                    _index: doc.index,
                    _type: doc.etype,
                    _id: doc.calculatedId || doc._id
                }
            });
            delete doc.eType;
            delete doc._id;
            bulkArr.push(doc);
        });
        console.log('SEND TO BULK: ' + message.collection  + ' FROM- ' + message.offset + ' LIMIT- ' + message.limit);
        elastic.bulk2(bulkArr);
    });

});


function find(options, callback) {
    mongoose.connection.db.collection(options.collection, function(err, collection) {
        collection.find(options.query).skip(options.offset).limit(options.limit).toArray(callback);
    });
}
