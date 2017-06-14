'use strict';

var q = require('../providers/busmq').get('events-observer-sts');
q.consume();

var stacks = require('../controllers/stacks'),
    _ = require('lodash'),
    config = require(process.cwd() + '/config');


q.on('message', function(message) {

    message = JSON.parse(message);

    // if (!_.has(message, 'data.type')) return;
    if (!message.data || !message.data.type) return;

    if (!eventsTypes[message.data.type]) return;

    eventsTypes[message.data.type](message);

});

var eventsTypes = {
    stacksight: function(message) {
        var data = {},
            mData;
        if (!message.data.data) return;
        mData = message.data.data;

        if (mData.features) data.features = mData.features;
        if (mData.settings) data.clientVars = mData.settings;
        if (mData.app.Version || mData.app.version) data.stacksightVersion = (mData.app.Version || mData.app.version);
        if (mData.app.space_used) data.usedSpace = mData.app.space_used;        
        if (mData.app.public) data.public = mData.app.public;
        if (mData.app.url) data.url = mData.app.url;
        if (mData.app.last_login) data.lastLogin = mData.app.last_login;
        if (mData.app.wpml_lang) data.wpmlLang = mData.app.wpml_lang
        if (mData.app.owner) data.owner = mData.app.owner;
        if (mData.app.blog_title) data.title = mData.app.blog_title;

        stacks._stack(message.data.appId, function(err, stack) {
            if (err) return console.error('EVENTS OBSERVER ERR', err);
            stack.data = (!stack.data) ? data : _.extend(JSON.parse(JSON.stringify(stack.data)), data);
            stacks._update(stack, function(err, doc) {
                if (err) return console.error('EVENTS OBSERVER ERR', err);
                console.log('EVENTS OBSERVER SUCCESS');
            });
        });
    }
};