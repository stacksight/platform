'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */

angular.module('sbAdminApp')
    .directive('search', function() {
        return {
            templateUrl: 'sb-admin/directives/search/search.html',
            restrict: 'E',
            replace: true,
            scope: {
                model: '='
            },
            controller: function($scope) {
                $scope.selectedMenu = 'home';
            }
        }
    });
