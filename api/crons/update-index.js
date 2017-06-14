'use strict';

var mongoose = require('mongoose'),
    elastic = require('../controllers/elastic'),
    config = require(process.cwd() + '/config'),
    collections = config.appsunIndexes,
    savedDays = 2,
    exec = require('child_process').exec;

module.exports = function(message, error, done) {
    var indexes = [];
    // config.appsunIndexes.forEach(function(index) {
    //     indexes.push('*' + index + '*');
    // });

    // elastic.getIndices({
    //     index: indexes,
    //     h: 'index'
    // }, function(err, data) {
    //     if (err) return error(err);
    //     data = data.replace(/\s\s+/g, ' ');
    //     // data = data.replace(/(\r\n|\n|\r)/gm,"");
    //     data = data.replace('app-health', '');
    //     data = data.replace('stack-health', '');
    //     data = data.split(' ');

    //     // console.log(data, 'wwwwww');
    // });
    // for (var i in collections) {
    //     var cmdStr = "curator --host " + config.elastic.host + " --port " + config.elastic.port + " show indices --time-unit days --older-than " + savedDays + " --timestring '%Y-%m-%d'";
    //     exec(cmdStr, puts);
    // }
    var cmdStr = "curator --host " + config.elastic.host + " --port " + config.elastic.port + " show indices --time-unit days --older-than " + savedDays + " --timestring '%Y-%m-%d'";
    exec(cmdStr, puts);

    function puts(err, stdout, stderr) {

        if (err) return error();

        var indexes = stdout.split("Matching indices:");
        indexes = indexes[1].replace(/\s\s+/g, ' ');
        indexes = indexes.replace(/(\r\n|\n|\r)/gm, " ");
        indexes = indexes.split(" ");

        elastic.putSettings({
            index: indexes,
            body: {
                index: {
                    'blocks.read_only': true
                }
            }

        }, function(err, data) {
            if (err) {
                console.log('======= UPDATE INDEXES SETTINGS ================');
                console.error(err)
                console.log('======= UPDATE INDEXES SETTINGS ================');
                return error(err);
            }
            console.log('======== UPDATE INDEXES SETTINGS RESPONSE ===========', data);
            done();

        });
    }
};