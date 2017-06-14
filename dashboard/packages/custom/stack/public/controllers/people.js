'use strict';

/* jshint -W098 */
angular.module('mean.stack').controller('StackPeopleController', [
    '$scope', '$filter', '$state', '$location', '$timeout', '$stateParams', '_', 'Health', 'Apps', '$rootScope',
    '$uibModal', '$log', 'Collaborators', 'Stack', 'Companies', 'Global', 'company',
    function($scope, $filter, $state, $location, $timeout, $stateParams, _,
             Health, Apps, $rootScope, $uibModal, $log, Collaborators, Stack, Companies, Global, company) {
        var vmp = this;

        vmp.app_id = $stateParams.id;
        vmp.people = false;
        vmp.companyObject = company;
        vmp._ = _;

        vmp.find = function(){
            Stack.findOne(vmp.app_id, function(data, err){
                if(err){
                   return;
                }
                vmp.stack = data;
                vmp.people = data.collaborators;
                vmp.peopleForHeader = data.collaborators.slice(-3);
                vmp.hiddenCount = vmp.people.length - vmp.peopleForHeader.length;
            });
        };

        vmp.removeUser = function(collaborator) {
            var companyId = vmp.stack.company._id;
            Collaborators.remove('stack', companyId, [collaborator.email], [vmp.app_id], function(err, data) {
                if(err){
                    return
                }
                vmp.people = _.filter(vmp.people, function(user){ return user.email != collaborator.email; })
            });
        }

        vmp.animationsEnabled = true;
        vmp.selected_people = [];
        vmp.selected_people_count = 0;
        vmp.open = function (size, parentSelector) {
            var parentElem = parentSelector ?
                angular.element($document[0].querySelector('.modal-people ' + parentSelector)) : undefined;
            var modalInstance = $uibModal.open({
                animation: vmp.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'peopleModalContent',
                controller: 'PeopleModalInstance',
                controllerAs: 'vmp',
                size: size,
                appendTo: parentElem,
                resolve: {
                    people: function () {
                        return vmp.companyObject.collaborators;
                    },
                    stackData: function(){
                        return vmp.stack;
                    }
                }

            });

            modalInstance.result.then(function (selectedItem) {
                vmp.selected_people = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        vmp.toggleAnimation = function () {
            vmp.animationsEnabled = !vmp.animationsEnabled;
        };

        $scope.$on('$stateChangeSuccess',
            function onStateSuccess(event, toState, toParams, fromState) {
                if(toParams.param == 'add'){
                    vmp.open();
                }
            }
        );
    }
]);

angular.module('mean.stack').controller('PeopleModalInstance', [
    '$uibModalInstance', 'people', 'Collaborators', '$scope', 'Stack', '$stateParams', 'Global', '_', 'GetCompany', 'stackData',
        function($uibModalInstance, people, Collaborators, $scope, Stack, $stateParams, Global, _, GetCompany, stackData) {
    var $ctrl = this;
    $ctrl.stack_name = (stackData.data && stackData.data.title) ? stackData.data.title : (stackData.name) ? stackData.name : '';
    $ctrl.people = people;
    $ctrl.selected_people_count = 0;
    $ctrl.selected_people = {};
    $ctrl.selected = {};
    $ctrl.collobrator_email = '';

    $ctrl.selectItem = function(item){
        if($ctrl.selected_people[item['_id']]){
            delete $ctrl.selected_people[item['_id']];
            $ctrl.selected_people_count--;
        } else{
            $ctrl.selected_people[item['_id']] = item;
            $ctrl.selected_people_count++;
        }
    };
    var id = $stateParams.id;

    // Stack.findOne(id, function(data) {
    //     $ctrl.stack = data;
    // });

    $ctrl.ok = function () {
        var selectedCompany = GetCompany.get();
        var companyId = selectedCompany.id;
        // Collaborators.addToStack(id, ['kuku99@gmail.com', 'chava@linnovate.net'], function(err, data) {
        //     console.log(err, data);
        // });
        //
        // console.log($ctrl.collobrator_email);
        // console.log($ctrl.selected_people_count > 0);
        if($ctrl.selected_people_count > 0){
            // Send mails for collobarators
            var users = [];
            var values = _.values($ctrl.selected_people);
            for(var i = 0; i < values.length; ++i){
                users.push(values[i].email);
            }

            Collaborators.add('stack', companyId, users, [id], null, function(err, data){
                if(err){
                    return swal({title: 'Oops...', text: err, type: 'error', timer: 3000});
                }

            });

            $uibModalInstance.close($ctrl.selected_people);
        }
        if($ctrl.collobrator_email){
            Collaborators.add('stack', companyId, {name: $ctrl.collobrator_email, email: $ctrl.collobrator_email}, [id], null, function(err, data){
                if(err){
                    return swal({title: 'Oops...', text: err, type: 'error', timer: 3000});
                }
                $uibModalInstance.close($ctrl.selected_people);
            });
        }
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);