var mongoose = require('mongoose'),
    Elastic = require('../providers/elastic')(),
    Elastic2 = require('../providers/elastic2')(),
    producer = require('../producers/index'),
    config = require(process.cwd() + '/config'),
    appsunIndexes = config.appsunIndexes,
    appsunMongo = require('./appsun-mongo'),
    cp = require('./configuration-policy');

var create = exports.create = function (data, cb) {

    var options = {
        index: data.index,
        type: data.type,
        body: data.data
    };

    if (data.id) options.id = data.id;

    console.log('******** IN ELASTIC.CREATE ***********', options);

    Elastic.index(options, function (error, response) {
        console.log('----------- ELASTIC RESPONSE ---------------------');
        console[(error) ? 'error' : 'log']('ELASTIC CREATE ERROR: ' + error);
        console.log('response: ' + response);
        console.log('--------------------------------------------------');
        cb(error, response);
    });

};

exports.index = function (req, res) { // index through api

    console.log('incomingRequest', req.params.index, req.body.appId);

    console.log('===================== REQ.BODY ===================');
    console.log(req.body);
    console.log('===================== END OF REQ.BODY =============');
    // console.log('===================== REQ.HEADERS ===================');
    // console.log(req.headers);
    // console.log('===================== END OF REQ.HEADERS =============');

    var index = req.params.index,
        type = req.params.type;

    var data = {
        index: index,
        originalIndex: index,
        type: type,
        id: req.params.id || req.headers['x-stacksight-id'],
        data: req.body
    };

    //data.data.ip = req.headers['x-real-ip'];
    data.data.created = new Date().toISOString();
    data.data.debugId = res.req.id;

    producer.createJob('translation-sts', data);
    res.send('ok');
};

exports._index = function (index, type, _data) { // index through service

    var data = {
        index: index,
        originalIndex: index,
        type: type,
        data: _data
    };

    data.data.created = data.data.created || new Date().toISOString();

    producer.createJob('translation-sts', data);
};

exports.bulk = function (data, cb) {

    Elastic.bulk({
        body: data
    }, function (err, response) {
        console.log('----------- ELASTIC BULK RESPONSE ---------------------');
        console[(err) ? 'error' : 'log']('ELASTIC BULK RESPONSE ERROR: ' + err);
        console.log('response: ' + response);
        console.log('--------------------------------------------------');
        cb(err);
    });
};

exports.putSettings = function (params, cb) {
    Elastic.indices.putSettings(params, cb);
};

exports.getIndices = function (params, cb) {
    Elastic.cat.indices(params, cb);
};

exports.bulk2 = function (data, cb) {
    return new Promise(function (resolve, reject) {
        Elastic2.bulk({
            body: data.arr
        }, function (err, response) {
            console.log('----------- ELASTIC BULK RESPONSE ---------------------');
            console[(err) ? 'error' : 'log']('ELASTIC BULK RESPONSE ERROR: ' + err);
            console.log('response: ' + response);
            if (response && response.items && response.items[0].index) console.log(response.items[0].index._index);
            console.log('collection:', data.collection, 'from:', data.from);
            console.log('--------------------------------------------------');
            resolve(err);
        });
    });
};