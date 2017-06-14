'use strict';


var config = require(process.cwd() + '/config'),
    exec = require('child_process').exec,
    collections = config.appsunIndexes,
    utils = require('../services/utils'),
    models = require('../models/appsun')();

module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function indexesNames(prefix, collection, between) {
    var indexes = between.map(function(date) {
        return prefix + '-' + collection + '-' + date
    });
    return indexes;
};

function cleanMongo(prefix, collection, indexes) {
    console.log('========= START DELETING ' + collection + ' EXCEPT FROM ' + indexes);
    var Model = models.get(collection);
    Model.remove({
        $and: [{
            index: {
                $nin: indexes
            }
        }, {
            index: new RegExp('^' + prefix, 'gi')
        }]
    }).exec(function(err, status) {
        if (err) {
            return console.error('=========== CLEANING MONGO DOCS ERROR ==================', err);
        }
        console.log('=========== DELETING ' + collection + ' SUCCESS  (' + status + ') ==================');
    });
}


function handleMessage(message, error, done) {
    // done();

    //delete elastic data
    var cmdStr = "curator --host " + config.elastic.host + " --port " + config.elastic.port + " delete indices --time-unit days --older-than " + message.olderThan + " --timestring '%Y-%m-%d' --prefix " + message.prefix + "*";
    exec(cmdStr, puts);
    console.log('START DELETING ELASTIC DOCS...');

    //delete mongo data
    var d = new Date(),
        startDt = d.setDate(d.getDate() - message.olderThan),
        endDt = new Date(),
        between = utils.betweenDates(startDt, endDt);

    for (var i in collections) {
        var indexes = indexesNames(message.prefix, collections[i], between);
        cleanMongo(message.prefix, collections[i], indexes);
    }

    function puts(error, stdout, stderr) {
        done();
        console.log('=========== CLEAR ELASTIC ERR ==============');
        console[(error) ? 'error' : 'log']('CLEAR ELASTIC ERR', error);
        console.log('=========== CLEAR ELASTIC STDOUT ==============');
        console.log(stdout);
        console.log('=========== CLEAR ELASTIC STDERR ==============');
        console.log(stderr);
    }

};