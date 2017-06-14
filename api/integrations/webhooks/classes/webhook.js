'use strict';

var Integration = require('../../main/classes/main');


class Webhook extends Integration {
    constructor(data, type, service, dataType, options) {
        super(data, 'webhook', dataType, options);
        this.headers = options.req.headers;
        this.service = service;
        var that = this;
        that.setAuthData();
        this.normalizeData(options, function(err, data) {
            if (err) return console.error(err);
            var ok = that.dataTypeObject.checkRequiredFields();
            if (!ok) return console.error('Required fields for type ' + dataType + ' are missing');
            that.index(that.dataTypeObject.getIndexAlias(), that.dataType); // dataType or service
        });

    }

    setAuthData() {
        var that = this;
        this.data.integration_service = this.service;
        this.requiredParams.forEach(function(param) {
            that.data[param] = (that.options.params && that.options.params[param]) ? that.options.params[param] : null;
        });
    }
}

module.exports = Webhook;