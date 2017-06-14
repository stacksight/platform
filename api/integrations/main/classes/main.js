'use strict';

var types = require('../data/integrations-types'),
    dataTypeClass = require('./data-type'),
    elastic = require('../../../controllers/elastic');

class Integration {
    constructor(data, type, dataType, options) {
        this.data = data;
        this.type = type;
        this.dataType = dataType;
        this.dataTypeObject = new dataTypeClass(dataType, this.data);
        this.options = options || {};
        this.setRequiredParams();
        this.settings = types[type] || {};
    }

    register() {}

    setRequiredParams() {
        this.requiredParams = types[this.type].requiredParams;
        return this.requiredParams;
    }

    checkRequiredParams(params) {
        var res = {};
        for (var i in this.requiredParams)
            if (!params[this.requiredParams[i]]) {
                res.ok = false;
                res.field = this.requiredParams[i];
                return res;
            }
        res.ok = true;
        return res;
    }

    index(_index, _type) {
        this.cleanFields();
        _type = (_type === 'signal') ? 'health' : _type;
        elastic._index(_index, _type, this.data);
    }

    normalizeData(options, cb) {
        return cb();
    }
    
    cleanFields() {
        var fields = this.requiredParams.concat(this.dataTypeObject.typeData.requiredFields, this.dataTypeObject.typeData.optionalFields);
        fields.push('integration_service');
        for (var index in this.data) {
            if (fields.indexOf(index) === -1) delete this.data[index];
        }
    }
}

module.exports = Integration;