'use strict';

var sapi = require('../controllers/sapi');

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Sapi, app, auth, database) {

    app.route('/sapi/*')
        .put(auth.requiresLogin, auth.requiresToken, sapi.put);

    app.route('/sapi/*')
        .post(auth.requiresLogin, auth.requiresToken, sapi.post);

    app.route('/sapi/*')
        .get(auth.requiresLogin, auth.requiresToken, sapi.get);

    app.route('/sapi/*')
        .delete(auth.requiresLogin, auth.requiresToken, sapi.delete);

    app.route('/app/:id')
        .get(auth.requiresLogin, auth.requiresToken, sapi.get);

    app.route('/appsun/aggs/:name/:id/:index/:type?')
        .get(auth.requiresLogin, auth.requiresToken, sapi.get);

    app.route('/appsun/search/:id/:index/:type?')
        .get(auth.requiresLogin, auth.requiresToken, sapi.get);

    app.route('/appsun/:name/:index/:type?')
        .get(auth.requiresLogin, auth.requiresToken, sapi.get);
};
