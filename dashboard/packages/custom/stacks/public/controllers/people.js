'use strict';

/* jshint -W098 */
angular.module('mean.stacks').controller('PeopleController', [
    '$scope', 'Global', '$stateParams', 'People', 'slideMenu', '$uibModal', '$log', 'company', 'Collaborators', 'Stacks', '_', 'GetCompany', '$state',
    function($scope, Global, $stateParams, People, slideMenu, $uibModal, $log, company, Collaborators, Stacks, _, GetCompany, $state) {

        var vmc = this;
        vmc.global = Global;
        var appId = $stateParams.appId;
        var vm = $scope.vm; //appsController scope
        vmc.collaborator = {};

        vmc.company = company;

        vmc._ = _;

        vmc.permissions = ['admin', 'viewer'];
        vmc.userInSliderOpen = false;

        var companyId = $state.params.companyId || Global.user.companies[0].id;

        vmc.find = function() {
            // People.find(function(err, data) {
            //     if (err) return console.log(err);
            //     vmc.collaborators = data;
            // });
        };

        vmc.triggerSlideMenu = function(stack, menu_id) {
            vmc.setStackPeople();
            slideMenu.slide(angular.element("#" + menu_id));
        }

        vmc.totalSlideState = {
            open: false,
            collaborator: {}
        };

        vmc.userInSlider = false;
        vmc.triggerSlideMenuPopover = function(collaborator, hideManually) {
            if(collaborator && collaborator.id){
                vmc.setStackPeople();
                vmc.userInSlider = collaborator;
                Stacks.findByCollaborator(collaborator.id, company, function(err, data) {
                    if(err){
                        return;
                    }
                    if(data.length > 0){
                        vmc.userInSlider.stacks = data;
                    }
                });
                if(hideManually){
                    slideMenu.hide(angular.element("#slide-menu"), 'people-component-id');
                } else{
                    if(slideMenu.isOpen(angular.element("#slide-menu")) == true){
                        console.log('NEED HIDE AFTER SHOW');
                        slideMenu.hide(angular.element("#slide-menu"), 'people-component-id').slide(angular.element("#slide-menu"), 'people-component-id');
                    } else{
                        slideMenu.slide(angular.element("#slide-menu"), 'people-component-id');
                    }
                }
            }
        }

        vmc.slideMenu = slideMenu;

        vmc.setStackPeople = function() {
        }

        vmc.animationsEnabled = true;
        vmc.selected_people = [];
        vmc.selected_people_count = 0;
        vmc.open = function(size, parentSelector) {
            var parentElem = parentSelector ?
                angular.element($document[0].querySelector('.modal-people ' + parentSelector)) : undefined;
            var modalInstance = $uibModal.open({
                animation: vmc.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'peopleModalContent',
                controller: 'StacksPeopleModalInstance',
                controllerAs: 'vmc',
                size: size,
                appendTo: parentElem,
                resolve: {
                    people: function() {
                        return vmc.people;
                    },
                    stacks: function() {
                        return vm.stacks;
                    },
                }
            });

            modalInstance.result.then(function(selectedItem) {
                vmc.selected_people = selectedItem;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        vmc.openInvite = function(size, parentSelector) {
            var parentElem = parentSelector ?
                angular.element($document[0].querySelector('.modal-people ' + parentSelector)) : undefined;
            var modalInstance = $uibModal.open({
                animation: vmc.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'invitePeopleModalContent',
                controller: 'InviteStacksPeopleModalInstance',
                controllerAs: 'vmc',
                size: size,
                appendTo: parentElem,
                resolve: {
                    people: function() {
                        return vmc.people;
                    },
                    company: function() {
                        return vmc.company
                    },
                    vmc: function() {
                        return vmc
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                vmc.selected_people = selectedItem;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        vmc.toggleAnimation = function() {
            vmc.animationsEnabled = !vmc.animationsEnabled;
        };

        vmc.cancelInvite = function(from, collaborators){
            Collaborators.remove(from , companyId ,collaborators, null, function(err, data) {
                if(err){
                    return
                }
                vmc.company.collaborators = _.filter(vmc.company.collaborators, function(user){ return user.email != collaborators; })
            });
        }

        vmc.sendReminder = function(to, collaborators){
            Collaborators.add(to, companyId, collaborators, null, true, function(err, data) {
                if(!err){
                    swal('Success', 'Remind sent', "success");
                }
            });
        }

        vmc.selected_users = [];
        vmc.selectUser = function(user){
            var index = _.indexOf(vmc.selected_users, user._id);
            if(index == -1){
                vmc.selected_users.push(user._id);
            } else{
                vmc.selected_users.splice(index, 1)
            }
            if(vmc.selected_users.length >= 1){
                var lastUserIndex = _.findIndex(vmc.company.collaborators, {_id: vmc.selected_users[vmc.selected_users.length - 1]});
                console.log('LAST USER INDEX', lastUserIndex);
                if(lastUserIndex != -1){
                    vmc.triggerSlideMenuPopover(vmc.company.collaborators[lastUserIndex]);
                }
            }
        }

        $scope.filterByGuest = 'guest';

        vmc.total_company = GetCompany.get();

        vmc.userAction = function(action){
            switch(action){
                case 'invite_to':
                    var selUsers = [];
                    for(var i = 0; i < vmc.company.collaborators.length; ++i){
                        if(_.indexOf(vmc.selected_users, vmc.company.collaborators[i]._id) > -1){
                            selUsers.push({
                                name: vmc.company.collaborators[i].name,
                                email: vmc.company.collaborators[i].email
                            });
                        }
                    }
                    if(selUsers.length > 0){
                        Collaborators.add('company', companyId, selUsers, null, false, function(err, data) {
                            if(err){
                                return swal({title: 'Oops...', text: err, type: 'error', timer: 3000});
                            }
                            swal({title: 'Success', text: 'Users added to company', type: 'success', timer: 3000});
                            $state.transitionTo($state.current, $stateParams, {
                                reload: true,
                                inherit: false,
                                notify: true
                            });
                        });
                    }
                    break;
                case 'remove_from':
                    var selUsers = [];
                    for(var i = 0; i < vmc.company.collaborators.length; ++i){
                        if(_.indexOf(vmc.selected_users, vmc.company.collaborators[i]._id) > -1){
                            selUsers.push(vmc.company.collaborators[i].email);
                        }
                    }
                    if(selUsers.length > 0){
                        Collaborators.remove('company', companyId, selUsers, null, function(err, data) {
                            if(err){
                                return swal({title: 'Oops...', text: err, type: 'error', timer: 3000});
                            }
                            swal({title: 'Success', text: 'Users removed from company', type: 'success', timer: 3000});
                            $state.transitionTo($state.current, $stateParams, {
                                reload: true,
                                inherit: false,
                                notify: true
                            });
                        });
                    }
                    break;
                case 'make_admin':
                case 'remove_admin':
                    var selUsers = [];
                    for(var i = 0; i < vmc.company.collaborators.length; ++i){
                        if(_.indexOf(vmc.selected_users, vmc.company.collaborators[i]._id) > -1){
                            selUsers.push(vmc.company.collaborators[i].email);
                        }
                    }
                    if(selUsers.length > 0){
                        var data = {
                            companyId: companyId,
                            collaborators: selUsers,
                            action: (action == 'make_admin') ? 'add' : 'remove',
                            role: 'admin'
                        };

                        Collaborators.updateRole(data, function(err, data) {
                            if(err){
                                return swal({title: 'Oops...', text: err, type: 'error', timer: 3000});
                            }
                            var textMessage = '';
                            if(action == 'make_admin'){
                                textMessage = 'Users marked as admin';
                            } else{
                                textMessage = 'Users unmarked as admin';
                            }
                            swal({title: 'Success', text: textMessage, type: 'success', timer: 3000});
                            $state.transitionTo($state.current, $stateParams, {
                                reload: true,
                                inherit: false,
                                notify: true
                            });
                        });
                    }
                    break;
                case 'delete_user':
                    var selUsers = [];
                    for(var i = 0; i < vmc.company.collaborators.length; ++i){
                        if(_.indexOf(vmc.selected_users, vmc.company.collaborators[i]._id) > -1){
                            selUsers.push(vmc.company.collaborators[i].email);
                        }
                    }
                    if(selUsers.length > 0){
                        Collaborators.remove('company', companyId, selUsers, null, function(err, data) {
                            if(err){
                                return swal({title: 'Oops...', text: err, type: 'error', timer: 3000});
                            }
                            swal({title: 'Success', text: 'Users deleted', type: 'success', timer: 3000});
                            $state.transitionTo($state.current, $stateParams, {
                                reload: true,
                                inherit: false,
                                notify: true
                            });
                        });
                    }
                    break;
                default:
                    break;
            }
        }
    }
]);

angular.module('mean.stacks').controller('StacksPeopleModalInstance', [
    '$uibModalInstance', 'people', 'stacks', 'Collaborators', '$scope', 'Stack', '$stateParams',
    function($uibModalInstance, people, stacks, Collaborators, $scope, Stack, $stateParams) {
        var $ctrl = this;

        $ctrl.vm = $scope.vm;
        $ctrl.stack_name = 'Total name';
        $ctrl.people = people;
        $ctrl.stacks = stacks;
        $ctrl.selected_people_count = 0;
        $ctrl.selected_stacks_count = 0;
        $ctrl.selected_people = {};
        $ctrl.selected_stacks = {};
        $ctrl.selected = {};
        $ctrl.collobrator_email = '';

        $ctrl.selectItem = function(item) {
            if ($ctrl.selected_people[item['_id']]) {
                delete $ctrl.selected_people[item['_id']];
                $ctrl.selected_people_count--;
            } else {
                $ctrl.selected_people[item['_id']] = item;
                $ctrl.selected_people_count++;
            }
        };

        $ctrl.selectStacks = function(stack) {
            if ($ctrl.selected_stacks[stack['_id']]) {
                delete $ctrl.selected_stacks[stack['_id']];
                $ctrl.selected_stacks_count--;
            } else {
                $ctrl.selected_stacks[stack['_id']] = stack;
                $ctrl.selected_stacks_count++;
            }
        };

        $ctrl.ok = function() {

        };

        $ctrl.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);