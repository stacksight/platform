'use strict';

/* jshint -W098 */
angular.module('mean.stacks').controller('InventoryController', [
    '$scope', 'Global', 'Appsun', '$stateParams', 'Inventory', '$timeout', '$location', 'Sapi', '$filter', '_',
    '$uibModal', '$log', '$element', 'Apps', 'slideMenu', 'Stacks', 'Stacksun',
    function($scope, Global, Appsun, $stateParams, Inventory, $timeout, $location, Sapi, filter, _, $uibModal, $log, $element, Apps, slideMenu,
             Stacks, Stacksun) {

        var vmin = this;
        // $stateParams.appId = '57d7d37156c8c7addefa0996';
        var appId = $stateParams.appId;

        var default_title = 'All stacks'
        vmin.vm = $scope.vm;
        vmin.autoSearchOpts = {
            index: 'extensions',
            type: 'extension',
            searchField: 'nameNversion',
            appId: appId,
            displayFields: 'nameNversion,label,version,name',
            min: 2
        };

        vmin._ = _;

        vmin.actions = [{
            name: 'sendEmail',
            title: 'send email',
            _function: vmin.openEmailModal
        }];

        vmin.stacksFilters = {};

        vmin.init = function() {
            vmin.filter_tags = {};
            if (vmin.stacks && vmin.stacks.length === 0) vmin.showAddStacks = true;
            vmin.title = default_title;
            Inventory.info(appId, function(err, data) {
                if (err) return console.log('inventory count err', err);
                vmin.info = data;
            });
        };

        vmin.uvisibleColumn = function(key) {
            if (vmin.filter.visible_columns[key].visible === true) {
                var i = _.reduce(vmin.filter.visible_columns, function(memo, num) {
                    if (num.visible === true) {
                        return memo + 1;
                    } else {
                        return memo;
                    }
                }, 0);
                if (i > 1) {
                    vmin.filter.visible_columns[key].visible = false;
                }
            } else {
                vmin.filter.visible_columns[key].visible = true;
            }

            saveAppDetails();
        }

        $scope.selected_stacks_array = [];
        vmin.selected_stacks_count = 0;

        vmin.selectState = null;
        $scope.transfer_stacks_array = null;
        vmin.selectStack = function(stack){
            if(!vmin.selectState || vmin.selectState && vmin.selectState != stack._id){
                vmin.selectState = stack._id;
                $stateParams.id = stack._id;
                if($scope.selected_stacks_array.length == 0){
                    $scope.transfer_stacks_array = [stack._id];
                }
            } else{
                vmin.selectState = null;
                $scope.transfer_stacks_array = null;
            }
        }

        vmin.vm.$scope.$watch('selected_stacks_array', function(item) {
            vmin.selected_stacks_count = vmin.vm.selected_stacks_count;
            $scope.selected_stacks_array = vmin.selected_stacks_count.length;
            vmin.selected_stacks = _.object($scope.selected_stacks_array, $scope.selected_stacks_array) || {};
        });

        vmin.statusOfSelectAllButton = true;
        vmin.selected_stacks = [];

        vmin.selectAllStatus = false;
        vmin.selectAllStacks = function(){
            if(vmin.vm.stacks.length > 0){
                for(var i = 0; i < vmin.vm.stacks.length; ++i){
                    vmin.checkStack(vmin.vm.stacks[i]);
                    if(vmin.selectAllStatus == false){
                        vmin.selected_stacks[vmin.vm.stacks[i]._id] = true;
                    } else{
                        vmin.selected_stacks[vmin.vm.stacks[i]._id] = false;
                    }
                }
                vmin.statusOfSelectAllButton = !vmin.statusOfSelectAllButton;
                vmin.selectAllStatus = !vmin.selectAllStatus;
            }
        }

        vmin.checkStack = function(stack){
            vmin.vm.checkStack(stack, true, vmin.selectAllStatus);
            vmin.selected_stacks_count = vmin.vm.selected_stacks_count;
            $scope.selected_stacks_array = vmin.vm.selected_stacks_array;
        }

        function saveAppDetails() {
            $scope.vm.app.inventoryVisibleColumns = [];
            for (var index in vmin.filter.visible_columns) {
                if (vmin.filter.visible_columns[index].visible)
                    $scope.vm.app.inventoryVisibleColumns.push(index);
            }
            var data = {
                app: {
                    inventoryVisibleColumns: $scope.vm.app.inventoryVisibleColumns
                },
                action: 'updateDetails'
            };
            Apps.update($scope.vm.app._id, data, function(err, data) {
                console.log('save app response', err, data);
            });
        }

        vmin.tagsPopover = {
            templateUrl: 'stack-popover-tags',
            content: []
        };

        vmin.setPopoverTags = function(tags){
            vmin.tagsPopover.content = tags;
        }

        vmin.setted_preset = false;
        vmin.setFilter = function($event, col) {
            vmin.title = col.title;
            vmin.filters_enabled = col.data;
            vmin.setted_preset = col._id;
        }

        vmin.filterByTag = function(tag, company){
            if(vmin.filter_tags[tag.tag]){
                delete vmin.filter_tags[tag.tag];
            } else{
                vmin.filter_tags[tag.tag] = tag.value;
            }

            var options = {
                populate: true,
                tags: _.keys(vmin.filter_tags)
            };
            if (tag && tag.desc === 'company' && company)
                options.company = company._id;

            Stacks.find(options, function(err, data) {
                if(err){
                    return console.log('find stacks error', err);
                } else{
                    $scope.vm.stacks = data;
                    setSelectedStacksObj(data);
                    // vmin.filterInventory();
                }
            });
        }

        function setSelectedStacksObj(data) {
            data.forEach(function(s) {
                vmin.selected_stacks[s._id] = true;
            });
        }

        $scope.$watch('vm.stacks', function(newVal, oldVal){
            // vmin.filterInventory();
        });

        vmin.filterInventory = function() {
            var ids = [];
            for(var i = 0; i < $scope.vm.stacks.length; i++){
                ids.push($scope.vm.stacks[i]._id);
            }
            var inv_options = {};
            inv_options.index = 'inventory';
            inv_options.from = 0;
            inv_options.size = ids.length;
            inv_options.type = 'inventory';
            inv_options.query = {
                ids: ids
            };
            $scope.info = [];

            Stacksun.inventory(inv_options, function(data) {
                if(data && data.docs && data.docs.length){
                    $scope.inventory = data;
                    for(var i = 0; i < data.docs.length; ++i){

                        var count_all = 0;
                        var count_active = 0;
                        var theme = '';

                        for(var j = 0; j < data.docs[i]._source.data.length; j++){
                            if(data.docs[i]._source.data[j].type == 'plugin'){
                                ++count_all;
                                if(data.docs[i]._source.data[j].active == true){
                                    ++count_active;
                                }
                            }
                            if(data.docs[i]._source.data[j].type == 'theme' && data.docs[i]._source.data[j].current == true){
                                theme = data.docs[i]._source.data[j].label;
                            }
                        }

                        if(!$scope.info[data.docs[i]._id]){
                            var info_object = {count_all: count_all, count_active: count_active, active_themes: theme};
                            $scope.info[data.docs[i]._id] = info_object;
                            // if(data.docs[i]._id == '587cc66c3aa38cd3f7385d57'){
                            //     console.log('SET DOUBLE FOR 587cc66c3aa38cd3f7385d57', info_object);
                                // console.log($scope.info[data.docs[i]._id], typeof  $scope.info[data.docs[i]._id]);
                                // console.log($scope.info[data.docs[i]._id]);
                            // }
                        }
                        //
                        //
                        // } else{
                        //     $scope.info[data.docs[i]._id].count_all = count_all;
                        //     $scope.info[data.docs[i]._id].count_active = count_active;
                        //     $scope.info[data.docs[i]._id].active_themes = theme;
                        // }


                    }
                }
            });
            //$scope.transfer_stacks_array = ids;
        }

        vmin.filter = {};

        vmin.filter.presets = [{
            _id: 1,
            title: 'Drupal presets',
            data: {
                "inventory_has_updates": {
                    "type": "more",
                    "value": 86400
                },
                "security_has_updates": {
                    "type": "less",
                    "value": "2592000"
                },
                "inventory_size": {
                    "type": "text",
                    "value": "#1"
                },
                "security_warnings": {
                    "type": "more",
                    "value": 86400
                }
            }
        }, {
            _id: 2,
            title: 'WP presets',
            data: {
                "inventory_has_updates": {
                    "type": "more",
                    "value": 86400
                },
                "security_has_updates": {
                    "type": "less",
                    "value": "2592000"
                },
                "inventory_size": {
                    "type": "text",
                    "value": "#2"
                },
                "security_warnings": {
                    "type": "more",
                    "value": 86400
                }
            }
        }, {
            _id: 3,
            title: 'Bla bla bla',
            data: {
                "inventory_has_updates": {
                    "type": "more",
                    "value": 86400
                },
                "security_has_updates": {
                    "type": "less",
                    "value": "2592000"
                },
                "inventory_size": {
                    "type": "text",
                    "value": "#3"
                },
                "security_warnings": {
                    "type": "more",
                    "value": 86400
                }
            }
        }, {
            _id: 4,
            title: 'QWERTY',
            data: {
                "inventory_has_updates": {
                    "type": "more",
                    "value": 86400
                },
                "security_has_updates": {
                    "type": "less",
                    "value": "2592000"
                },
                "inventory_size": {
                    "type": "text",
                    "value": "#4"
                },
                "security_warnings": {
                    "type": "more",
                    "value": 86400
                }
            }
        }, {
            _id: 5,
            title: 'XXX-YYY',
            data: {
                "inventory_has_updates": {
                    "type": "more",
                    "value": 86400
                },
                "security_has_updates": {
                    "type": "less",
                    "value": "2592000"
                },
                "inventory_size": {
                    "type": "text",
                    "value": "#5"
                },
                "security_warnings": {
                    "type": "more",
                    "value": 86400
                }
            }
        }];

        vmin.deleteFilter = function(id) {
            var filters = _.reject(vmin.filter.presets, function(filter) {
                return filter._id == id;
            });
            vmin.filter.presets = filters;

            if (vmin.setted_preset == id) {
                vmin.title = default_title;
                vmin.filters_enabled = {};
            }
        }

        var options = {};
        options.index = 'inventory';
        options.from = 0;
        options.size = 1;
        options.type = 'inventory';

        vmin.search = function(data) {
            var _options = options;
            _options.name = data.name[0];
            if (data.version) _options.version = data.version[0];
            vmin.showLoader = true;
            Inventory.search(options, function(err, data) {
                vmin.showLoader = false;
                if (err) $scope.vm.stacks = [];
                else $scope.vm.stacks = data;
                vmin.selected_stacks = {};
                setSelectedStacksObj(data);
                
                // vmin.title = $scope.vm.app.name + ' stacks (' + vmin.stacks.length + ')';
            });
        };

        vmin.stack = {};

        vmin.editFilter = function(id) {
            vmin.modalEditOpen('lg', id);
        }
        var defaultVisibleColumns = ['actions_checkbox', 'stack_ico', 'installed_components', 'stack_title', 'name', 'active_theme', 'public', 'last_login', 'space_used'];
        // vmin.filter.visible_columns = {
        //     stack_ico: {
        //         field: 'platform',
        //         name: 'Stack Icon',
        //         visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('stack_ico') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('stack_ico') > -1)),
        //         sortable: true
        //     },
        //     stack_title: {
        //         field: 'title',
        //         name: 'Stack Title',
        //         visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('stack_title') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('stack_title') > -1)),
        //         sortable: true
        //     },
        //     name: {
        //         field: 'name',
        //         name: 'Name',
        //         visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('name') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('name') > -1)),
        //         sortable: true
        //     },
        //     url: {
        //         field: '',
        //         name: 'Url',
        //         visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('url') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('url') > -1)),
        //         sortable: true
        //     },
        //     active_theme: {
        //         field: '',
        //         name: 'Active Theme',
        //         visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('active_theme') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('active_theme') > -1)),
        //         sortable: true
        //     },
        //     public: {
        //         field: '',
        //         name: 'Public',
        //         visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('public') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('public') > -1)),
        //         sortable: true
        //     },
        //     space_used: {
        //         field: '',
        //         name: 'Size',
        //         visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('space_used') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('space_used') > -1)),
        //         sortable: true
        //     },
        //     installed_components: {
        //         field: '',
        //         name: 'Components',
        //         visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('installed_components') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('installed_components') > -1)),
        //         sortable: true
        //     },
        //     last_login: {
        //         field: '',
        //         name: 'Last Login',
        //         visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('last_login') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('last_login') > -1)),
        //         sortable: true
        //     },
        //     // gravity_forms: {
        //     //     field: '',
        //     //     name: 'Gravity Forms',
        //     //     visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('gravity_forms') > -1) || defaultVisibleColumns.indexOf('gravity_forms') > -1) ,
        //     //     sortable: true
        //     // },
        //     sts_version: {
        //         field: '',
        //         name: 'Stacksight Version',
        //         visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('sts_version') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('sts_version') > -1)),
        //         sortable: true
        //     },
        //     actions_checkbox: {
        //         field: '',
        //         name: 'Actions',
        //         visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('actions_checkbox') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('actions_checkbox') > -1)),
        //         sortable: true
        //     },
        //     owner: {
        //         field: '',
        //         name: 'Owner',
        //         visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('owner') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('owner') > -1)),
        //         sortable: true
        //     }
        //     /*,
        //      wpml_language: {
        //      field: '',
        //      name: 'WPML Language',
        //      visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('wpml_language') > -1) || ((!$scope.vm.app.inventoryVisibleColumns ||  !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('wpml_language') > -1)) ,
        //      sortable: true
        //      }*/
        // };

        vmin.filters_enabled = {};

        vmin.checkAll = function() {
            angular.forEach(vmin.stacks, function(s) {
                s.selected = vmin.selectedAll;
            });
        };

        vmin.openEmailModal = function(size) {
            var emails = [],
                selected = 0;
            angular.forEach(vmin.stacks, function(s) {
                if (s.selected) {
                    selected ++;
                    if (s.data && s.data.owner && s.data.owner.user_mail)
                        emails.push(s.data.owner.user_mail);
                }
            });

            var message = (selected === 0) ? 'Select stacks' :
                (selected === 1) ? 'Your site is missing owner. At this time you don\'t have email feature' :
                    'Your sites are missing owner. At this time you don\'t have email feature';

            if (!emails.length) return sweetAlert("", message, "error");
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'sendEmailModal',
                size: size,
                controller: EmailModalInstanceCtrl,
                resolve: {
                    _: function() {
                        return _;
                    },
                    emails: function() {
                        return emails;
                    }
                }
            });

            modalInstance.getFiltersEnabled = function() {
                return vmin.filters_enabled;
            }

        };

        vmin.getFilters = function(filters) {
            filters = typeof filters !== 'undefined' ? filters : vmin.filters_enabled;
            vmin.modalFilters = [];
            angular.copy(vmin.filters, vmin.modalFilters);
            var in_array = function(needle, haystack, strict) {
                var found = false,
                    key, strict = !!strict;
                for (key in haystack) {
                    if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
                        found = true;
                        break;
                    }
                }
                return found;
            }
            _.each(vmin.modalFilters, function(val, key) {
                var get_options = function(val) {
                    var filters_enabled = _.keys(filters);
                    var options = val.options;
                    var options = _.sortBy(_.filter(options, function(option) {
                        return in_array(option, filters_enabled) == false
                    }), 'title');
                    return options;
                };

                var didnt_use_options = get_options(val);
                val.options = {};
                if (didnt_use_options.length > 0) {
                    _.each(didnt_use_options, function(value) {
                        val.options[value] = vmin.filter_options[value];
                    });
                }
            });

            var total_using_filters = _.filter(vmin.modalFilters, function(val, key) {
                return (val.options && _.size(val.options) > 0);
            });

            return total_using_filters;
        };

        vmin.filters = [{
            group: 'inventory',
            title: 'Inventory',
            options: [
                'inventory_has_updates', 'inventory_size'
            ]
        }, {
            group: 'security',
            title: 'Security',
            options: [
                'security_warnings', 'security_has_updates'
            ]
        }];

        vmin.filter_options = {
            inventory_has_updates: {
                title: 'Inventory has updates',
                type: 'select',
                options: [{
                    title: 'More than',
                    value: 'more',
                    options: [{
                        title: '1 Week',
                        value: 86400
                    }, {
                        title: '6 Month',
                        value: 604800
                    }, {
                        title: '1 Year',
                        value: 2592000
                    }]
                }, {
                    title: 'Less than',
                    value: 'less',
                    options: [{
                        title: '1 Day',
                        value: 86400
                    }, {
                        title: '3 Weeks',
                        value: 604800
                    }, {
                        title: '1 Month',
                        value: 2592000
                    }]
                }]
            },
            inventory_size: {
                title: 'Inventory size',
                type: 'text'
            },
            security_warnings: {
                title: 'Security has updates',
                type: 'select',
                options: [{
                    title: 'More than',
                    value: 'more',
                    options: [{
                        title: '1 Day',
                        value: 86400
                    }, {
                        title: '3 Weeks',
                        value: 604800
                    }, {
                        title: '1 Month',
                        value: 2592000
                    }]
                }, {
                    title: 'Less than',
                    value: 'less',
                    options: [{
                        title: '1 Day',
                        value: 86400
                    }, {
                        title: '3 Weeks',
                        value: 604800
                    }, {
                        title: '1 Month',
                        value: 2592000
                    }]
                }]
            },
            security_has_updates: {
                title: 'Security is dismissed',
                type: 'select',
                options: [{
                    title: 'More than',
                    value: 'more',
                    options: [{
                        title: '1 Day',
                        value: 86400
                    }, {
                        title: '3 Weeks',
                        value: 604800
                    }, {
                        title: '1 Month',
                        value: 2592000
                    }]
                }, {
                    title: 'Less than',
                    value: 'less',
                    options: [{
                        title: '1 Day',
                        value: 86400
                    }, {
                        title: '3 Weeks',
                        value: 604800
                    }, {
                        title: '1 Month',
                        value: 2592000
                    }]
                }]
            }
        };
        vmin.modalOpen = function(size) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'advancedFilterModal',
                size: size,
                controller: ModalInstanceCtrl,
                resolve: {
                    items: function() {
                        return vmin.getFilters();
                    },
                    filters_enabled: function() {
                        return vmin.filters_enabled;
                    },
                    filter_options: function() {
                        return vmin.filter_options;
                    },
                    _: function() {
                        return _;
                    }
                }
            });

            modalInstance.getFiltersEnabled = function() {
                return vmin.filters_enabled;
            }

            modalInstance.removeActiveFilter = function(filter_key) {
                vmin.filters_enabled = _.omit(vmin.filters_enabled, filter_key);
                var filters = vmin.getFilters();
                return {
                    items: filters,
                    filters: vmin.filters_enabled
                };
            };

            modalInstance.addOptionToFilter = function(option_key, option) {
                switch (vmin.filter_options[option_key].type) {
                    case 'select':
                        vmin.filters_enabled[option_key] = {
                            type: vmin.filter_options[option_key]['options'][0].value,
                            value: vmin.filter_options[option_key]['options'][0]['options'][0].value
                        }
                        break;
                    default:
                        vmin.filters_enabled[option_key] = {
                            type: vmin.filter_options[option_key].type,
                            value: ''
                        }
                        break;
                }

                var filters = vmin.getFilters();
                return {
                    items: filters,
                    filters: vmin.filters_enabled
                };
            }

            $scope.toggleAnimation = function() {
                $scope.animationsEnabled = !$scope.animationsEnabled;
            };
        };

        vmin.modalEditOpen = function(size, id) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'editFilterModal',
                size: size,
                controller: EditModalInstanceCtrl,
                resolve: {
                    id: function() {
                        return id;
                    },
                    title: function() {
                        var filtersEnabled = _.findWhere(vmin.filter.presets, {
                            _id: id
                        });
                        return filtersEnabled.title;
                    },
                    items: function() {
                        var filtersEnabled = _.findWhere(vmin.filter.presets, {
                            _id: id
                        });
                        return vmin.getFilters(filtersEnabled.data);
                    },
                    filters_enabled: function() {
                        var filtersEnabled = _.findWhere(vmin.filter.presets, {
                            _id: id
                        });
                        return filtersEnabled.data;
                    },
                    filter_options: function() {
                        return vmin.filter_options;
                    },
                    _: function() {
                        return _;
                    }
                }
            });

            modalInstance.getFiltersEnabled = function(id) {
                var filtersEnabled = _.findWhere(vmin.filter.presets, {
                    _id: id
                });
                return filtersEnabled.data;
            }

            modalInstance.removeActiveFilter = function(filter_key, id) {
                var filtersEnabled = _.findWhere(vmin.filter.presets, {
                    _id: id
                });
                filtersEnabled = _.omit(filtersEnabled.data, filter_key);
                vmin.filter.presets = _.map(vmin.filter.presets, function(val, key) {
                    if (val._id == id) {
                        val.data = filtersEnabled
                        return val;
                    } else return val;
                });
                var filters = vmin.getFilters(filtersEnabled);
                return {
                    items: filters,
                    filters: filtersEnabled
                };
            };

            modalInstance.addOptionToFilter = function(option_key, option, id) {
                var filter_pre = {};
                switch (vmin.filter_options[option_key].type) {
                    case 'select':
                        filter_pre[option_key] = {
                            type: vmin.filter_options[option_key]['options'][0].value,
                            value: vmin.filter_options[option_key]['options'][0]['options'][0].value
                        }
                        break;
                    default:
                        filter_pre[option_key] = {
                            type: vmin.filter_options[option_key].type,
                            value: ''
                        }
                        break;
                }
                var filtersEnabled = _.findWhere(vmin.filter.presets, {
                    _id: id
                });
                filtersEnabled.data[option_key] = filter_pre[option_key];
                vmin.filter.presets = _.map(vmin.filter.presets, function(val, key) {
                    if (val._id == id) {
                        val = filtersEnabled;
                        return val;
                    } else return val;
                });
                var filters = vmin.getFilters(filtersEnabled.data);

                return {
                    items: filters,
                    filters: filtersEnabled.data
                };
            }

            $scope.toggleAnimation = function() {
                $scope.animationsEnabled = !$scope.animationsEnabled;
            };
        };

        vmin.closePopover = function(id) {
            var popover = document.getElementById(id);
            angular.element(popover).scope().isOpen = false;
        }

        vmin.noResultChanged = function(noResults, value) {
            if (noResults && value) vmin.stacks = [];
        };
        vmin.noText = function() {
            vmin.init();
        };


        var EditModalInstanceCtrl = function($scope, $modalInstance, items, title, filters_enabled, filter_options, id, _) {
            $scope.using_all_edit_filters = false;
            $scope.items = items;
            $scope.title = title;
            $scope.filters_enabled = filters_enabled;
            $scope.filter_options = filter_options;
            $scope._ = _;

            $scope.id = id;

            $scope.ok = function() {
                $modalInstance.close();
            };
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };

            if ($scope.items.length == 0) {
                $scope.using_all_edit_filters = true;
            } else {
                $scope.using_all_edit_filters = false;
            }

            $scope.selectOption = function(option_key, option, id) {
                var result = $modalInstance.addOptionToFilter(option_key, option, id);

                $scope.items = result.items;
                $scope.filters_enabled = result.filters;

                if ($scope.items.length == 0) {
                    $scope.using_all_edit_filters = true;
                } else {
                    $scope.using_all_edit_filters = false;
                }
            };

            $scope.removeActiveFilter = function(filter_key, id) {
                var new_object = $modalInstance.removeActiveFilter(filter_key, id);
                $scope.items = new_object.items;
                $scope.filters_enabled = new_object.filters;
                if ($scope.items.length == 0) {
                    $scope.using_all_edit_filters = true;
                } else {
                    $scope.using_all_edit_filters = false;
                }
            }
        }

        var ModalInstanceCtrl = function($scope, $modalInstance, items, filters_enabled, filter_options, _) {
            $scope.using_all_filters = false;
            $scope.items = items;
            $scope.filters_enabled = filters_enabled;
            $scope.filter_options = filter_options;
            $scope._ = _;
            $scope.ok = function() {
                $modalInstance.close();
            };
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };

            if ($scope.items.length == 0) {
                $scope.using_all_filters = true;
            } else {
                $scope.using_all_filters = false;
            }

            $scope.selectOption = function(option_key, option) {
                var result = $modalInstance.addOptionToFilter(option_key, option);

                $scope.items = result.items;
                $scope.filters_enabled = result.filters;

                if ($scope.items.length == 0) {
                    $scope.using_all_filters = true;
                } else {
                    $scope.using_all_filters = false;
                }
            };

            $scope.removeActiveFilter = function(filter_key) {
                var new_object = $modalInstance.removeActiveFilter(filter_key);
                $scope.items = new_object.items;
                $scope.filters_enabled = new_object.filters;

                if ($scope.items.length == 0) {
                    $scope.using_all_filters = true;
                } else {
                    $scope.using_all_filters = false;
                }
            }
        };

        var EmailModalInstanceCtrl = function($scope, $modalInstance, _, emails) {
            $scope.ok = function(valid) {
                if (!valid) return alert('Message can not be empty');
                $modalInstance.close();
                Inventory.sendEmail(appId, emails, $scope.body, function(err, data) {
                    console.log(err, data);
                    if (err) return sweetAlert("Cancelled", ":(  The mail has not been sent, try again", "error");
                    sweetAlert("Mail sent successfully!", "", "success");
                });
            };
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
        };


        vmin.initStack = function(stackId) {
            vmin.stacksFilters[stackId] = {};
            vmin.stacksFilters[stackId].search_enabled = true;
            vmin.stacksFilters[stackId].search_disabled = true;
            vmin.stacksFilters[stackId].search_modules = true;
            vmin.stacksFilters[stackId].search_themes = true;
        };

        vmin.searchSetType = function(type) {
            vmin.searchType = type;
        }


        vmin.componentAllFilter = function(item, stack) {

            if (vmin.stacksFilters[item.appId].search_modules && (item.type == 'module' || item.type == 'plugin')) {
                if (vmin.stacksFilters[item.appId].search_enabled && item.active) {
                    return true;
                }

                if (vmin.stacksFilters[item.appId].search_disabled && !item.active) {
                    return true;
                }
            }

            if (vmin.stacksFilters[item.appId].search_themes && item.type == 'theme') {
                if (vmin.stacksFilters[item.appId].search_enabled && item.active) {
                    return true;
                }

                if (vmin.stacksFilters[item.appId].search_disabled && !item.active) {
                    return true;
                }
            }
        }

        $scope.componentEnabledFilter = function(item) {
            if (vmin.searchType == 'all') {
                return (item.active == true);
            } else if (vmin.searchType == 'module') {
                return (item.active == true && (item.type == 'module' || item.type == 'plugin'));
            } else {
                return (item.active == true && item.type == vmin.searchType);
            }
        }
    }
]);