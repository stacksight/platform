'use strict';

var elastic = require('./elastic'),
    _ = require('lodash'),
    integrationsTypes = require('../integrations/main/data/integrations-types'),
    dataTypes = Object.keys(require('../integrations/main/data/data-types')),
    fs = require('fs'),
    // classesFiles = fs.readdirSync(process.cwd() + '/integrations/webhooks/classes'),
    classes = {};

init();

function init() {
    for (var index in integrationsTypes) {
        classes[index] = {};
        var classesFiles = fs.readdirSync(process.cwd() + '/integrations/' + integrationsTypes[index].folder + '/classes');
        classesFiles.forEach(function(file) {
            var path = '../integrations/' + integrationsTypes[index].folder +'/classes/' + file;
            classes[index][file.split('.js')[0]] = require(path);
        });
    }
}

var prepareData = {
    backups: function(req, data) {
        elastic._index('health', 'health', data);
    },
    platform: function(req, data) {
        data.project = data.data.project;
        data.environment = (data.data.payload.environment) ? data.data.payload.environment.name : data.data.parameters.environment;
        if (!data.project || !data.environment) return console.error('Platform - data is missing to recognize stack');
        elastic._index('integrations-platform', 'integrations-platform', data);

    },
    bitbucket: function(req, data) {
        data.data.eventKey = req.headers['x-event-key'];
        elastic._index('integrations-bitbucket', 'integrations-bitbucket', data);
    }
};

exports.requiredParams = function(req, res, next) {
    req.service = req.params.service;
    var requiredParams = (req.service === 'platform') ? ['token'] : ['token', 'stackId'];

    for (var i in requiredParams)
        if (!req.query[requiredParams[i]]) return res.status(400).send(requiredParams[i] + ' param is missing');
    next();
};

exports.index = function(req, res) {

    var type = req.service;
    var data = {
        token: req.query.token,
        appId: req.query.stackId,
        group: req.query.group,
        data: req.body,
        integration: type
    };
    data.data.integration = type;

    if (prepareData[type]) {
        prepareData[type](req, data);
        return res.send('ok');
    }
    elastic._index('integrations-' + type, 'integrations-' + type, data);
    res.send('ok');
};

exports.start = function(req, res, next) {
    var type = req.params.type,
        service = req.params.service,
        className, integration, requiredParams,
        dataType = req.query.type,
        options = {};

    if (!integrationsTypes[type]) return res.status(400).send('Integration type ' + type + ' is not supported yet :(');
    if (!dataType || dataTypes.indexOf(dataType) === -1) return res.status(400).send((!dataType) ? 'Query param type is missing' : dataType + ' type is not supported yet');

    options.req = req;
    options.params = req.query;

    className = (classes[type][service]) ? service : type;
    integration = new classes[type][className](req.body, type, service, dataType, options);

    var response = integration.checkRequiredParams(options.params);
    if (!response.ok) return res.status(400).send(response.field + ' param is missing');

    res.send(200);
};