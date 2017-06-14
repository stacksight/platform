'use strict';

var config = require(process.cwd() + '/config'),
    elastic = require('../controllers/elastic'),
    design = {
        group: {
            icon: 'fa-object-group',
            icon_col: '#FFA500'
        }
    };

    // stacksight.event({
    //         action: 'deleted',
    //         type: 'group',
    //         name: req._app.name,
    //         user: {
    //             name: req.user.name,
    //             link: req.user.email
    //         },
    //         icon: 'fa-object-group',
    //         icon_col: '#FFA500'
    //     });

var stacksight = require('stacksight')({
    apiKey: config.stacksight.token,
    appId: config.stacksight.appId,
    features: {
        logs: false,
        updates: false,
        sessions: false,
        requests: false
    },
    disable: true
});



stacksight.index = function(index, data) {

    if (stacksight.disable) return;

    data.platform = stacksight.platform;
    data.token = stacksight.apiKey;
    data.appId = stacksight.appId;
    data.created = new Date();

    elastic._index(index.split('/')[0], index.split('/')[1], data);
};

module.exports = stacksight;