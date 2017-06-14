'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    models = {};

module.exports = function() {
    return {
        get: function(index) {
            if (models[index]) return models[index];
            var Model = createModel(index);
            models[index] = Model;
            return Model;
        }
    }

    function createModel(index) {

        var schema = new Schema({
            token: {
                type: String,
                required: true
            },
            appId: {
                type: String,
                required: true
            },
            created: {
                type: Date,
                required: true,
                default: Date.now
            },
            index: {
                type: String,
                required: true
            }
        }, {
            strict: false
        })
        schema.set('collection', 'app' + index);
        var Model = mongoose.model('app' + index, schema);
        return Model;
    }
};
