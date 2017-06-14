'use strict';
var config = require(process.cwd() + '/config');
var elasticsearch = require('elasticsearch');

var client2 = new elasticsearch.Client({
    host: 'search-stacksight-d22jeybp4j64nloggodwyqnfry.eu-west-1.es.amazonaws.com:80',
    requestTimeout: 300000/*,
    log: 'trace'*/
});


module.exports = function() {
	return client2;
};