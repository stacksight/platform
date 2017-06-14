/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash');

var ActivitySchema = new Schema({
    object: {
        type: String,
        required: true
    },
    id: {
        type: Schema.ObjectId,
        require: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    description: String,
    user: {
       type: Schema.ObjectId,
       ref: 'User' 
    },
    action: String,
    data: {
    }
});

mongoose.model('Activity', ActivitySchema);