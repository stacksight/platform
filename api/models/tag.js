'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    stsEvents = require('../services/events'),
    _ = require('lodash');

var TagSchema = new Schema({
    value: {
        type: String,
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    company: {
        type: Schema.ObjectId,
        ref: 'Company'
    },
    type: String,
    created: {
        type: Date,
        default: Date.now
    }
});

TagSchema.pre('save', function(next) {
    // if (this.isNew || this.isModified('value')) {
    this.value = this.value.toLowerCase();
    // }
    next();
});

TagSchema.index({
    company: 1,
    value: 1
}, {
    unique: true,
    required: true
});

mongoose.model('Tag', TagSchema);