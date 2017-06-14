'use strict';

// $viewPathProvider, to allow overriding system default views
angular.module('mean.system').provider('$viewPath', function() {
  function ViewPathProvider() {
    var overrides = {};

    this.path = function(path) {
      return function() {
        return overrides[path] || path;
      };
    };

    this.override = function(defaultPath, newPath) {
      if (overrides[defaultPath]) {
        throw new Error('View already has an override: ' + defaultPath);
      }
      overrides[defaultPath] = newPath;
      return this;
    };

    this.$get = function() {
      return this;
    };
  }

  return new ViewPathProvider();
});

// $meanStateProvider, provider to wire up $viewPathProvider to $stateProvider
angular.module('mean.system').provider('$meanState', ['$stateProvider', '$viewPathProvider', function($stateProvider, $viewPathProvider) {
  function MeanStateProvider() {
    this.state = function(stateName, data) {
      if (data.templateUrl) {
        data.templateUrl = $viewPathProvider.path(data.templateUrl);
      }
      $stateProvider.state(stateName, data);
      return this; 
    };

    this.$get = function() {
      return this;
    };
  }

  return new MeanStateProvider();
}]);

//Setting up route
angular.module('mean.system').config(['$meanStateProvider', '$urlRouterProvider',
  function($meanStateProvider, $urlRouterProvider) {
    // For unmatched routes:
    $urlRouterProvider.otherwise('/');

    var checkLoggedOut = function($q, $timeout, $http, $state, Companies) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Authenticated
        if (user !== '0') {
          $timeout(deferred.reject);
          // $state.go('company.main.dashboard', {companyId: Companies.my(user.companies).id});
          $state.go('company.main.dashboard', {companyId: 'all'});
        }

        // Not Authenticated
         // else $timeout(deferred.resolve);
        else {
          var http = location.protocol;
          var slashes = http.concat("//");
          var host = slashes.concat(window.location.hostname);
          if(location.port){
            host = host.concat(':'+location.port);
          }
          document.location.href = host+'/#!/auth/login';
        }
      });

      return deferred.promise;
    };

    // states for my app
    $meanStateProvider
      .state('home', {
        url: '/',
        templateUrl: 'system/views/index.html',
        resolve: {
          loggedin: checkLoggedOut
        }
      });
  }
]).config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
