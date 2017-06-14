'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Oauth = new Module('oauth');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Oauth.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Oauth.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  //Oauth.menus.add({
  //  title: 'oauth example page',
  //  link: 'oauth example page',
  //  roles: ['authenticated'],
  //  menu: 'main'
  //});
  
  Oauth.aggregateAsset('css', 'oauth.css');
  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Oauth.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Oauth.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Oauth.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Oauth;
});
