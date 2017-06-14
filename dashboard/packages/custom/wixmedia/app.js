'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Wixmedia = new Module('wixmedia');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Wixmedia.register(function(app, auth, database) {
  Wixmedia.config.COLLECTIONS_API_URL = 'http://collections.wix.com/collections';
  Wixmedia.config.WIXMEDIA_BASE_URL = 'http://media.wixapps.net/';


  Wixmedia.aggregateAsset('js', '../lib/wixmedia/dist/wixmedia.js');
  Wixmedia.aggregateAsset('js', '../lib/angular-file-upload/angular-file-upload.js');
  Wixmedia.angularDependencies(['angularFileUpload']);

  //We enable routing. By default the Package Object is passed to the routes
  Wixmedia.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Wixmedia.menus.add({
    title: 'wixmedia example page',
    link: 'wixmedia example page',
    roles: [ 'authenticated'],
    menu: 'main'
  });


  Wixmedia.aggregateAsset('css', 'wixmedia.css');
  // Wixmedia.aggregateAsset('css', '../lib/fontawesome/css/font-awesome.min.css');

  return Wixmedia;
});
