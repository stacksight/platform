/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlanSchema = new Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    amountView: {
        type: Number
    },
    amountText: {
        type: String
    },
    trialPeriodDays: {
        type: Number
    },
    additionAmount: Number,
    description: String,
    interval: String,
    //not in view
    stripe: {}, // stripe data on like stripe id , we must id per billing company to know from where the plan comes from. - stripe will be in a generic variable according to the active company
    stacksIncluded: Number,
    features: [{
        id: {
            type: Schema.ObjectId,
            ref: 'Feature'
        },
        active: Boolean,
        description: String,
        value: String,
        values: [],
        locatedIn: [],
        overrideDesc: String
    }],
    flattenFeatures: {},
    visible: Boolean,
    popular: Boolean,
    weight: Number,
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    contactUs: Boolean
    // history data
});

PlanSchema.pre('save', function(next) {
    this.updated = new Date();
    next();
});

mongoose.model('Plan', PlanSchema);
