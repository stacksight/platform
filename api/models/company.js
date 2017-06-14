/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    stsEvents = require('../services/events'),
    _ = require('lodash');

var CompanySchema = new Schema({
    name: {
        required: true,
        type: String
    },
    collaborators: [{
        id: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            default: 'pending'
        },
        email: {
            type: String,
            required: true
        },
        permissions: [],
        invitationDate: {
            type: Date,
            default: Date.now
        },
        acceptedDate: {
            type: Date
        },
        name: String
    }],
    stacks: [{
        type: Schema.ObjectId,
        ref: 'Stack'
    }], // check if we need it
    owner: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    status: ['default'],
    billing: {}, // will be a child schema or new one
    subscription: {
        type: Schema.ObjectId,
        ref: 'Subscription'
    }
});

CompanySchema.index({
    name: 1
}, {
    unique: true,
    required: true
});

CompanySchema.pre('save', function(next) {
    this.updated = new Date();
    next();
});

// CompanySchema.post('save', function(doc) {
//     if (!doc) return;
//     if (doc.author && doc.author._id) doc.author = doc.author._id;
//     if (doc.stacks && doc.stacks.length && doc.stacks[0]._id) doc.stacks = _.map(doc.stacks, '_id');
//     stsEvents.emit('index', 'apps', doc);
// });

// CompanySchema.post('findOneAndUpdate', function(doc) {
//     if (!doc) return;
//     if (doc.author && doc.author._id) doc.author = doc.author._id;
//     if (doc.stacks && doc.stacks.length && doc.stacks[0]._id) doc.stacks = _.map(doc.stacks, '_id');
//     stsEvents.emit('index', 'apps', doc);
// });


mongoose.model('Company', CompanySchema);