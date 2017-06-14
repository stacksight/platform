/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    stsEvents = require('../services/events'),
    _ = require('lodash');

var AppSchema = new Schema({
    name: {
        required: true,
        type: String
    },
    stacks: [{
        type: Schema.ObjectId,
        ref: 'Stack'
    }],
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
        }
    }],
    author: {
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
    status: [String],
    updatedDates: {
        healthPoints: {
            type: Date,
            index: true
        }
    },
    policy: {},
    inventoryVisibleColumns: [String]
        // filters: [{
        //     name: String,
        //     type: String, // name or count
        //     time: {
        //         duration: String,
        //         timing: String
        //     },

    // }]

});

// AppSchema.index({
//     name: 'text'
// });

AppSchema.pre('save', function(next) {
    this.updated = new Date();
    next();
});

AppSchema.post('save', function(doc) {
    if (!doc) return;
    if (doc.author && doc.author._id) doc.author = doc.author._id;
    if (doc.stacks && doc.stacks.length && doc.stacks[0]._id) doc.stacks = _.map(doc.stacks, '_id');
    stsEvents.emit('index', 'apps', doc);
});

AppSchema.post('findOneAndUpdate', function(doc) {
    if (!doc) return;
    if (doc.author && doc.author._id) doc.author = doc.author._id;
    if (doc.stacks && doc.stacks.length && doc.stacks[0]._id) doc.stacks = _.map(doc.stacks, '_id');
    stsEvents.emit('index', 'apps', doc);
});


mongoose.model('App', AppSchema);
