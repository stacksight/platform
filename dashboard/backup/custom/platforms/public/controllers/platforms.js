'use strict';

/* jshint -W098 */
angular.module('mean.platforms').controller('PlatformsController', ['$scope', 'Global', 'Platforms', '$stateParams',
    function($scope, Global, Platforms, $stateParams) {

        var vmp = this;
        vmp.platforms = Platforms;
        vmp.global = Global;
        vmp.init = function() {
            vmp.platform = $stateParams.platform;
        };
        vmp.data = {};
    }
]);
