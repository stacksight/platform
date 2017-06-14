'use strict';

angular.module('mean-factory-interceptor', [])
  .factory('httpInterceptor', ['$q', '$location', 'Global', '$injector',
    function($q, $location, Global, $injector) {
      return {
        'response': function(response) {
          if (response.status === 401) {
            $location.path('/auth/login');
            return $q.reject(response);
          }
          return response || $q.when(response);
        },
        'responseError': function(rejection) {
          if(Global.authenticated && Global.authenticated > 0){
            if(rejection.data){
              try{
                if (rejection.status === 401) {
                  var response = JSON.parse(rejection.data);
                  if(response.type == 'upgrade plan'){
                    var $uibModal = $injector.get('$uibModal');
                    $uibModal.open({
                      templateUrl: 'upgradePlan',
                      windowClass: 'zindexMax',
                      controller: 'UpgradeModalInstanceCtrl',
                    });
                  }
                  return $q.reject(rejection);
                }
              } catch(e){
                console.log('Exception during process 401:', e);
              }
            }
          } else{
            if (rejection.status === 401) {
              $location.url('/auth/login');
              return $q.reject(rejection);
            }
          }
          return $q.reject(rejection);
        }

      };
    }
  ]).controller('UpgradeModalInstanceCtrl', ['$scope', '$uibModalInstance', '$state', '$stateParams', '$modalStack',
      function ($scope, $uibModalInstance, $state, $stateParams, $modalStack) {
        $scope.closeModal = function () {
          $uibModalInstance.dismiss('cancel');
        };
        $scope.goToUpgrade = function(){
          $modalStack.dismissAll('close');
          $state.go('profile.upgrade');

        }
  }])
  //Http Interceptor to check auth failures for XHR requests
  .config(['$httpProvider',
    function($httpProvider) {
      if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
      }
      $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
      $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
      $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
      $httpProvider.interceptors.push('httpInterceptor');
    }
  ]);
