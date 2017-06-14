'use strict';

/* jshint -W098 */
angular.module('mean.apps').controller('InventoryController', ['$scope', 'Global', 'Appsun', '$stateParams', 'Inventory', '$timeout', '$location', 'Sapi', '$filter', '_', '$uibModal', '$log', '$element', 'Apps', 'slideMenu',
    function($scope, Global, Appsun, $stateParams, Inventory, $timeout, $location, Sapi, filter, _, $uibModal, $log, $element, Apps, slideMenu) {

        var vmin = this;
        var appId = $stateParams.appId;

        var default_title = 'All stacks'

        vmin.autoSearchOpts = {
            index: 'extensions',
            type: 'extension',
            searchField: 'nameNversion',
            appId: appId,
            displayFields: 'nameNversion,label,version,name',
            min: 2
        };

        vmin.actions = [{
            name: 'sendEmail',
            title: 'send email',
            _function: vmin.openEmailModal
        }];

        vmin.stacksFilters = {};

        vmin.init = function() {
            vmin.stacks = $scope.vm.app.stacks;
            if (vmin.stacks.length === 0) vmin.showAddStacks = true;

            vmin.title = default_title;

            Inventory.info(appId, function(err, data) {
                if (err) return console.log('inventory count err', err);
                vmin.info = data;
            });
        };


        vmin.search = function(data) {
            var options = {
                appId: appId,
                name: data.name[0]
            };
            if (data.version) options.version = data.version[0];
            vmin.showLoader = true;
            Inventory.search(options, function(err, data) {
                vmin.showLoader = false;
                if (err) vmin.stacks = [];
                else vmin.stacks = data;
                vmin.title = $scope.vm.app.name + ' stacks (' + vmin.stacks.length + ')';
            });
        };

        vmin.filer_view = 'list';

        vmin.change_view_filter = function(value) {
            if (value == 'grid')
                vmin.filer_view = 'grid';
            else
                vmin.filer_view = 'list';
        }

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

        vmin.setted_preset = false;
        vmin.setFilter = function($event, col) {
            vmin.title = col.title;
            vmin.filters_enabled = col.data;
            vmin.setted_preset = col._id;
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

        vmin.stack = {};

        vmin.setStackInventory = function(stack) {
            vmin.open_stack = stack._id;
            if (stack.inventory) return;
            stack.showLoader = true;
            options.id = stack._id;
            Appsun.inventory(options, function(data) {
                stack.showLoader = false;
                if (!data || !data.docs.length) return;
                if (data.docs[0]._source && data.docs[0]._source.data) stack.inventory = data.docs[0]._source.data;
                if (!_.isArray(stack.inventory)) return;
                stack.inventory = _.map(stack.inventory, function(o) {
                    o.appId = stack._id;
                    return o;
                });
            });
        };

        vmin.triggerSlideMenu = function(stack, menu_id) {
            vmin.setStackInventory(stack);
            slideMenu.slide(angular.element("#" + menu_id));
        }

        vmin.triggerSlideMenuPopover = function(stack, menu_id) {
            vmin.stack = stack;
            vmin.setStackInventory(stack);
            slideMenu.slide(angular.element("#slide-menu"), stack._id);
        }

        vmin.slideMenu = slideMenu;

        vmin.editFilter = function(id) {
            vmin.modalEditOpen('lg', id);
        }
        var defaultVisibleColumns = ['actions_checkbox', 'stack_ico', 'installed_components', 'stack_title', 'name', 'active_theme', 'public', 'last_login', 'space_used'];
        vmin.filter.visible_columns = {
            stack_ico: {
                field: 'platform',
                name: 'Stack Icon',
                visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('stack_ico') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('stack_ico') > -1)),
                sortable: true
            },
            stack_title: {
                field: 'title',
                name: 'Stack Title',
                visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('stack_title') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('stack_title') > -1)),
                sortable: true
            },
            name: {
                field: 'name',
                name: 'Name',
                visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('name') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('name') > -1)),
                sortable: true
            },
            url: {
                field: '',
                name: 'Url',
                visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('url') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('url') > -1)),
                sortable: true
            },
            active_theme: {
                field: '',
                name: 'Active Theme',
                visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('active_theme') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('active_theme') > -1)),
                sortable: true
            },
            public: {
                field: '',
                name: 'Public',
                visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('public') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('public') > -1)),
                sortable: true
            },
            space_used: {
                field: '',
                name: 'Size',
                visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('space_used') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('space_used') > -1)),
                sortable: true
            },
            installed_components: {
                field: '',
                name: 'Components',
                visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('installed_components') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('installed_components') > -1)),
                sortable: true
            },
            last_login: {
                field: '',
                name: 'Last Login',
                visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('last_login') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('last_login') > -1)),
                sortable: true
            },
            // gravity_forms: {
            //     field: '',
            //     name: 'Gravity Forms',
            //     visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('gravity_forms') > -1) || defaultVisibleColumns.indexOf('gravity_forms') > -1) ,
            //     sortable: true
            // },
            sts_version: {
                field: '',
                name: 'Stacksight Version',
                visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('sts_version') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('sts_version') > -1)),
                sortable: true
            },
            actions_checkbox: {
                field: '',
                name: 'Actions',
                visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('actions_checkbox') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('actions_checkbox') > -1)),
                sortable: true
            },
            owner: {
                field: '',
                name: 'Owner',
                visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('owner') > -1) || ((!$scope.vm.app.inventoryVisibleColumns || !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('owner') > -1)),
                sortable: true
            }
            /*,
            wpml_language: {
                field: '',
                name: 'WPML Language',
                visible: (($scope.vm.app.inventoryVisibleColumns && $scope.vm.app.inventoryVisibleColumns.indexOf('wpml_language') > -1) || ((!$scope.vm.app.inventoryVisibleColumns ||  !$scope.vm.app.inventoryVisibleColumns.length) && defaultVisibleColumns.indexOf('wpml_language') > -1)) ,
                sortable: true
            }*/
        };

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