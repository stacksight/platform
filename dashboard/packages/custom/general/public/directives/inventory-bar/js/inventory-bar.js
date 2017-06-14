angular.module('mean.general').directive('inventoryBar', ['$state', '$compile', 'Appsun', 'Stacksun', 'EventsComponents', '$anchorScroll', '$window', 'Inventory', '_',
    function ($state, $compile, Appsun, Stacksun, EventsComponents, $anchorScroll, $window, Inventory, _) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/general/directives/inventory-bar/views/inventory-bar.html',
            // transclude: true,
            scope: {
                ids: '=ngIds',
                transferIds: '=ngTransferIds',
                inventory: '=ngInvemtory',
                stacks: '='
            },
            
            link: function (scope, element, attrs) {

                var options = {
                    index: 'inventory',
                    from: 0,
                    size: 0,
                    type: 'inventory',
                    query: {}
                };

                function find(checkCompany, options) {
                    if (checkCompany && $state.params.companyId !== 'all') options.query.company = $state.params.companyId;
                    else delete options.query.company;
                    Stacksun.aggregation('inventory', options, function (data) {
                        delete options.query.company; // we work now with ids;
                        var docs = data.map(function (o) {
                            return o['top-types-hits'].hits.hits[0]
                        });
                        prepareData(docs);
                    });
                }

    

                function prepareData(data) {

                    var inventoryItems = {};
                    scope.countInventoryItems = 0;

                    if (data && data.length > 0) {
                        data.forEach(function (doc) {
                            doc._source.data.forEach(function (inv) {
                                if (!inventoryItems[inv.platform + '_' + inv.name + '_' + inv.type + '_' + inv.version]) {
                                    inventoryItems[inv.platform + '_' + inv.name + '_' + inv.type + '_' + inv.version] = inv;
                                    scope.countInventoryItems++;
                                }
                            });
                            var pritems = [];
                            for (object_item in inventoryItems) {
                                pritems.push(inventoryItems[object_item]);
                            }
                            scope.precessedInventory = pritems;
                        });
                    }

                }
             

                scope.$watch('ids', function (newVal, oldVal) {
                    if (Object.keys(newVal).length === 0 && newVal.constructor === Object) return find(true, options);
                    var ids = [];
                    for(var index in newVal) {
                        if (newVal[index]) ids.push(index);
                    }
                    delete options.query.company;
                    options.query.ids = ids;
                    find(false, options);
                   
                }, true);

                scope.search = {};
            }
        };
    }
]);