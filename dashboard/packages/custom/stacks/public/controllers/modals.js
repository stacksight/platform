'use strict';

/* jshint -W098 */
angular.module('mean.stacks').controller('ModalsController', ['$scope', '$modalInstance', 'vm',
    function($scope, $modalInstance, vm) {
        
        var vmodal = this;
        $scope.vm = vm;

        vmodal.template = 'addStackModal';

        vmodal.openLocalModal = function() {
            vmodal.template = 'platforms-cube';
        };

        vmodal.closeModal = function(){
            $modalInstance.dismiss('cancel');
        };
    }
]);