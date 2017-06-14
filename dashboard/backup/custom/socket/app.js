'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var MeanSocket = new Module('socket');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
MeanSocket.register(function(app, auth, database, http) {
	return MeanSocket;
});
