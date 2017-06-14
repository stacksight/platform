'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var General = new Module('general');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
General.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  General.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  General.menus.add({
    title: 'general example page',
    link: 'general example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  General.aggregateAsset('css', 'general.css');
  General.aggregateAsset('css', 'events.css');
  General.aggregateAsset('css', 'inventory.css');
  General.aggregateAsset('css', 'people.css');

  General.aggregateAsset('js', '../lib/angular-gravatar/build/angular-gravatar.js');

  General.aggregateAsset('css', '../lib/intro.js/introjs.css');
  General.aggregateAsset('css', '../lib/intro.js/themes/introjs-flattener.css');
  General.aggregateAsset('js', '../lib/intro.js/intro.js');
  General.aggregateAsset('css', 'introjs-stacksight.css');

  General.angularDependencies(['ui.gravatar']);

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    General.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    General.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    General.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return General;
});
