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

function internalIndex(mainData) {
    var message = mainData.message;
    return new Promise(function(done, error) {
        if (message.internalIndex || (message.data && message.data.internalIndex))
            return error('internal index');
        done(mainData);
    });
}

function emailAndIndex(mainData) {
    var message = mainData.message;
    return new Promise(function(done, error) {
        users.emailAndIndex(message, function(err, user) {
            if (err) return error(err);
            console.log('orittestuseremailandindex', message.index, message.email);
            mainData.user = user;
            done(mainData);
        });
    });
    
}

function checkCP(mainData) {
    var message = mainData.message,
    user = mainData.user;
    return new Promise(function(done, error) {
        if (!user) return error('User ' + message.data.token + ' does not exist');
        cp.allowA('allowedIndexes', user, message.originalIndex, function(err) {
            if (err) return error(err);
            done(mainData);
        });
    });
}

function checkAppId(mainData) {
    var message = mainData.message,
    user = mainData.user;
    return new Promise(function(done, error) {
        appIdCtrl.create(message, user, function(err, data) {
            if (err) return error(err);
            message.data.appId = data.appId;
            done(mainData);
        });
    });
}

function locationByIp(mainData) {
    var message = mainData.message;
    return new Promise(function(done, error) {
        var ip = message.data.ip;
        if (!ip) return done(mainData);
        var geo = geoip.lookup(ip);
        if (!geo || !geo.ll) return done(mainData);
        // the array is reversed because of the causion:
        // https://www.elastic.co/guide/en/elasticsearch/guide/current/lat-lon-formats.html
        geo.location = geo.ll.reverse();
        message.data.geoip = geo;
        if (geo.location[1] < -90 || geo.location[1] > 90)
            delete message.data.geoip.location;
        done(mainData);
    });
}

function defaultData(mainData) {
    var message = mainData.message;
    return new Promise(function(done, error) {
        appsun.defaultData(message, function() {
            done(mainData);
        });
    });
}

function inventoryData(mainData) {
    var message = mainData.message,
    user = mainData.user;
    return new Promise(function(done, error) {
        if (message.type !== 'inventory') return done(mainData);
        inventory.data(message, user, function() {
            done(mainData);
        });
    });
}

function handleMessage(message, error, done) {
    var mainData = {};
    mainData.message = message;
    console.time('identify-doc');

    internalIndex(mainData)
    .then(emailAndIndex)
    .then(checkCP)
    .then(checkAppId)
    .then(locationByIp)
    .then(defaultData)
    .then(inventoryData)
    .then(function(results) {
        console.timeEnd('identify-doc');
        if (results.user && results.user.email) {
            appsunMongo.create(results.message);
            createObserver(results.message, results.user);
        }
        done();
        var _message = JSON.parse(JSON.stringify(results.message));
        producer.createJob('index-sts', _message);

    })
    .catch(function(reason) {
        console.timeEnd('identify-doc');
        console.error('======= CONSUMER FUNCTIONS ERR ============', reason);
        error();
    });
}


function createObserver(message, user) {
    if (observersOn.indexOf(message.originalIndex) === -1) return;
    var data = JSON.parse(JSON.stringify(message)),
    qName = message.originalIndex + '-observer-sts';
    data.user = user;
    producer.createJob(qName, data);
}