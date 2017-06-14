'use strict';

/*
 * Defining the Package
 */

var Module = require('meanio').Module;

var Articles = new Module('articles');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Articles.register(function(app, auth, database, passport) {


  //We enable routing. By default the Package Object is passed to the routes
  // Articles.routes(app, auth, database);
    Articles.routes(app, auth, database, passport);


  Articles.aggregateAsset('css', 'articles.css');

  
  //We are adding a link to the main menu for all authenticated users
  Articles.menus.add({
    'roles': ['authenticated'],
    'title': 'Articles',
    'link': 'all articles'
  });
  Articles.menus.add({
    'roles': ['authenticated'],
    'title': 'Create New Article',
    'link': 'create article'
  });
	
  return Articles;
});
