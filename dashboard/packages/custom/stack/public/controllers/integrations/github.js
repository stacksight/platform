'use strict';

/* jshint -W098 */
angular.module('mean.stack').controller('IntegrationsGihubController', ['$scope', 'Global', 'Stacks', 'Appsun', '$stateParams', 'MeanSocket', 'ConfigApp',
    function($scope, Global, Stacks, Appsun, $stateParams, MeanSocket, ConfigApp) {

        var vmigh = this;
        vmigh.global = Global;

        var options = {};
        options.id = $stateParams.id;
        options.index = 'integrations-github';
        options.from = 0;
        options.size = 200;
        options.type = 'integrations-github';

        ConfigApp.get().then(function(config) {
            vmigh.cmd = config.apiHost + '/integrations/webhook/github?type=event&token=' + vmigh.global.user.profile.token + '&appId=' + $scope.stack._id;
        });

        vmigh.docs = [];
        Appsun.github(options, function(data) {
            if (!data || !data.docs) return;
            data.docs.forEach(function(o) {
                prepereItem(o);
                vmigh.docs.push(o);
            });
        });

        function prepereItem(o) {
            o.data = o._source.data;
            // o.result = o.data.result;
            // o.type = o.data.type.replace('environment.', '');
            // o.id = o.data.id;
            // o.comment = o.data.log;
            // o.title = o.data.payload.user.display_name /* + ' ' + o.data.type + ' ' + o.data.environments[0]*/ ;
            // o.environment = (o.data.payload.environment) ? o.data.payload.environment.name : '';
            // o.title = o.title + ' ' +
            //     ((o.type === 'branch') ? 'branched environment ' + o.data.environments[0] + ' from ' + o.data.environments[1] :
            //         (o.type === 'push') ? 'pushed to ' + o.environment :
            //         (o.type === 'variable.create') ? 'added variable ' + o.data.payload.variable.id :
            //         (o.type === 'deactivate') ? 'deactivated environment ' + o.environment :
            //         (o.type === 'activate') ? 'activated environment ' + o.environment :
            //         (o.type === 'backup') ? 'created a snapshot of ' + o.environment :
            //         (o.type === 'update.http_access') ? 'updated HTTP Access settings on environment ' + o.environment :
            //         (o.type === 'synchronize') ? 'synced ' + o.data.parameters.into + '\'s' + ((o.data.parameters.synchronize_data) ? ' data ' : '') + ((o.data.parameters.synchronize_data && o.data.parameters.synchronize_code) ? '&' : '') + ((o.data.parameters.synchronize_code) ? ' code' : '') : '');
            // o.created = o.data.created_at;
        }



        MeanSocket.on('log added', function(log) {
            if (log._source.appId === $stateParams.id && log._type.indexOf('platform') !== -1) {
                console.log('------LOG ADDED----', log);
                // prepereItem(log);
                vmip.docs.unshift(log);
            }
        });
    }

]);