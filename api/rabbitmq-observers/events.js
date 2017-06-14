'use strict';

var stacks = require('../controllers/stacks'),
    _ = require('lodash'),
    config = require(process.cwd() + '/config');

module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {

    // if (!_.has(message, 'data.type')) return;
    if (!message.data || !message.data.type) return done();

    if (!eventsTypes[message.data.type]) return done();

    eventsTypes[message.data.type](message, error, done);

}

var eventsTypes = {
    stacksight: function(message, error, done) {
        var data = {},
            mData;
        if (!message.data.data) return done();

        mData = message.data.data;

        if (mData.features) data.features = mData.features;
        if (mData.settings) data.clientVars = mData.settings;
        if (mData.app) {
            if (mData.app.Version || mData.app.version) data.stacksightVersion = (mData.app.Version || mData.app.version);
            if (mData.app.space_used) data.usedSpace = mData.app.space_used;
            if (mData.app.public) data.public = mData.app.public;
            if (mData.app.url) data.url = mData.app.url;
            if (mData.app.last_login) data.lastLogin = mData.app.last_login;
            if (mData.app.wpml_lang) data.wpmlLang = mData.app.wpml_lang
            if (mData.app.owner) data.owner = mData.app.owner;
            if (mData.app.blog_title) data.title = mData.app.blog_title;
        }


        stacks._stack(message.data.appId, function(err, stack) {
            if (err) {
                error(err);
                return console.error('EVENTS OBSERVER ERR', err);
            }
            stack.data = (!stack.data) ? data : _.extend(JSON.parse(JSON.stringify(stack.data)), data);
            stacks._update(stack, function(err, doc) {
                if (err) {
                    error(err);
                    return console.error('EVENTS OBSERVER ERR', err);
                }
                done();
                console.log('EVENTS OBSERVER SUCCESS');
            });
        }, true);
    }
};