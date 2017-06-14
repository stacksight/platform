'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ThemeExtensionSchema = new Schema({
    name: {
        required: true,
        type: String
    },
    label: String,
    platform: String,
    version: String,
    description: String
});


ThemeExtensionSchema.set('collection', 'extensions_themes');
ThemeExtensionSchema.index({
    name: 1,
    version: 1,
    platform: 1
}, {
    unique: true
});

module.exports = mongoose.model('ThemeExtension', ThemeExtensionSchema);
