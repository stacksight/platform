'use strict';

var types = require('../data/data-types');

class DataType {
    constructor(type, data) {
        this.type = type;
        this.data = data;
        this.typeData = types[this.type];
    }

    checkRequiredFields() {
        var requiredFields = this.typeData.requiredFields;
        for (var i = 0; i < requiredFields.length; i++) {
            var field = requiredFields[i];
            if (!this.data[field]) return false;
        }
        return true;
    }

    getIndexAlias() {
        return this.typeData.indexAlias;
    }
}

module.exports = DataType;