/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NotificationSchema = new Schema({
    to: {
        type: String,
        required: true
    },
    type: { //updates, logs or build errors
        type: String,
        required: true
    },
    tpl: { // sendgrid email id
        type: String,
        required: true
    },
    frequency: String,
    stack: {
        type: Schema.ObjectId,
        ref: 'Stack'
    },
    stackName: String,
    locals: {}, // email template locals
    data: {},
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    isSent: {
        type: Boolean,
        default: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    postDate: Date,
    localsString: String
});

NotificationSchema.pre('save', function(next) {
    this.updated = new Date();
    var locals = JSON.parse(JSON.stringify(this.locals));
    locals.toEmail = this.to;
    locals.tpl = this.tpl;
    delete locals.created;
    delete locals.updated;
    var localsString = JSON.stringify(locals);
    this.localsString = localsString;
    // delete duplications before saving new one
    this.constructor.remove({
        localsString: localsString
    }).exec(function(err, docs) {
        next();
    });
});

mongoose.model('Notification', NotificationSchema);