'use strict';

/* jshint -W098 */
angular.module('mean.stacks').controller('StacksController', [
  '$scope', 'Global', '$stateParams', 'Platforms', '$state', 'Stacks', 'localStorageService', 'Sapi', '$uibModal', '_', 'Tags', 'Companies', 'GetCompany', 'ShowHits', '$log',
  function($scope, Global, $stateParams, Platforms, $state, Stacks, localStorageService, Sapi, $uibModal, _, Tags, Companies, GetCompany, ShowHits, $log) {
    var vm = this;

    $scope.global = Global;
    $scope.$state = $state;
    $scope.env = $stateParams.env;
    $scope.$params = $stateParams;

    vm.stacks = {};
    $scope.selected_stacks_array = [];
    $scope.transfer_stacks_array = [];
    vm.selected_stacks_count = 0;

    vm.$scope = $scope;

    vm._ = _;

    vm.readyToShow = false;

    vm.init = function() {
      $scope.global = Global;
      var options = {
        populate: true
          // tags: ['57fa39a3dd50a643d18bb1c0']
      };

      if ($stateParams.companyId && $stateParams.companyId != 'all') {
        options.company = $stateParams.companyId;
      }

      Stacks.find(options, function(err, data) {
        vm.readyToShow = true;
        if (err) {
          return console.log('find stacks error', err);
        } else {
          vm.stacks = data;
          for(var i = 0; i < vm.stacks.length; i++){
            var stack = vm.stacks[i];
            stack = setHealthField(stack);
          }
          if($stateParams.search){
            $scope.searchWithText($stateParams.search);
          }

          ShowHits.show();
        }
      });
    }

    function setHealthField(stack){
        if(stack.integrations){
            for(var j = 0; j < stack.integrations.length; j++){
                var integration = stack.integrations[j];
                if(integration.active && integration.data && integration.type){
                    if(!stack.health_score){
                        stack.health_score = {};
                    }
                    switch(integration.type){
                        case 'update':
                            stack.health_score[integration.type] = {};
                            if(integration.data.available){
                                stack.health_score[integration.type].available = +integration.data.available;
                            }
                            if(integration.data.critical){
                                stack.health_score[integration.type].critical = +integration.data.critical;
                            }
                            break;
                        default:
                            if(integration.data.score){
                                var score =  parseInt(integration.data.score);
                                stack.health_score[integration.type] = score.toFixed(2);
                            }
                            break;
                    }
                }
            }
        }
        return stack;
    }

    vm.find = vm.init;

    vm.selectState = null;
    $scope.transfer_stacks_array = null;
    vm.selectStack = function(stack) {
      if (!vm.selectState || vm.selectState && vm.selectState != stack._id) {
        vm.selectState = stack._id;
        $stateParams.id = stack._id;
        if ($scope.selected_stacks_array.length == 0) {
          $scope.transfer_stacks_array = [stack._id];
        }
      } else {
        vm.selectState = null;
        $scope.transfer_stacks_array = null;
      }
    }

    vm.checkStack = function(stack, manually, status) {
      var exist = _.findIndex($scope.selected_stacks_array, function(item) {
        return item == stack._id
      });

      if(!manually){
          if (exist == -1) {
              $scope.selected_stacks_array.push(stack._id);
          } else {
              $scope.selected_stacks_array.splice(exist, 1);
          }
      } else {
          if(status == true){
              if (exist != -1)
                $scope.selected_stacks_array.splice(exist, 1);
          } else{
              if (exist == -1)
                $scope.selected_stacks_array.push(stack._id);
          }
      }
        vm.selected_stacks_array = $scope.selected_stacks_array;
        vm.selected_stacks_count = $scope.selected_stacks_array.length;
    }

    vm.statusOfSelectAllButton = true;
    vm.selected_stacks = [];

      vm.selectAllStatus = false;
      vm.selectAllStacks = function(){
        if(vm.stacks.length > 0){
            for(var i = 0; i < vm.stacks.length; ++i){
                vm.checkStack(vm.stacks[i], true, vm.selectAllStatus);
                if(vm.selectAllStatus == false){
                    vm.selected_stacks[vm.stacks[i]._id] = true;
                } else{
                    vm.selected_stacks[vm.stacks[i]._id] = false;
                }
            }
            vm.statusOfSelectAllButton = !vm.statusOfSelectAllButton;
            vm.selectAllStatus = !vm.selectAllStatus;
        }
    }

    vm.openInvite = function(size, parentSelector) {
        var parentElem = parentSelector ?
            angular.element($document[0].querySelector('.modal-people ' + parentSelector)) : undefined;
        var modalInstance = $uibModal.open({
            animation: vm.animationsEnabled,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'invitePeopleModalContent',
            controller: 'InviteStacksPeopleModalInstance',
            controllerAs: 'vm',
            size: size,
            appendTo: parentElem,
            resolve: {
                people: function() {
                    return vm.people;
                },
                company: function() {
                    return vm
                },
                vm: function() {
                    return vm
                },
                selected_stacks: function () {
                    return $scope.selected_stacks_array;
                }
            }
        });

        modalInstance.result.then(function(selectedItem) {
            vm.selected_people = selectedItem;
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    vm.action_for_stacks = [{
        action_name: 'add_members',
        title: 'Add Members to Stacks',
        action: function() {
          vm.openInvite();
        }
    },
        // {
        // action_name: 'archive',
        // title: 'Archive',
        // action: function() {
        //     var arr = $scope.selected_stacks_array;
        //     if(arr.length > 0){
        //         if (confirm('Do you want to archive ' + arr.length + ' stacks?')) {
        //             for (var i = 0; i < arr.length; ++i) {
        //                 var stack_id = arr[i];
        //                 (function (stack_id) {
        //                   var index = _.findIndex(vm.stacks, {
        //                       _id: stack_id
        //                   });
        //                   if(index !== -1){
        //                     vm.stacks[index].archived = true;
        //                   }
        //                   // console.log(vm.stacks[index]);
        //                   // // vm.selected_stacks[stack_id] = false;
        //                 })(stack_id);
        //             }
        //             $scope.selected_stacks_array = [];
        //             $scope.selected_stacks_count = 0;
        //             vm.selected_stacks_array = [];
        //             vm.selected_stacks_count = 0;
        //         }
        //     }
        // }
    // },
        {
      action_name: 'delete',
      title: 'Delete',
      action: function() {
        var arr = $scope.selected_stacks_array;
        if(arr.length > 0){
            if(confirm('Do you want to delete '+arr.length+' stacks?')){
                for(var i = 0; i < arr.length; ++i){
                    var stack_id = $scope.selected_stacks_array[i];
                    (function(stack_id){
                        Stacks.delete(stack_id, function(err, data){
                          if(!err){
                              var index = _.findIndex(vm.stacks, {
                                  _id: stack_id
                              });
                              if(index !== -1){
                                  vm.stacks.splice(index, 1);
                              }
                              $scope.selected_stacks_array = _.without($scope.selected_stacks_array, stack_id);
                              vm.selected_stacks_count = $scope.selected_stacks_array.length;
                          }
                        });
                    })(stack_id);
                }
            }
        }
      }
    }];

    // vm.selectedStackId = '57d7d34e56c8c7addefa097c';
    // vm.selectedStackId = '57d803823adde1b7416b0db9';

    vm.platforms = Platforms;
    _.each(vm.platforms, function(value, key) {
      switch (key) {
        case 'wordpress':
        case 'drupal':
          vm.platforms[key].enable = true;
          break;
        default:
          vm.platforms[key].enable = false
          break;
      }
    });

    vm.moveToStack = function(stack) {
      var state = (stack.platform === 'web') ? 'stack.health.type' : 'stack.dashboard';
      $state.go(state, {
        id: stack._id,
        type: 'performance'
      });
    };
    vm.moveToStackUpdates = function(stack) {
      $state.go('stack.updates', {
        id: stack._id
      });
    };

    vm.showLoader = true;
    vm.openModal = function(size) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'addStackModal',
        controller: 'ModalsController as vmodal',
        windowClass: 'addStackModalClass',
        resolve: {
          vm: function() {
            return $scope.vm
          }
        }
      });
    };

    vm.sideBarData = {
      tabs: [{
        title: 'Dashboard',
        link: 'company.main.dashboard',
        platforms: ['all'],
        params: {
          appId: $stateParams.appId
        }
      }, {
        title: 'Inventory',
        link: 'company.main.inventory',
        platforms: ['all']
      }, {
        title: 'People',
        link: 'company.main.people',
        platforms: ['all'],
        params: {
          companyId: Companies.my($scope.global.user.companies).id
        }
      },
      {
        title: 'Tour',
        link: 'company.main.dashboard.tour',
        platforms: ['all']
      }]
    };

    vm.submitAddStack = function() {
      $('#add-new-stack-form').submit();
    }

    vm.stack = {};

    vm.addSelectStack = function(type) {
      vm.stack.platform = type;
    }
    vm.addStack = function(callbackSuccess) {
      //clean data after submit
      Stacks.create(vm.stack, function(err, data) {
        if (err) {
          try {
            var error = JSON.parse(err);
            if (error.type != 'upgrade plan') {
              return sweetAlert(error.type || '', error.message || err, 'error');
            }
          } catch (e) {
            return;
          }
          return;
        }
        vm.stacks.push(data);
        vm.stack = {};
        $state.go('stack.settings', {
          id: data._id
        });
        if (callbackSuccess && typeof callbackSuccess === 'function') {
          callbackSuccess();
        }
      });
    };


    vm.tagsPopover = {
      templateUrl: 'stack-popover-tags',
      content: []
    };

    vm.setPopoverTags = function(tags) {
      vm.tagsPopover.content = tags;
    }
    vm.user = $scope.global.user;
    var localComapy = GetCompany.get();

    $scope.searchStr = '';
    $scope.searchAction = function(value, selectedObject, autoScope) {
      if (value && value.originalObject) {
        switch (value.originalObject.type) {
          case 'tag':
            var localTag = {
              tag: value.originalObject.tag._id,
              value: value.originalObject.tag.value
            };
            vm.filterByTag(localTag, localComapy);
            autoScope.searchStr = null;
            //$scope.searchWithText(value.title);
            break;
          default:
            $scope.searchWithText(value.title);
            break;
        }
      } else {
        $scope.searchWithText(null);
      }
    }

    $scope.searchWithText = function(value) {
      vm.search = value;
      $state.go('.', {search: value}, {notify: false});
    }

    $scope.search_tags = [];
    vm.search_tags = [];
    vm.searchScope = false;

    $scope.localSearch = function(str, scope) {
      $scope.search_tags = [];
      vm.searchScope = scope;
      var promise = new Promise(function(resolve, reject) {
        Tags.find(localComapy, 'stacks', str, function(err, tags) {
          vm.search_tags = [];
          if (!err) {
            var exist_in_array = false;
            _.each(tags, function(value) {
              vm.search_tags.push({
                value: value.value,
                tag: value,
                pic: '/system/assets/img/ico/tag-ico.png',
                type: 'tag'
              });
              if (value.value == str) {
                exist_in_array = true;
              }
            });

            vm.search_tags.unshift({
              value: str,
              desc: '',
              pic: '/system/assets/img/ico/search-ico.png',
              tag: {},
              type: 'text'
            });

            $scope.search_tags = vm.search_tags;
            vm.searchScope.searching = false;
            resolve(vm.search_tags);
          } else {
            vm.searchScope.searching = false;
            reject(err);
          }
        });
      });
      return promise;
    }

    vm.tag_order = 0;
    vm.filter_tags = {};
    vm.filterByTag = function(tag, company) {
      if (vm.filter_tags[tag.tag]) {
        delete vm.filter_tags[tag.tag];
      } else {
        ++vm.tag_order;
        vm.filter_tags[tag.tag] = {
          index: tag.tag,
          value: tag.value,
          sortIndex: vm.tag_order
        };
      }

      vm.sortedTags = _.sortBy(vm.filter_tags, function(o) {
        return -o.sortIndex;
      });

      var options = {
        populate: true,
        tags: _.keys(vm.filter_tags)
      };
      if (tag && tag.desc === 'company' && company)
        options.company = company._id;

      vm.readyToShow = false;

      Stacks.find(options, function(err, data) {
        vm.readyToShow = true;
        if (err) {
          return console.log('find stacks error', err);
        } else {
          if (data.length > 0) {
            var ids_by_tag = [];
            for (var i = 0; i < data.length; i++) {
              ids_by_tag.push(data[i]._id);
              data[i] = setHealthField(data[i]);
            }
            $scope.transfer_stacks_array = ids_by_tag;
          }
          vm.stacks = data;
          $scope.selected_stacks_array = [];
          vm.selected_stacks_count = 0;
        }
      });
    }

    vm.getHScore = function(stack, type){
      var index = vm._.findIndex(stack.integrations, {type: type});
      if(index != -1 && stack.integrations[index].data && stack.integrations[index].data.score){
        var result = +stack.integrations[index].data.score;
        return result.toFixed(2);
      }
      return false;
    }

    vm.getHScoreIndex = function(stack, type){
      return (vm._.findIndex(stack.integrations, {type: type}) != -1) ? true : false;
    }

    vm.sort_type = false;
    vm.sort_field = false;

    vm.sortByField = function(field) {
      vm.sort_type = (vm.sort_type == 'desc' || vm.sort_type == '') ? 'asc' : 'desc';
      vm.sort_field = field;
      if (vm.sort_type == 'desc') {
        vm.stacks = _.sortBy(vm.stacks, vm.sort_field).reverse();
      } else {
        vm.stacks = _.sortBy(vm.stacks, vm.sort_field);
      }
    }

    vm.goOut = function(){
      window.open('http://stacksight.io/signals', '_blank');
    }

    $scope.$on('$stateChangeSuccess',
        function onStateSuccess(event, toState, toParams, fromState) {
          if(toParams.param == 'addstack'){
            vm.openModal();
          }
        }
    );

    $scope.orderStackByCriticalUpdates = function(item){
      var res_critical = 0;
      var res_available = 0;
      if(item.integrations){
        if(vm._.findLastIndex(item.integrations, {type: 'update'}) > -1){
          if(item.integrations[vm._.findLastIndex(item.integrations, {type: 'update'})].data && item.integrations[vm._.findLastIndex(item.integrations, {type: 'update'})].data.critical){
            res_critical = +item.integrations[vm._.findLastIndex(item.integrations, {type: 'update'})].data.critical;
          }
          if(item.integrations[vm._.findLastIndex(item.integrations, {type: 'update'})].data && item.integrations[vm._.findLastIndex(item.integrations, {type: 'update'})].data.available){
            res_available = +item.integrations[vm._.findLastIndex(item.integrations, {type: 'update'})].data.available;
          }
        }
      }
      return -(res_critical * 1000 + res_available);
    }
  }
]);

