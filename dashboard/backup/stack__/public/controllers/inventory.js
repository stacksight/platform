'use strict';

/* jshint -W098 */
angular.module('mean.stack').controller('InventoryStacksController', ['$scope', 'Global', 'Appsun', '$stateParams', 'MeanSocket', '$timeout', '$location', 'Sapi',
    function($scope, Global, Appsun, $stateParams, MeanSocket, $timeout, $location, Sapi) {

        var vminv = this;

        var options = {};
        options.id = $stateParams.id;
        options.index = 'inventory';
        options.from = 0;
        options.size = 1;
        options.type = 'inventory';

        vminv.docs = [];
        vminv.busy = false;

        vminv.find = function() {

            vminv.busy = true;
            Appsun.inventory(options, function(data) {
                console.log(data, 'inventory');
                vminv.busy = false;
                if (!data || !data.docs.length) return;
                if (data.docs[0]._source && data.docs[0]._source.data) {
                    vminv.inventory = data.docs[0]._source.data;
                    vminv.lastUpdated = data.docs[0]._source.created;
                }
            });
        };
    }
]);
