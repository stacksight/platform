'use strict';

/* jshint -W098 */
angular.module('mean.stacks').controller('AvailabilityController', ['$scope', 'Global', 'Appsun', '$stateParams', 'MeanSocket', '$timeout', '$location', 'Sapi',
    function($scope, Global, Appsun, $stateParams, MeanSocket, $timeout, $location, Sapi) {

        var vma = this;
        vma.global = Global;
        vma.moment = window.moment;

        vma.init = function(check) {
            Sapi.get({
                cmd_api: '/availability/' + check
            }).then(function(data) {
                vma.availabilities = data;
                for (var index in vma.availabilities) {
                    vma.first = vma.availabilities[index][0];
                    break;
                }
            }, function(data) {
                console.log('******** availabilities err *********', data)
            });
        };

        $scope.$watch('stack', function(val) {
            if (val && $scope.stack.check) {
                vma.init($scope.stack.check);
            }
        });

    }
]);
