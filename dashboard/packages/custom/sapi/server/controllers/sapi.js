'use strict';
/*jshint unused:false*/


/**
 * Module dependencies.
 */
var request = require('request'),
    mean = require('meanio'),
    querystring = require('querystring'),
    config = mean.loadConfig();

var talkToApi = exports.talkToApi = function(options, callback) {
    var objReq = {
        uri: config.meanApi.uri + options.cmd_api,
        method: options.method,
        headers: {
            'authorization': options.token
        }
    };

    if (options.form) {
        objReq.form = options.form;
        objReq.headers['Content-Type'] = 'multipart/form-data';
    }

    request(objReq, function(error, response, body) {
        if (!error && response.statusCode === 200 && response.body.length) {
            try {
                return callback(null, JSON.parse(body));
            } catch(e) {
                return callback(null, body);
            }
        }
        return callback(error ? error : body, response);
    });
}

exports.post = function(req, res) {

    var cmd_api = req.originalUrl.split('/sapi')[1];

    var options = {
        cmd_api: cmd_api,
        token: req.token,
        method: 'POST',
        form: req.body
    };

    talkToApi(options, function(err, data) {
        if (err)
            return res.status((data) ? (data.statusCode || 500) : 500).json(err);

        if (!data.upsession) return res.jsonp(data);

        saveSession(req, data.upsession.key, data.upsession.value, function(err) {
            if (err) return res.status(500).json({
                error: 'Session update failed, please login again..'
            });
            res.jsonp(data);
        });
    });
};

exports.put = function(req, res) {

    var cmd_api = req.originalUrl.split('/sapi')[1];

    var options = {
        cmd_api: cmd_api,
        token: req.token,
        method: 'PUT',
        form: req.body
    };

    talkToApi(options, function(err, data) {
        if (err)
            return res.status((data) ? (data.statusCode || 500) : 500).json(err);

        if (!data.upsession) return res.jsonp(data);

        saveSession(req, data.upsession.key, data.upsession.value, function(err) {
            if (err) return res.status(500).json({
                error: 'Session update failed, please login again..'
            });
            res.jsonp(data);
        });
    });
};

exports.get = function(req, res) {

    if (req.originalUrl.indexOf('/sapi') > -1)
        req.originalUrl = req.originalUrl.split('/sapi')[1];

    var options = {
        cmd_api: req.originalUrl,
        token: req.token,
        method: 'GET'
    };

    talkToApi(options, function(err, data) {
        if (err)
            return res.status((data) ? (data.statusCode || 500) : 500).json({
                error: err.message || err || 'Something bad happened.... Try again please.'
            });

        res.jsonp(data);
    });
};

exports.delete = function(req, res) {

    if (req.originalUrl.indexOf('/sapi') > -1)
        req.originalUrl = req.originalUrl.split('/sapi')[1];

    var options = {
        cmd_api: req.originalUrl,
        token: req.token,
        method: 'DELETE'
    };

    talkToApi(options, function(err, data) {
        if (err)
            return res.status((data) ? (data.statusCode || 500) : 500).json({
                error: err.message || err || 'Something bad happened.... Try again please.'
            });

        res.jsonp(data);
    });
};

var saveSession = exports.saveSession = function(req, key, value, cb) {
    req.session.passport[key] = value;
    req.session.save(function(err) {
        if (err) return cb(err);
        cb(null);
    });
}