/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FeatureSchema = new Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    valueType: String, //could be bool, number or string
    availableValues: [], //array of value for example: up to 3 / unlimited
    description: String,
    multiple: Boolean,
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    locatedIn: []
});

FeatureSchema.pre('save', function(next) {
    this.updated = new Date();
    next();
});

FeatureSchema.pre('remove', function(next) {
    this.model('Plan').update({ 'features.id': this._id }, { $pull: { features: { id: this._id } } }, { multi: true }).exec(function(err, data) {

        if (err) {
            var err = new Error('feature did not delete from plans');
            return next(err);
        }
        next();
    });
});

mongoose.model('Feature', FeatureSchema);
