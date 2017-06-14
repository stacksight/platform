'use strict';

var Webhook = require('./webhook'),
    _ = require('lodash'),
    githubData = require('../data/github');

class Github extends Webhook {

    constructor(data, type, service, dataType, options) {
        super(data, type, 'github', dataType, options);
        this.headers = options.req.headers;
    }

    normalizeData(options, cb) {
        var headers = options.req.headers,
            event = headers['x-github-event'],
            that = this;

        ['name', 'type', 'url', 'user', 'action'].forEach(function(field) {
            if (githubData[event] && (githubData[event][field] || githubData[event]['get' + field])) {
                if (githubData[event]['get' + field]) that.data[field] = githubData[event]['get' + field](that.data);
                else that.data[field] = (githubData[event][field][0] === '*') ? githubData[event][field].substring(1) : getValue(that.data, githubData[event][field].split('.'), 0);
                if (field === 'name' && that.data[field]) that.data[field] = that.data[field].toString();
            }
        });
        that.data.user = {
            name: that.data.user
        }
        return cb();
    }
}

function getValue(data, array, index) {
    var res;
    var types = ['string', 'boolean', 'number'];
    if (types.indexOf(typeof data[array[index]]) > -1) return data[array[index]];
    data = data[array[index]];
    index++;
    res = getValue(data, array, index);
    return res;
}

module.exports = Github;