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
  Stacks.menus.add({
    title: 'stacks example page',
    link: 'stacks example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Stacks.aggregateAsset('css', 'dashboard.css');
  Stacks.aggregateAsset('css', 'people.css');
  Stacks.aggregateAsset('css', 'inventory.css');
  Stacks.aggregateAsset('css', 'modal.css');

  Stacks.aggregateAsset('css', '../lib/angularjs-slider/dist/rzslider.css');
  Stacks.aggregateAsset('js', '../lib/angularjs-slider/dist/rzslider.js');

  Stacks.aggregateAsset('js', '../lib/angular-local-storage/dist/angular-local-storage.js');

  Stacks.aggregateAsset('js', '../lib/angular-smart-table/dist/smart-table.js');

  Stacks.aggregateAsset('js', '../lib/underscore/underscore.js');

  Stacks.aggregateAsset('js', '../lib/Chart.js/Chart.js', {
    group: 'header'
  });

  Stacks.aggregateAsset('js', '../lib/angular-filter/dist/angular-filter.js');
  Stacks.aggregateAsset('js', '../lib/ngInfiniteScroll/build/ng-infinite-scroll.js');

  // Stacks.angularDependencies(['angularMoment', 'rzModule', 'chart.js', 'LocalStorageModule', 'smart-table', 'daterangepicker']);
  Stacks.angularDependencies(['LocalStorageModule', 'ngSanitize', 'infinite-scroll', 'mean.general']);

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
