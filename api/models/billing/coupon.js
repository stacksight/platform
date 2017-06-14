/**
 * Module dependencies.
 */

var crypto = require('crypto');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CouponSchema = new Schema({
    stripe: {},
    id: {
        type: String,
        unique: true,
        required: true
    },
    name: String,
    percentOff: {
        type: Number,
        required: true
    },
    duration: String, //could be forever, once, or repeating
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    token: {
        type: String,
        unique: true,
    },
    salt: String,
    plan: {
        type: Schema.ObjectId,
        ref: 'Plan'
    },
    totalNumberOfUses: {
        type: Number,
        required: true
    },
    uses: [{
        type: Schema.ObjectId,
        ref: 'User'
    }]
});

CouponSchema.pre('save', function(next) {
    this.updated = new Date();
    if (this.isNew) {
        this.salt = crypto.randomBytes(16).toString('base64');
        var salt = new Buffer(this.salt, 'base64');
        this.token = crypto.pbkdf2Sync(this._id.toString(), salt, 10000, 64).toString('base64');
    }
    next();
});

mongoose.model('Coupon', CouponSchema);