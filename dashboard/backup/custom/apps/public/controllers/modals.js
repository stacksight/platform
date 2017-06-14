'use strict';

/* jshint -W098 */
angular.module('mean.apps').controller('ModalsController', ['$scope', '$modalInstance', 'vms', 'vm',
    function($scope, $modalInstance, vms, vm) {
        
        var vmodal = this;
        $scope.vms = vms;
        $scope.vm = vm;

        vmodal.template = 'add-stack-cube';

        vmodal.openLocalModal = function() {
            vmodal.template = 'platforms-cube';
        };

        vmodal.closeModal = function(){
            $modalInstance.dismiss('cancel');
        };
    }
]);