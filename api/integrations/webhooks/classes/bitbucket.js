'use strict';

var Webhook = require('./webhook'),
    _ = require('lodash'),
    bitbucketData = require('../data/bitbucket');

class Bitbucket extends Webhook {

    constructor(data, type, service, dataType, options) {
        super(data, type, 'bitbucket', dataType, options);
        this.headers = options.req.headers;
    }

    normalizeData(options, cb) {
        var headers = options.req.headers,
            event = headers['x-event-key'],
            that = this;

        // that.data.action = event.split(':')[1];
        ['name', 'type', 'url', 'user', 'action'].forEach(function(field) {
            if (bitbucketData[event] && bitbucketData[event][field])
                that.data[field] = (bitbucketData[event][field][0] === '*') ? bitbucketData[event][field].substring(1) : getValue(that.data, bitbucketData[event][field].split('.'), 0);
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

module.exports = Bitbucket;