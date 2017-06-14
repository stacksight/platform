'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Stacks = new Module('stacks');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Stacks.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Stacks.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users

    Stacks.aggregateAsset('css', 'stacks.css');
    Stacks.aggregateAsset('css', 'apps.css');
    Stacks.aggregateAsset('css', 'logs.css');
    Stacks.aggregateAsset('css', 'events.css');
    Stacks.aggregateAsset('css', 'general.css');
    Stacks.aggregateAsset('css', 'sessions.css');
    Stacks.aggregateAsset('css', 'updates.css');
    Stacks.aggregateAsset('css', 'custom.css');
    Stacks.aggregateAsset('css', 'settings.css');
    Stacks.aggregateAsset('css', 'integrations.css');
    Stacks.aggregateAsset('css', 'health.css');
    Stacks.aggregateAsset('css', 'availability.css');

    Stacks.aggregateAsset('js', '../lib/d3/d3.min.js', {
        group: 'header'
    });


    Stacks.aggregateAsset('js', '../lib/underscore/underscore.js');
    Stacks.aggregateAsset('js', '../lib/d3pie/d3pie/d3pie.js');

    Stacks.aggregateAsset('js', '../lib/angular-filter/dist/angular-filter.js');
    Stacks.aggregateAsset('js', '../lib/ngInfiniteScroll/build/ng-infinite-scroll.js');
    Stacks.aggregateAsset('js', '../js/jquery-viewport/jquery.viewport.js');
    
    Stacks.aggregateAsset('css', 'indicator.css');

    Stacks.aggregateAsset('js', '../lib/angular-ui-select/dist/select.min.js');
    Stacks.aggregateAsset('css', '../lib/angular-ui-select/dist/select.min.css');
    Stacks.aggregateAsset('css', '../lib/select2/select2.css');

    Stacks.angularDependencies(['indicator', 'ui.select', 'ngSanitize', 'angular.filter', 'angular-clipboard', 'infinite-scroll']);

    /**
      //Uncomment to use. Requires meanio@0.3.7 or above
      // Save settings with callback
      // Use this for saving data from administration pages
      Stacks.settings({
          'someSetting': 'some value'
      }, function(err, settings) {
          //you now have the settings object
      });

      // Another save settings example this time with no callback
      // This writes over the last settings.
      Stacks.settings({
          'anotherSettings': 'some value'
      });

      // Get settings. Retrieves latest saved settigns
      Stacks.settings(function(err, settings) {
          //you now have the settings object
      });
      */

    return Stacks;
});
