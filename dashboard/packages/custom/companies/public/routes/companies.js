(function () {
  'use strict';

  angular
    .module('mean.companies')
    .config(companies);

  companies.$inject = ['$stateProvider'];

  function companies($stateProvider) {
    $stateProvider.state('companies example page', {
      url: '/companies/example',
      templateUrl: 'companies/views/index.html'
    });
  }

})();
