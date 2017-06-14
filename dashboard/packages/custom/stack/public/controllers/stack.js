'use strict';

/* jshint -W098 */
angular.module('mean.stack').controller('StackController',
    ['$scope', 'Global', 'Stack', '$stateParams', '$state', '$uibModal', '$rootScope', '$timeout', 'MeanSocket',
        'ConfigApp', 'Integrations', 'localStorageService', 'Tags', '_', 'Platforms', 'Stacks', 'GetCompany',
  function($scope, Global, Stack, $stateParams, $state, $uibModal, $rootScope, $timeout, MeanSocket,
           ConfigApp, Integrations, localStorageService, Tags, _, Platforms, Stacks, GetCompany) {
    $scope.global = Global;
    $scope.$state = $state;

    var vms = this;

    $scope.env = $stateParams.env;

    $scope.$params = $stateParams;
    $scope.stackId = [$stateParams.id];

    $scope.collapse = {
      opened: false
    };

    var features = {
      dashboard: ['all'],
      events: ['mean', 'wordpress', 'drupal', 'nodejs', 'symfony2', 'magento2'],
      logs: ['mean', 'wordpress', 'drupal', 'nodejs', 'symfony2', 'magento2'],
      sessions: ['mean', 'nodejs'],
      updates: ['wordpress', 'drupal', 'nodejs', 'magento2'],
      health: ['wordpress', 'drupal', 'web'],
      inventory: ['wordpress', 'drupal'],
      people: ['all'],
      integrations: ['all'],
      builds: [],
      settings: ['all']
    };

    ConfigApp.get().then(function(config) {
      vms.billingProvider = config.billingProvider;
    }, function(err) {
      console.log(err);
    });

    $timeout(function() {
      $scope.scrollTopHeight = ($('.page-header').height() + $('.top').height());
    }, 10);

    $scope.sideBarData = {
      tabs: [{
          title: 'dashboard',
          link: 'stack.dashboard',
          platforms: features.dashboard,
        }, {
          title: 'events',
          link: 'stack.events',
          platforms: features.events,
        }, {
          title: 'logs',
          link: 'stack.logs',
          platforms: features.logs,
        },
        /* {
                title: 'sessions',
                link: 'stack.sessions',
                platforms: features.sessions
              },*/
        {
          title: 'updates',
          link: 'stack.updates',
          platforms: features.updates,
          template: '<updates-notifications data="data.updates"></updates-notifications>'
        }, {
          title: 'health',
          link: 'stack.health.type',
          params: {
            type: 'performance'
          },
          platforms: features.health
        }, {
          title: 'inventory',
          link: 'stack.inventory',
          platforms: features.inventory
        }, {
          title: 'people',
          link: 'stack.people',
          platforms: features.people
        }, {
          title: 'integrations',
          link: 'stack.integrations.main',
          childrenLinks: ['stack.integrations.service.settings'], //for active parent state
          platforms: features.integrations
        }, {
          title: 'builds',
          link: 'stack.builds.service',
          params: {},
          platforms: features.builds
        }, {
          title: 'settings',
          link: 'stack.settings',
          platforms: features.settings,
        }
      ],
      src: 'stack',
      isCollapse: true
    };

    $scope.groups = [];
    $scope.group = {};

    setQuickLinks();

    $scope.findOne = function() {
      var id = $stateParams.id;
      Stack.findOne(id, function(data) {
        console.log(data);
        $rootScope.stackCompany = {id: data.company._id, name:  data.company.name};
        $scope.stack = data;
        vms.stack = data;

        vms.people = vms.stack.collaborators;
        vms.peopleForHeader = vms.stack.collaborators.slice(-3);
        vms.hiddenCount = vms.people.length - vms.peopleForHeader.length;

        $scope.selectedStackId = id;
        $scope.sideBarData.stack = $scope.stack;
        displayBuildsTabs();
      });
    };

    vms.platforms = Platforms;
    _.each(vms.platforms, function(value, key) {
      switch (key) {
        case 'wordpress':
        case 'drupal':
          vms.platforms[key].enable = true;
          break;
        default:
          vms.platforms[key].enable = false
          break;
      }
    });

    $scope.search_tags = [];
    vms.show_taginput = false;

    $scope.showInputTags = function() {
      vms.show_taginput = true;
    }

    $scope.addTag = function(value) {
      if (value) {
        var tag, func;

        if (value.description === 'new') {
          tag = {
            value: value.title
          };
          func = 'create';
        } else {
          tag = value.originalObject.tag,
            func = 'add';
        }

        Tags[func](tag, $scope.stack, function(err, data) {
          if (err) return console.log('Add tag error', err);
          vms.stack.tags.push(data.tags[data.tags.length - 1]);
          $scope.$broadcast('angucomplete-alt:clearInput');
          vms.show_taginput = false;
        });
      }
    }
    vms._ = _;
    vms.search_tags = [];
    vms.searchScope = false;

    vms.query = '';
    vms.filterStackList = function(item){
        if (!vms.query || (item.data && item.data.title && item.data.title.toLowerCase().indexOf(vms.query.toLowerCase()) != -1) ||
            (item.name && item.name.toLowerCase().indexOf(vms.query.toLowerCase()) != -1) ){
            return true;
        }
        return false;
    };

    $scope.localSearch = function(str, scope) {
      $scope.search_tags = [];
      vms.searchScope = scope;
      var promise = new Promise(function(resolve, reject) {
        var company = GetCompany.get();
        Tags.find(company, 'stack', str, function(err, tags) {
          vms.search_tags = [];
          if (!err) {
            var exist_in_array = false;
            _.each(tags, function(value) {
              vms.search_tags.push({
                value: value.value,
                tag: value
              });
              if (value.value == str) {
                exist_in_array = true;
              }
            });

            if (exist_in_array == false) {
              vms.search_tags.unshift({
                value: str,
                desc: 'new',
                tag: {}
              });
            }
            $scope.search_tags = vms.search_tags;
            vms.searchScope.searching = false;
            resolve(vms.search_tags);
          } else {
            vms.searchScope.searching = false;
            reject(err);
          }
        });
      });

      return promise;
    }

    $scope.removeTag = function(tag) {
      vms.tag_value = tag.value;
      Tags.remove(tag, $scope.stack, function(err, data) {
        if (err) {
          console.log('remove tag error', err);
          return;
        }
        vms.stack.tags = _.without(vms.stack.tags, _.findWhere(vms.stack.tags, {
          value: vms.tag_value
        }));

      });
    }

    function displayBuildsTabs() {
      var integrations = _.map(Integrations.services.ci.subServices, 'name');
      if (!$scope.stack.integrations || !$scope.stack.integrations.length) return;
      var buildsTabIndex = _.findIndex($scope.sideBarData.tabs, function(o) {
        return o.title == 'builds';
      });
      delete $scope.sideBarData.tabs[buildsTabIndex].params.service;
      integrations.forEach(function(service) {
        var o = _.find($scope.stack.integrations, {
          name: service,
          enable: true
        });
        if (o) findTabEndDisplay(buildsTabIndex, o.name);
      });
    };

    function findTabEndDisplay(index, name) {
      $scope.sideBarData.tabs[index].platforms.push('all');
      if (!$scope.sideBarData.tabs[index].params.service) $scope.sideBarData.tabs[index].params.service = name;
    }

    function setQuickLinks() {
      if (!$scope.vm || !$scope.vm.app) return;
      var stacks = $scope.vm.app.stacks;
      stacks.forEach(function(stack) {
        stack.links = [];
        $scope.sideBarData.tabs.forEach(function(link) {
          link = JSON.parse(JSON.stringify(link));
          if (link.views && (link.platforms.indexOf(stack.platform) > -1 || link.platforms.indexOf('all') > -1)) {
            link.params = link.params || {};
            link.params.id = stack._id;
            stack.links.push(link);
          }
        });
      });
    }

    $scope.changeStack = function(stack) {
      $state.go('.', {
        id: stack._id
      });
    };

    $scope.clear = function() {
      $scope.group.selected = undefined;
    };

    vms.initSetting = function() {
      // Apps.find(function(err, data) {
      //   if (!err) {
      //
      //     _.each(data.apps, function(value, key) {
      //       var group = {
      //         '_id': value._id,
      //         'name': value.name
      //       };
      //       $scope.groups.push(group);
      //       if ($scope.stack.app._id == value._id) {
      //         $scope.group.selected = group;
      //       }
      //     });
      //   }
      // });
    }

    vms.deleteStack = function(stack){
        if (confirm("Do you want to delete "+stack.name+" stack?")) {
            Stacks.delete(stack._id, function(err, data){
                if(!err){
                    $state.go('company.main.dashboard', {
                        companyId: stack.company._id
                    });
                }
            });
        }
    }

    vms.update = function(valid, stack, src) {
      if (valid) {
        Stack.update(stack._id, stack, function(err, data) {
          if (err && err.status === 401) return sweetAlert("Canceled!", "You do not have permissions to update this stack", "error");
          if (err) return console.log('update stack err', err);
          if (src === 'settingsTab') {
            sweetAlert("Settings saved !", "", "success");
          } else if (src === 'stack-form-up' || src === 'stack-form-emup') {
            sweetAlert("Domain updated! You can see first data after ~3 min.", "", "success");
          } else if (src === 'stack-form-add') {
            sweetAlert("Domain saved! You can see first data after ~3 min.", "", "success");
          }
        });
      }
    };


    //stacks gallery removed !
    vms.relocationStack = function(stack, toAppId) {
      if (toAppId === stack._id) return;
      Stack.relocation(stack._id, toAppId, function(err, data) {
        // if (err) return console.log('RELOCATION STACK ERROR', err);
        if (err) return sweetAlert("Canceled!", "You do not have permissions to relocation this stack", "error");
        $scope.stack.app = {
          _id: $scope.group.selected._id,
          name: $scope.group.selected.name
        };
        sweetAlert("", "Stack group changed successfully!", "success");
      });
    };

    vms.moveToStack = function(stack) {
      var state = (stack.platform === 'web') ? 'stack.health.type' : 'stack.dashboard';
      $state.go(state, {
        id: stack._id,
        type: 'performance'
      });
    };

    vms.delete = function(stack, index) {
      Stack.delete(stack._id, function(err, data) {
        if (err && err.status === 401) return sweetAlert("Canceled!", "You do not have permissions to delete this stack", "error");
        if (err) return console.log('delete stack err', err);
        $rootScope.$broadcast('stackDeleted', {
          stack: stack
        });
      });
    };

    var storageType = localStorageService.getStorageType();
    var filter_type = localStorageService.get('stacks_filter_type');
    if (!filter_type) {
      vms.filer_view = 'grid';
      localStorageService.set('stacks_filter_type', 'grid');
    } else {
      if (filter_type == 'grid')
        vms.filer_view = 'grid';
      else
        vms.filer_view = 'list';
    }

    vms.change_view_filter = function(type) {
      if (type == 'grid') {
        vms.filer_view = 'grid';
        localStorageService.set('stacks_filter_type', 'grid');
      } else {
        vms.filer_view = 'list';
        localStorageService.set('stacks_filter_type', 'list');
      }
    };

    vms.openModal = function(size) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'addStackModal',
        controller: 'ModalsController as vmodal',
        windowClass: 'addStackModalClass',
        resolve: {
          vms: function() {
            return vms;
          },
          vm: function() {
            return $scope.vm
          }
        }
      });
    };

    MeanSocket.emit('user joined token', {
      id: $scope.global.user.profile.token
    });

    $scope.$on('update stack tabs', function(event, args) {
      displayBuildsTabs();
    });

    vms.showStacksDropdows = false;
    vms.showStacksDrop = function() {
      vms.showStacksDropdows = !vms.showStacksDropdows;
    }

    var options = {
      populate: true
    };

    vms.allStacks = [];
    Stacks.find(options, function(err, data) {
      if(err) {
          return console.log('find stacks error', err);
      } else {
          vms.allStacks = data;
      }
    });
  }

  // $scope.findOne = function() {
  //   // var id = $stateParams.id;
  //   var id = '57d7d37156c8c7addefa0996';
  //   $stateParams.id = id;
  //   Stack.findOne(id, function(data) {
  //     $scope.stack = data;
  //     console.log($scope.stack);
  //     var tag = {value: 'xxx2'};
  //     Tags.create(tag, $scope.stack, function(err, data) {
  //       console.log(err);
  //       console.log(data);
  //     });
  //   });
  // };

]);