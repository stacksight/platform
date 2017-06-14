'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Sapi = new Module('sapi');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Sapi.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Sapi.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  //Sapi.menus.add({
  //  title: 'sapi example page',
  //  link: 'sapi example page',
  //  roles: ['authenticated'],
  //  menu: 'main'
  //});
  
  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Sapi.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Sapi.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Sapi.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Sapi;
});
