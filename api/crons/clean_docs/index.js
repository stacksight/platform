var mongoose = require('mongoose'),
    config = require(process.cwd() + '/config'),
    collections = config.appsunIndexes,
    utils = require('../../services/utils'),
    savedDays = 2,
    exec = require('child_process').exec,
    models = require('../../models/appsun')(),
    users = require('../../controllers/users'),
    plansService = require('../../services/plans'),
    producer = require('../../producers');

collections.push('extensions');

function indexesNames(collection, between) {
    var indexes = between.map(function(date) {
        return collection + '-' + date
    });
    return indexes;
};


module.exports = function() {
    return {
        data: function(error, done) {
            (done || Function)();
            users._find({
                plan: {
                    $exists: true
                }
            }, function(err, users) {
                if (err) return (error || Function)();
                plansService.get(function(err, plans, defaultPlanId) {
                    //  delete generic indices of free plan
                    cleanGenericIndices(plans[defaultPlanId].features['data_retention'] || 60);
                    cleanGenericDocuments(plans[defaultPlanId].features['data_retention'] || 60);
                    users.forEach(function(user) {
                        var olderThan = plans[user.plan].features['data_retention'] || 60;
                        producer.createJob('delete-indices-sts', {
                            olderThan: olderThan + 1,
                            prefix: 'user-' + user.token
                        });
                    });
                });
            });
        }
    }
};

function cleanGenericIndices(days) {
    days = days + 1;
    for (var i in collections) {
        var cmdStr = "curator --host " + config.elastic.host + " --port " + config.elastic.port + " delete indices --time-unit days --older-than " + days + " --timestring '%Y-%m-%d' --prefix " + collections[i] + "*";
        exec(cmdStr, puts);
    }

    function puts(error, stdout, stderr) {
        console.log('=========== CLEAR ELASTIC ERR ==============');
        console[(error) ? 'error' : 'log']('CLEAR ELASTIC ERR', error);
        console.log('=========== CLEAR ELASTIC STDOUT ==============');
        console.log(stdout);
        console.log('=========== CLEAR ELASTIC STDERR ==============');
        console.log(stderr);
    }

    console.log('START DELETING ELASTIC DOCS...');
}

function cleanGenericDocuments(days) {
    var d = new Date(),
        startDt = d.setDate(d.getDate() - days),
        endDt = new Date(),
        between = utils.betweenDates(startDt, endDt);

    for (var i in collections) {
        var indexes = indexesNames(collections[i], between);
        cleanMongo(collections[i], indexes);
    }

    console.log(' ================= START DELETING MONGO DOCS... ========================');
}

function cleanMongo(collection, indexes) {
    console.log('========= START DELETING ' + collection + ' EXCEPT FROM ' + indexes);
    var Model = models.get(collection);
    Model.remove({
        $and: [{
            index: {
                $nin: indexes
            }
        }, {
            index: {
                $not: /^user-/
            }
        }]
    }).exec(function(err, status) {
        if (err) {
            return console.error('=========== CLEANING MONGO DOCS ERROR ==================', err);
        }
        console.log('=========== DELETING ' + collection + ' SUCCESS  (' + status + ') ==================');
    });
}