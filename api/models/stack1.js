/**
 * Module dependencies.
 */


var mongoose = require('mongoose'),
    textSearch = require('mongoose-text-search'),
    Schema = mongoose.Schema,
    stsEvents = require('../services/events'),
    Global = require('../services/global'),
    domainRegex = Global.domain;

var integrationSchema = new Schema({
    active: {
        type: Boolean,
        default: true
    },
    name: String,
    enable: Boolean,
    index: String,
    type: String,
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    data: {}
});

var validateUniqueDomain = function(value, callback) {
    if (!value) return callback(true);

    var Stack = mongoose.model('Stack');
    Stack.find({
        $and: [{
            domain: value.toLowerCase()
        }, {
            owner: this.owner
        }]
    }, function(err, stacks) {
        console.log('===============', err, stacks.length, '=====================', value.toLowerCase());
        if (err) return callback(false);
        if (stacks.length === 0) return callback(true);
        if (stacks.length === 1 && !this.isNew) return callback(true);
        callback(false);
        // if true it is ok, if false, error is sent!
        // callback(err || stack.length === 0);
    });
};

var Stack1Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    owner: { // the organization
        type: Schema.ObjectId,
        ref: 'User'
    }, // check if needed
    platform: String,
    status: [String],
    company: {
        type: Schema.ObjectId,
        ref: 'Company'
    },
    currentIndex: String,
    host: {
        type: String//,
        // Regexp to validate host with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
        // match: [/(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/, 'Please enter a valid host']
    },
    domain: {
        type: String//,
        // Regexp to validate domain with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
        // match: [domainRegex, 'Please enter a valid domain'],
        // validate: [validateUniqueDomain, 'Domain is already in-use']
    },
    check: String,
    integrations: [integrationSchema],
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
    tags: [{
        tag: {
            type: Schema.ObjectId,
            ref: 'Tag'
        },
        value: String,
        author: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        _id: false
    }],
    app: {
        type: Schema.ObjectId,
        ref: 'App'
    },
    data: {},
    updatedDates: {
        healthPoints: {
            type: Date,
            index: true
        }
    },
    score: Number
});

Stack1Schema.plugin(textSearch);

Stack1Schema.set('collection', 'stacks');

Stack1Schema.index({
    name: 'text'
});

// Stack1Schema.index({
//     author: 1,
//     domain: 1
// }, {
//     unique: true
// });


Stack1Schema.pre('save', function(next) {

    return next();

    this.updated = new Date();

    this.domain = this.domain || '';
    this.host = this.host || '';

    if (!this.host && this.domain) this.host = 'http://' + this.domain;
    if (this.host && !this.domain) {
        this.domain = this.host.replace('http://', '');
        this.domain = this.domain.replace('https://', '');
    }

    if (!this.domain || !this.host) return next(new Error('Domain is required'));

    this.domain = this.domain.toLowerCase();
    this.host = this.host.toLowerCase();
    this.name = this.name || this.domain;

    var Stack = mongoose.model('Stack');

    Stack.find({
        domain: this.domain,
        owner: this.owner
    }, function(err, stacks) {
        if (err) return next(new Error('Something bad happened.... Try again please'));

        if (stacks.length === 0) return next();
        if (stacks.length === 1 && !this.isNew) return next();

        next(new Error('Domain is already in-use'));
    });
});

// Stack1Schema.post('save', function(doc) {
//     if (!doc) return;
//     if (doc.app && doc.app._id) doc.app = doc.app._id;
//     if (doc.author && doc.author._id) doc.author = doc.author._id;
//     stsEvents.emit('index', 'stacks', doc);
// });

// Stack1Schema.post('findOneAndUpdate', function(doc) {
//     if (!doc) return;
//     if (doc.app && doc.app._id) doc.app = doc.app._id;
//     if (doc.author && doc.author._id) doc.author = doc.author._id;
//     stsEvents.emit('index', 'stacks', doc);
// });

mongoose.model('Stack1', Stack1Schema);