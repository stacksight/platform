'use strict';

var request = require('request');
var config = require('meanio').loadConfig();

exports.availability = function(req, res) {

    request(config.uptimeHost + '/api/checks/' + req.params.check + '/events', function(error, response, body) {
        if (!error && response.statusCode < 400) {
            res.send(body);
        } else {
            res.send(500, error);
        }
    });

};
