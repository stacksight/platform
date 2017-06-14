'use strict';

/* jshint -W098 */
angular.module('mean.stacks').controller('RepositoryController', ['$scope', 'Global', 'Appsun', '$stateParams', 'MeanSocket', '$timeout', '$location', '$anchorScroll',
    function($scope, Global, Appsun, $stateParams, MeanSocket, $timeout, $location, $anchorScroll) {

        $scope.global = Global;

        var vmr = this;


        var options = {};
        options.id = $stateParams.id;
        options.index = 'integrations*';
        options.from = 0;
        options.size = 100;
        options.query = {};
        options.type = 'integrations-github,integrations-gitlab,integrations-bitbucket';

        vmr.docs = [];
        vmr.busy = false;
        var hasMore = true;


        function initSearch() {
            vmr.docs = [];
            options.from = 0;
            hasMore = true;
        }

        vmr.find = function() {

            if (!hasMore) return;

            vmr.busy = true;

            Appsun.repository(options, function(data) {
                vmr.busy = false;
                if (!data) return;
                if (!data.docs.length) hasMore = false;
                data.docs.forEach(function(doc) {
                    doc._created = new Date(doc._source.created).setHours(0, 0, 0, 0);
                    doc.src = doc._type.split('-')[1]; //github/gitlab/bitbucket,etc..
                    vmr.docs.push(doc);
                });
            });
        };

        vmr.loadMore = function() {
            if (vmr.busy) return;
            options.from++;
            vmr.find();
        };

    }
]);
