'use strict';

angular.module('mean.platforms').factory('Platforms', [
    function() {
        var platforms = ['mean', 'wix', 'nodejs', 'drupal', 'wordpress', 'php', 'meteor', 'magento'];
        var pltfrms = {};
        platforms.forEach(function(p) {
            var show = true;
            if (p === 'wix' || p === 'magento') show = false;
            pltfrms[p] = {
                img: '/platforms/assets/img/' + p + '.png',
                show: show,
                cpuMem: (p === 'mean') ? true : false
            }
        });
        return pltfrms;
    }
]);
