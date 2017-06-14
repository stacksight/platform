'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Apps = new Module('apps');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Apps.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Apps.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
    Apps.menus.add({
        title: 'apps example page',
        link: 'apps example page',
        roles: ['authenticated'],
        menu: 'main'
    });

    // Apps.aggregateAsset('css', 'apps.css');
    Apps.aggregateAsset('css', 'stacks.css');
    Apps.aggregateAsset('css', 'collaborators.css');
    Apps.aggregateAsset('css', 'inventory.css');

    Apps.aggregateAsset('css', '../lib/angularjs-slider/dist/rzslider.min.css');
    Apps.aggregateAsset('js', '../lib/angularjs-slider/dist/rzslider.min.js');

    Apps.aggregateAsset('js', '../lib/angular-local-storage/dist/angular-local-storage.js');

    Apps.aggregateAsset('js', '../lib/angular-smart-table/dist/smart-table.js');

    Apps.aggregateAsset('js', '../lib/Chart.js/Chart.js', {
        group: 'header'
    });
    Apps.angularDependencies(['angularMoment', 'rzModule', 'chart.js', 'LocalStorageModule', 'smart-table', 'daterangepicker']);
    //Apps.angularDependencies(['chart.js']);

    /**
      //Uncomment to use. Requires meanio@0.3.7 or above
      // Save settings with callback
      // Use this for saving data from administration pages
      Apps.settings({
          'someSetting': 'some value'
      }, function(err, settings) {
          //you now have the settings object
      });

      // Another save settings example this time with no callback
      // This writes over the last settings.
      Apps.settings({
          'anotherSettings': 'some value'
      });

      // Get settings. Retrieves latest saved settigns
      Apps.settings(function(err, settings) {
          //you now have the settings object
      });
      */

    return Apps;
});