angular.module('mean.stacks').controller('InviteStacksPeopleModalInstance', [
    '$uibModalInstance', 'people', 'company', 'Collaborators', '$scope', 'Stack', '$stateParams', 'Global', '_', 'vm', '$state', '$log', 'selected_stacks',
    function($uibModalInstance, people, company, Collaborators, $scope, Stack, $stateParams, Global, _, vm, $state, $log, selected_stacks) {
        var $ctrl = this;

        $ctrl.vm = $scope.vm;
        $ctrl.stack_name = 'Total name';
        $ctrl.people = people;
        $ctrl.selected_stacks_count = selected_stacks.length || 0;
        $ctrl.selected_stacks = _.object(selected_stacks, selected_stacks) || {};
        $ctrl.selected = {};

        $scope.set_selected = false;

        if(selected_stacks && selected_stacks.length >0){
            // $scope.set_selected = true;
            $scope.stacks = _.filter(company.stacks, function(stack){ return _.indexOf(selected_stacks, stack._id) !== -1; });
        } else{
            $scope.stacks = company.stacks;
        }

        $ctrl.selectStacks = function(stack) {
            if ($ctrl.selected_stacks[stack['_id']]) {
                delete $ctrl.selected_stacks[stack['_id']];
                $ctrl.selected_stacks_count--;
            } else {
                $ctrl.selected_stacks[stack['_id']] = true;
                $ctrl.selected_stacks_count++;
            }
        };

        $ctrl.ok = function() {
            var user = {name: $ctrl.collaborator.name, email: $ctrl.collaborator.email};
            var companyId = $state.params.companyId || Global.user.companies[0].id;
            var stacks = null;
            if(!$ctrl.collaborator.isAdmin){
                stacks =  _.keys($ctrl.selected_stacks);
            }
            Collaborators.add('company', companyId, user, stacks, $ctrl.collaborator.isAdmin, function(err, data) {
                if(err){
                    return swal({title: 'Oops...', text: err, type: 'error', timer: 3000});
                }
                if($ctrl.selected_stacks_count > 0){
                    Collaborators.add('stacks', companyId, [user.email], _.keys($ctrl.selected_stacks), null, function(err, data) {
                        if(err){
                            return swal({title: 'Oops...', text: err, type: 'error', timer: 3000});
                        }
                        // vmc.company.collaborators.push(user);
                        $uibModalInstance.dismiss('cancel');
                        $state.transitionTo($state.current, $stateParams, {
                            reload: true,
                            inherit: false,
                            notify: true
                        });
                    });
                } else{
                    // vmc.company.collaborators.push(user);
                    $uibModalInstance.dismiss('cancel');
                }
            });
        };
        $ctrl.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);