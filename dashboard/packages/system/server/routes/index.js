'use strict';

var mean = require('meanio');
var menus = require('../controllers/menus');
var sapi = require('../../../custom/sapi/server/controllers/sapi');

module.exports = function(System, app, auth, database) {

    // Home route
    var index = require('../controllers/index');
    app.route('/')
        .get(function(req, res, next) {
            next();

            // app.stacksight.event({
            //     action: 'entered',
            //     type: 'user',
            //     name: (req.user) ? req.user.name : null,
            //     icon: 'fa-user',
            //     icon_col: '#8C66B1'
            // });

            if (req.user) {
                var options = {
                    cmd_api: '/user',
                    token: req.user.profile.token,
                    method: 'PUT',
                    form: {
                        lastVisit: true
                    }
                };

                sapi.talkToApi(options, function(err, data) {
                    console.log('SET LAST VISIT DATE ERR:', err);
                });
            }

            if (req.user) {
                var options = {
                    cmd_api: '/user',
                    token: req.user.profile.token,
                    method: 'PUT',
                    form: {
                        lastVisit: Date.now()
                    }
                };

                sapi.talkToApi(options, function(err, data) {
                    console.log('SET LAST VISIT DATE ERR:', err);
                });
            }

        }, index.render);


    app.get('/*', function(req, res, next) {
        res.header('workerID', JSON.stringify(mean.options.workerid));
        next(); // http://expressjs.com/guide.html#passing-route control
    });
};