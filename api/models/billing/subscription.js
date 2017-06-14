/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SubscriptionSchema = new Schema({
    plan: {
        type: Schema.ObjectId,
        ref: 'Plan',
        required: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    coupon: {
        type: Schema.ObjectId,
        ref: 'Coupon'
    },
    company: {
        type: Schema.ObjectId,
        ref: 'Company'
    },
    stripe: {},
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    changes: [{
        from: String,
        to: String,
        updated: {
            type: Date,
            default: Date.now
        }
    }],
    history: [],
    //status - is not in the view
    status: [] //new or used or upgraded
});

SubscriptionSchema.index({
    plan: 1,
    user: 1
}, {
    unique: true,
    required: true
});

SubscriptionSchema.pre('save', function(next) {
    this.updated = new Date();
    next();
});

mongoose.model('Subscription', SubscriptionSchema);
