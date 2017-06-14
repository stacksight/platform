'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ModuleExtensionSchema = new Schema({
    name: {
        required: true,
        type: String
    },
    label: String,
    platform: String,
    version: String,
    description: String
});

ModuleExtensionSchema.set('collection', 'extensions_modules');
ModuleExtensionSchema.index({
    name: 1,
    version: 1,
    platform: 1
}, {
    unique: true
});

module.exports = mongoose.model('ModuleExtension', ModuleExtensionSchema);

