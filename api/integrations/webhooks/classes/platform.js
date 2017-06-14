'use strict';

var Webhook = require('./webhook'),
    _ = require('lodash'),
    platformData = require('../data/platform'),
    stacks = require('../../../controllers/stacks');

class Platform extends Webhook {

    constructor(data, type, service, dataType, options) {
        super(data, type, 'platform', dataType, options);
        this.requiredParams = ['token'];
        this.headers = options.req.headers;
    }

    normalizeData(options, cb) {
        var headers = options.req.headers,
            event = this.data.type,
            that = this;

        ['name', 'type', 'url', 'user', 'action'].forEach(function(field) {
            if (platformData[event] && (platformData[event][field] || platformData[event]['get' + field])) {
                if (platformData[event]['get' + field]) that.data[field] = platformData[event]['get' + field](that.data);
                else that.data[field] = (platformData[event][field][0] === '*') ? platformData[event][field].substring(1) : getValue(that.data, platformData[event][field].split('.'), 0);
                if (field === 'name' && that.data[field]) that.data[field] = that.data[field].toString();
            }
        });
        that.data.user = {
            name: that.data.user
        }
        this.findAppId(cb);
    }

    findAppId(cb) {
        var that = this;
        if (!that.data.payload || !that.data.payload.environment) return cb();
        var id = that.data.payload.environment.id + '-' + that.data.payload.environment.project;
        stacks._find({
            externalId: id
        }, populateObj, function(err, stacks) {
            if (err || !stacks.length) return cb(); // it will be failed later
            var stack = _.find(stacks, function(o) {
                return o.owner.token === that.data.token;
            });
            if (!stack) return cb('tokens are not matched (from platform)');
            that.data.appId = stack._id;
            cb();
        });
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

var populateObj = [{
    path: 'owner',
    select: 'token'
}];

module.exports = Platform;