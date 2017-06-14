'use strict';

var Webhook = require('./webhook'),
    _ = require('lodash'),
    gitlabData = require('../data/gitlab');

class Gitlab extends Webhook {

    constructor(data, type, service, dataType, options) {
        super(data, type, 'gitlab', dataType, options);
        this.headers = options.req.headers;
    }

    normalizeData(options, cb) {
        var headers = options.req.headers,
            event = headers['x-gitlab-event'],
            that = this;

        if (!gitlabData[event]) return;
        if (gitlabData[event].toDelete) {
            gitlabData[event].toDelete.forEach(function(field) {
                deleteValue(that.data, field.split('.'));
            });
        }

        ['name', 'type', 'url', 'user', 'action'].forEach(function(field) {
            if (gitlabData[event][field] || gitlabData[event]['get' + field]) {
                if (gitlabData[event]['get' + field]) that.data[field] = gitlabData[event]['get' + field](that.data);
                else that.data[field] = (gitlabData[event][field][0] === '*') ? gitlabData[event][field].substring(1) : getValue(that.data, gitlabData[event][field].split('.'), 0);
                if (field === 'name' && that.data[field]) that.data[field] = that.data[field].toString();
            }
        });
        that.data.user = {
            name: that.data.user
        };

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

function deleteValue(data, array) {
    if (array.length === 1) {
        delete data[array[0]];
        return true;
    } else {
        if (data[array[0]])
            return deleteValue(data[array[0]], array.slice(1));
        else return false;
    }
};

module.exports = Gitlab;