'use strict';

/* jshint -W098 */
angular.module('mean.stacks').controller('IntegrationsPlatformController', ['$scope', 'Global', 'Stacks', 'Appsun', '$stateParams', 'MeanSocket',
    function($scope, Global, Stacks, Appsun, $stateParams, MeanSocket) {

        var vmip = this;
        vmip.global = Global;
        vmip.cmd =  'platform integration:add --type webhook --url "https://api.stacksight.io/v0.1/integrations/platform?token=' + vmip.global.user.profile.token + '&group=' + $scope.stack.app.name + '"';

        var options = {};
        options.id = $stateParams.id;
        options.index = 'integrations-platform';
        options.from = 0;
        options.size = 200;
        options.type = 'integrations-platform';


        vmip.docs = [];
        vmip.showLoader = true;
        Appsun.platform(options, function(data) {
            vmip.showLoader = false;
            if (!data || !data.docs) return;
            console.log(data.docs.length);
            data.docs.forEach(function(o) {
                if (!vmip.project) vmip.project = o._source.data.project;
                prepereItem(o);
                vmip.docs.push(o);
            });
        });

        function prepereItem(o) {
            o.data = o._source.data;
            o.result = o.data.result;
            o.type = o.data.type.replace('environment.', '');
            o.id = o.data.id;
            o.comment = o.data.log;
            o.title = o.data.payload.user.display_name /* + ' ' + o.data.type + ' ' + o.data.environments[0]*/ ;
            o.environment = (o.data.payload.environment) ? o.data.payload.environment.name : '';
            o.title = o.title + ' ' +
                ((o.type === 'branch') ? 'branched environment ' + o.data.environments[0] + ' from ' + o.data.environments[1] :
                    (o.type === 'push') ? 'pushed to ' + o.environment :
                    (o.type === 'variable.create') ? 'added variable ' + o.data.payload.variable.id :
                    (o.type === 'deactivate') ? 'deactivated environment ' + o.environment :
                    (o.type === 'activate') ? 'activated environment ' + o.environment :
                    (o.type === 'backup') ? 'created a snapshot of ' + o.environment :
                    (o.type === 'update.http_access') ? 'updated HTTP Access settings on environment ' + o.environment :
                    (o.type === 'synchronize') ? 'synced ' + o.data.parameters.into + '\'s' + ((o.data.parameters.synchronize_data) ? ' data ' : '') + ((o.data.parameters.synchronize_data && o.data.parameters.synchronize_code) ? '&' : '') + ((o.data.parameters.synchronize_code) ? ' code' : '') : '');
            o.created = o.data.created_at;
        }

        vmip.types = {
            pushed: {
                title: 'Pushed',
                name: 'pushed',
                ico_img: '/stacks/assets/img/arrow_right.png',
                color: '#0e6b93',
                enabled: true
            },
            branched: {
                title: 'Branched',
                name: 'branched',
                ico_img: '/stacks/assets/img/arrow_top.png',
                color: '#e89300',
                enabled: true
            }
        };

        vmip.closePopover = function(id) {
            var popover = document.getElementById(id);
            angular.element(popover).scope().isOpen = false;
        }

        // vmip.exampleJson = [{
        //     title: 'Lior some push to dev branch',
        //     type: 'pushed',
        //     status: true,
        //     date: '1 month ago',
        //     info: {
        //         hash: '123abcd235423423',
        //         comment: 'some comment'
        //     }
        // }, {
        //     title: 'Lior some push to dev branch #2',
        //     type: 'pushed',
        //     status: true,
        //     date: '1 month ago',
        //     info: {
        //         hash: '1243addf236443523',
        //         comment: 'some comment'
        //     }
        // }, {
        //     title: 'Orit create new branch from develop branch',
        //     type: 'branched',
        //     status: true,
        //     date: '10 days ago',
        //     info: {
        //         hash: '543abcd235343423',
        //         comment: 'some comment'
        //     }
        // }];
        MeanSocket.on('log added', function(log) {
            if (log._source.appId === $stateParams.id && log._type.indexOf('platform') !== -1) {
                console.log('------LOG ADDED----', log);
                prepereItem(log);
                vmip.docs.unshift(log);
            }
        });
    }

]);
