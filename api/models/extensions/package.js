'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PackageExtensionSchema = new Schema({
    name: {
        required: true,
        type: String
    },
    label: String,
    platform: String,
    version: String,
    description: String
});


PackageExtensionSchema.set('collection', 'extensions_packages');
PackageExtensionSchema.index({
    name: 1,
    version: 1,
    platform: 1
}, {
    unique: true
});

module.exports = mongoose.model('PackageExtension', PackageExtensionSchema);
