'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var SbAdmin = new Module('sb-admin');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
SbAdmin.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    SbAdmin.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
    SbAdmin.menus.add({
        title: 'sbAdmin example page',
        link: 'sbAdmin example page',
        roles: ['authenticated'],
        menu: 'main'
    });

    SbAdmin.aggregateAsset('css', 'main.css');
    SbAdmin.aggregateAsset('css', 'sbAdmin.css');
    SbAdmin.aggregateAsset('css', 'timeline.css');

    SbAdmin.aggregateAsset('js', 'sb-admin-2.js');

    SbAdmin.angularDependencies(['sbAdminApp', 'chart.js']);
    /**
      //Uncomment to use. Requires meanio@0.3.7 or above
      // Save settings with callback
      // Use this for saving data from administration pages
      SbAdmin.settings({
          'someSetting': 'some value'
      }, function(err, settings) {
          //you now have the settings object
      });

      // Another save settings example this time with no callback
      // This writes over the last settings.
      SbAdmin.settings({
          'anotherSettings': 'some value'
      });

      // Get settings. Retrieves latest saved settigns
      SbAdmin.settings(function(err, settings) {
          //you now have the settings object
      });
      */

    return SbAdmin;
});
