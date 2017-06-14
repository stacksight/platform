'use strict';

/*
 * Defining the Package
 */
var meanio = require('meanio'),
    Module = meanio.Module,
    favicon = require('serve-favicon'),
    config = meanio.loadConfig();

var SystemPackage = new Module('system');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
SystemPackage.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    SystemPackage.routes(app, auth, database);

    SystemPackage.aggregateAsset('css', 'common.css');
    SystemPackage.angularDependencies(['ui.router', 'mean-factory-interceptor', 'ngMessages', 'oitozero.ngSweetAlert', 'angularMoment']);

    // The middleware in config/express will run before this code

    // Set views path, template engine and default layout
    app.set('views', __dirname + '/server/views');


    // Setting the favicon and static folder
    app.use(favicon(__dirname + '/public/assets/img/favicon.png'));

    // Adding robots and humans txt
    app.useStatic(__dirname + '/public/assets/static');

    if (config.stacksight) {
        var stacksight = require('stacksight')({
            apiKey: config.stacksight.token,
            appId: config.stacksight.appId,
            features: {
                logs: false,
                updates: false,
                sessions: false,
                requests: false
            }
        });
        app.stacksight = stacksight;
    } else console.log('error retrieving stacksight settings, update config file');

    return SystemPackage;
});