'use strict'; 

module.exports = {
    event: {
        requiredFields: ['action', 'type', 'name', 'appId'],
        optionalFields: ['subtype', 'id', 'desc', 'url', 'data', 'user', 'icon', 'icon_col', 'platform'],
        indexAlias: 'events'
    },
    health: {
       requiredFields: ['category', 'widgets', 'appId'],
       optionalFields: [],
       indexAlias: 'health'
    },
    log: {
        requiredFields: ['method', 'content', 'appId'],
        optionalFields: [],
        indexAlias: 'logs'
    },
    signal: {
        requiredFields: ['data'/*'data.category', 'data.widgets,*/],
        optionalFields: [],
        indexAlias: 'health'
    }
};

// {
//   "method": "warn",
//   "content": "TEST TEST",
//   "appId": "your stackId",
//   "platform": "nodejs",
//   "token": "your token"
// }

