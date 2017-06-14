'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Stack = new Module('stack');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Stack.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Stack.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Stack.menus.add({
    title: 'stack example page',
    link: 'stack example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Stack.aggregateAsset('css', 'stack.css');
  Stack.aggregateAsset('css', 'dashboard.css');
  Stack.aggregateAsset('css', 'general.css');
  Stack.aggregateAsset('css', 'people.css');


  Stack.aggregateAsset('css', '../lib/angularjs-slider/dist/rzslider.min.css');
  Stack.aggregateAsset('js', '../lib/angularjs-slider/dist/rzslider.min.js');

  Stack.aggregateAsset('js', '../lib/angular-local-storage/dist/angular-local-storage.js');

  Stack.aggregateAsset('js', '../lib/angular-smart-table/dist/smart-table.js');

  Stack.aggregateAsset('js', '../lib/Chart.js/Chart.js', {
    group: 'header'
  });

  Stack.aggregateAsset('js', '../lib/underscore/underscore.js');
  Stack.aggregateAsset('js', '../lib/d3pie/d3pie/d3pie.js');

  Stack.aggregateAsset('js', '../lib/angular-filter/dist/angular-filter.js');
  Stack.aggregateAsset('js', '../lib/ngInfiniteScroll/build/ng-infinite-scroll.js');
  Stack.aggregateAsset('js', '../js/jquery-viewport/jquery.viewport.js');

  Stack.aggregateAsset('css', 'indicator.css');

  Stack.aggregateAsset('js', '../lib/angular-ui-select/dist/select.min.js');
  Stack.aggregateAsset('css', '../lib/angular-ui-select/dist/select.min.css');
  Stack.aggregateAsset('css', '../lib/select2/select2.css');

  Stack.angularDependencies(['angucomplete-alt', 'angularMoment', 'rzModule', 'chart.js', 'LocalStorageModule', 'smart-table']);

  //'daterangepicker', 'indicator', 'ui.select', 'ngSanitize', 'angular.filter', 'angular-clipboard', 'infinite-scroll'

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Stack.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Stack.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Stack.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Stack;
});
