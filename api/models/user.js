'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('lodash'),
    stsEvents = require('../services/events');

/**
 * Validations
 */
var validatePresenceOf = function(value) {
    // If you are authenticating by any of the oauth strategies, don't validate.
    return (this.provider && this.provider !== 'local') || (value && value.length);
};

var validateUniqueEmail = function(value, callback) {
    var User = mongoose.model('User');
    User.find({
        $and: [{
            email: value.toLowerCase()
        }, {
            _id: {
                $ne: this._id
            }
        }]
    }, function(err, user) {
        callback(err || user.length === 0);
    });
};

/**
 * Getter
 */
var escapeProperty = function(value) {
    return _.escape(value);
};

/**
 * User Schema
 */

var UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        get: escapeProperty
    },
    token: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
        match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
        validate: [validateUniqueEmail, 'E-mail address is already in-use']
    },
    username: {
        type: String,
        unique: true,
        required: true,
        get: escapeProperty
    },
    phone: String,
    roles: {
        type: Array,
        default: ['authenticated']
    },
    hashed_password: {
        type: String,
        validate: [validatePresenceOf, 'Password cannot be blank']
    },
    provider: {
        type: String,
        default: 'local'
    },
    created: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    lastVisit: {
        type: Date,
        default: Date.now
    },
    plan: { //plan is set only if the user pay to plan
        type: Schema.ObjectId,
        ref: 'Plan'
    },
    subscription: {
        type: Schema.ObjectId,
        ref: 'Subscription'
    },
    notifyBy: String,
    stripe: {
        cid: String,
        subscriptions: [],
        defaultCard: String,
        activePlan: {
            name: {
                type: 'String',
                default: 'community'
            },
            created: {
                type: Date,
                default: Date.now
            }
        },
        plans: [{
            name: {
                type: 'String',
                default: 'community'
            },
            created: {
                type: Date,
                default: Date.now
            },
            active: {
                type: 'Boolean',
                default: true
            }
        }]
    },
    // companies: [{
    //     type: Schema.ObjectId,
    //     ref: 'Company'
    // }],
    companies: [{
        id: {
            type: Schema.ObjectId,
            ref: 'Company'
        },
        permission: String,
        name: String,
        _id: false
    }],
    oauth_slack: {},
    oauth_platform: {},
    salt: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profile: {}, //the billing info is saved here
    facebook: {},
    twitter: {},
    github: {},
    google: {},
    linkedin: {},
    location: {}
}, {
    minimize: false
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.hashPassword(password);
}).get(function() {
    return this._password;
});

/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
    this.email = this.email.toLowerCase();
    if (this.isNew && this.provider === 'local' && this.password && !this.password.length)
        return next(new Error('Invalid password'));
    next();
});

/**
 * Methods
 */
UserSchema.methods = {

    /**
     * HasRole - check if the user has required role
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    hasRole: function(role) {
        var roles = this.roles;
        return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
    },

    /**
     * IsAdmin - check if the user is an administrator
     *
     * @return {Boolean}
     * @api public
     */
    isAdmin: function() {
        return this.roles.indexOf('admin') !== -1;
    },

    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.hashPassword(plainText) === this.hashed_password;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Hash password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    hashPassword: function(password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    },

    /**
     * Hide security sensitive fields
     * 
     * @returns {*|Array|Binary|Object}
     */
    toJSON: function() {
        var obj = this.toObject();
        delete obj.hashed_password;
        delete obj.salt;
        return obj;
    }
};

UserSchema.post('findOneAndUpdate', function(doc) {
    stsEvents.emit('index', 'users', doc);
});

UserSchema.post('save', function(doc) {
    stsEvents.emit('index', 'users', doc);
});

mongoose.model('User', UserSchema);