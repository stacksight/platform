var config = require(process.cwd() + '/config'),
    elastic = require('../controllers/elastic'),
    cp = require('../controllers/configuration-policy'),
    appsunMongo = require('../controllers/appsun-mongo'),
    appsun = require('../controllers/appsun'),
    async = require('async'),
    geoip = require('geoip-lite'),
    users = require('../controllers/users'),
    appIdCtrl = require('../controllers/app-id'),
    producer = require('../producers'),
    inventory = require('../controllers/inventory'),
    observersOn = ['updates', 'events', 'logs', 'integrations-platform', 'health'];

module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {
    
    delete message.internalIndex;
    if (message.data && message.data.internalIndex) delete message.data.internalIndex;

    console.time('index-doc');
    elastic.create(message, function(err, response) {
        console.timeEnd('index-doc');
        sockets = require('../providers/socket').sockets;
        if (err) {
            console.error('ELASTIC INDEX ERR:', err);
            return error();
        }
        done();
        if (message.data && message.data.token && sockets[message.data.token]) {
            //here we need to check the realtime feature
            console.log('LOG ADDED EMIT', message.data.token);
            for (var index in sockets[message.data.token])
                sockets[message.data.token][index].emit('log added', {
                    _index: response._index,
                    _type: response._type,
                    _source: message.data,
                    _id: response._id
                });
        }
    });
}