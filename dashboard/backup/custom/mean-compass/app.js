'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var MeanCompass = new Module('mean-compass');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
MeanCompass.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    MeanCompass.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
    // MeanCompass.menus.add({
    //     title: 'meanCompass example page',
    //     link: 'meanCompass example page',
    //     roles: ['authenticated'],
    //     menu: 'main'
    // });

    MeanCompass.aggregateAsset('css','general.css');

    /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    MeanCompass.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    MeanCompass.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    MeanCompass.settings(function(err, settings) {
        //you now have the settings object
    });
    */

    return MeanCompass;
});
