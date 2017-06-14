'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter

var stacks = require('../controllers/stacks');
module.exports = function(Stacks, app, auth, database) {

    app.route('/availability/:check').get(auth.requiresLogin, stacks.availability);
};
