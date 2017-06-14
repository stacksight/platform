(function () {
  'use strict';

  /* jshint -W098 */
  angular
    .module('mean.companies')
    .controller('CompaniesController', CompaniesController);

  CompaniesController.$inject = ['$scope', 'Global', 'Companies'];

  function CompaniesController($scope, Global, Companies) {
    $scope.global = Global;
    $scope.package = {
      name: 'companies'
    };
  }
})();