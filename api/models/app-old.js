/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AppOldSchema = new Schema({
    name: {
        required: true,
        type: String
    },
    stacks: [{
        type: Schema.ObjectId,
        ref: 'Stack'
    }],
    collaborators: [{
        type: Schema.ObjectId,
        ref: 'User'
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
    status: [String]
});

AppOldSchema.pre('save', function(next) {
    this.updated = new Date();
    next();
});
AppOldSchema.set('collection', 'apps');
mongoose.model('Appold', AppOldSchema);
