'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PluginExtensionSchema = new Schema({
    name: {
        required: true,
        type: String
    },
    label: String,
    platform: String,
    version: String,
    description: String
});


PluginExtensionSchema.set('collection', 'extensions_plugins');
PluginExtensionSchema.index({
    name: 1,
    version: 1,
    platform: 1
}, {
    unique: true
});

module.exports = mongoose.model('PluginExtension', PluginExtensionSchema);
