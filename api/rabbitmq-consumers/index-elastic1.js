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
    observersOn = ['updates'],
    opplog = require('../services/opplog');

var q = require('../providers/busmq').get('index-sts');
q.consume({
    reliable: true
});

// q.flush();
q.on('message', function(message, id) {
    console.time('index-doc');
    message = JSON.parse(message);


    async.waterfall([
            //INTERNAL INDEX
            function(callback) {
                if (message.internalIndex || (message.data && message.data.internalIndex))
                    return callback('internal index');
                callback(null);
            },
            //USER AND INDEX NAME
            function(callback) {
                users.emailAndIndex(message, callback);
            },
            //CHECK CONFIGURATION POLICY FOR REAL TIME AND STACKS NUM
            function(user, callback) {
                if (!user) return callback('User ' + message.data.token + ' does not exist');
                cp.authorizeIndex(message, user, function(err) {
                    if (err) return callback(err);
                    callback(null, user);
                });
            },
            //CHECK APPID
            function(user, callback) {
                if (!user) return callback(null, {});
                if (message.data.appId) return callback(null, user);
                appIdCtrl.create(message, user, function(err, data) {
                    if (err) return callback(err);
                    message.data.appId = data.appId;
                    callback(null, user);
                });
            },
            //GEO LOCATION
            function(user, callback) {
                var ip = message.data.ip;
                if (!ip) return callback(null, user);
                var geo = geoip.lookup(ip);
                if (!geo) return callback(null, user);
                geo.location = geo.ll;
                message.data.geoip = geo;
                callback(null, user);
            },
            //APPSUN DEFAULT DATA
            function(user, callback) {
                appsun.defaultData(message, function() {
                    callback(null, user);
                });
            },
            //INVENTORY DATA
            function(user, callback) {
                if (message.type !== 'inventory') return callback(null, user);
                inventory.data(message, function() {
                    callback(null, user);
                });
            }
        ],
        function(err, results) {
            //CHECK WHERE TO ACK THE MESSAGE !!!!

            q.ack(id);
            // message.debug.steps.index = {};
            // message.debug.steps.index.waterfallErr = JSON.stringify(err);


            if (err && err !== 'internal index') {
                createOpplog(err, message.data);
                console.log('======= CONSUMER FUNCTIONS ERR ============', err);
                return;
            }

            if (results && results.email) {
                appsunMongo.create(message);
                createObserver(message, results);
            }

            if (message.data && message.data.internalIndex) delete message.data.internalIndex;

            elastic.create(message, function(err, response) {

                createOpplog(err, message);
                // if (!err) q.ack(id);
                console.timeEnd('index-doc');
                sockets = require('../providers/socket').sockets;
                if (err) return console.log('ELASTIC INDEX ERR:', err);
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

        });
});

function createObserver(message, user) {
    if (observersOn.indexOf(message.originalIndex) === -1) return;
    var data = JSON.parse(JSON.stringify(message)),
        qName = message.originalIndex + '-observer-sts';
    data.user = user;
    producer.createJob(qName, data);
}


function createOpplog(err, message) {
    opplog.create({
        appId: message.data.appId,
        email: message.data.email,
        token: message.data.token,
        debugId: message.data.debugId,
        err: JSON.stringify(err),
        src: 'create index',
        data: JSON.stringify(message.data)
    });
};
