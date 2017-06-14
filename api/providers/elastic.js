'use strict';
var config = require(process.cwd() + '/config');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: config.elastic.host + ':' + config.elastic.port,
    requestTimeout: 300000/*,
    log: 'trace'*/
});


module.exports = function() {
	return client;
};