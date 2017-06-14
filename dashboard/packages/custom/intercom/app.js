'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Intercom = new Module('intercom');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Intercom.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Intercom.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Intercom.menus.add({
    title: 'intercom example page',
    link: 'intercom example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Intercom.aggregateAsset('css', 'intercom.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Intercom.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Intercom.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Intercom.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Intercom;
});
