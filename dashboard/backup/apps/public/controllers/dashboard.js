'use strict';

/* jshint -W098 */
angular.module('mean.apps').controller('GroupDashboardController', ['$scope', 'Global', 'Apps', '$stateParams', 'Platforms', '_', '$state', 'Stacks', 'Updates', 'localStorageService', 'Sapi', 'EventsComponents', '$uibModal',
    function ($scope, Global, Apps, $stateParams, Platforms, _, $state, Stacks, Updates, localStorageService, Sapi, EventsComponents, $uibModal) {
        var vmd = this,
            threshold = {},
            appId = $stateParams.appId,
            groupStacks;

        vmd.defaultPolicy = {
            value: 50
        };

        vmd.events = [];
        vmd.sessions = [];

        vmd.design = EventsComponents.design();


        vmd.stacks = [];
        vmd.init = function() {
            groupStacks = $scope.vm.app.stacks;
            groupStacks = _.indexBy(groupStacks, '_id');
        };

        vmd.selectState = false;
        vmd.eventsControlller = false;

        vmd.selectStack = function(stack){
            vmd.selectState = stack._id;
            $stateParams.id = stack._id;
            vmd.eventsControlller.initSearch();
            vmd.eventsControlller.find();
            var select_obj = _.countBy(vmd.selected_stacks, function(num) {
                return num == false ? 'unselected': 'selected';
            });
            vmd.selected_stacks_count = select_obj.selected;
        }
        vmd.selected_stacks_count = 0;
        vmd.selected_stacks = {}

        vmd.action_for_stacks = 'Update';
        vmd.stacksAction = function(){
            console.log('Action width', vmd.selected_stacks);
        }

        vmd.stacks_ready = false;

        $scope.$watch('vmd.stacks', function() {
            vmd.stacks_ready = true;
            if(vmd.stacks[0]){
                $stateParams.id = vmd.stacks[0]._id;
                vmd.eventsControlller.find();
            }
        });

        //Stacks.find(function (err, stacks) {
        //    if (err) {
        //        console.log(err);
        //        return sweetAlert('', err, 'error');
        //    }
        //    console.log(stacks);
        //});
    }
]);