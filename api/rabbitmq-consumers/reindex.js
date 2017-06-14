'use strict';

var elastic = require('../controllers/elastic'),
    config = require(process.cwd() + '/config'),
    appsunIndexes = config.appsunIndexes,
    mongoose = require('mongoose'),
    producer = require('../producers');


module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage, qData.noAck);
};

function handleMessage(message, error, done) {
    message.query = {
        created: {
            $lte: new Date(1494506051000)
        }
    };
    var bulkArr = [];
    find(message, function(err, docs) {
        if (err) return console.log('===== REINDEX ERR ================', err);
        docs.forEach(function(doc) {
            doc.etype = message.params.type || doc.etype || doc.type;
            doc.index = message.params.index || doc.index;
            if (!doc.etype || !doc.index) return console.log('ETYPE OR INDEX IS MISSING');
            // if (doc.index.indexOf('user') > -1 && message.params.renameIndex && doc.index.indexOf(message.params.renameIndex) === -1)
            //     doc.index = doc.index + '-' + message.params.renameIndex;

            // if (doc.etype === 'extension') doc.nameNversion = doc.label + ' ' + doc.version;
            
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
        var data = {
            arr: bulkArr,
            collection: message.collection,
            from: message.offset
        }
        elastic.bulk2(data).then(function(err) {
            if (err) return error(err);
            done();
        });
    });

};


function find(options, callback) {
    mongoose.connection.db.collection(options.collection, function(err, collection) {
        collection.find(options.query).skip(options.offset).limit(options.limit).toArray(callback);
    });
}
