'use strict';

require('../models/tag');

var mongoose = require('mongoose'),
    Tag = mongoose.model('Tag');


exports.create = function(req, res, next) {
    // create tag from dashboard
    var value = req.body.tag.value;
    _create(value, req.user, req.company, function(err, tag) {
        if (err) return res.status(500).send(err);
        req.object = {
            tag: tag._id,
            value: tag.value,
            author: tag.author
        };
        if (req.body.tag) return next();
        res.send(req.tag);
    });
};

var _create = exports._create = function(value, user, company, cb) {

    var tag = new Tag({
        author: user._id,
        company: company._id,
        type: 'custom',
        value: value
    });

    tag.save(function(err) {
        if (!err) return cb(null, tag);
        if (err && err.code !== 11000) return cb(err);
        Tag.findOne({
            value: value.toLowerCase(),
            company: company
        }).exec(function(err, _tag) {
            cb(null, _tag);
        });
    });
};

exports.find = function(req, res, next) {

    var text = req.query.text,
        hash = req.query.hash,
        projection = {},
        options = {
            sort: {
                value: 1
            }
        },
        companies = [];

    req.user.companies.forEach(function(company) {
        if (['owner', 'admin', 'member'].indexOf(company.permission) > -1) companies.push(company.id);
    });

    if (!hash)
        options.limit = 5;
    var query;

    if (!text) return res.status(400).send('You must send text');
    var regex = new RegExp('.*' + text + '.*', 'i');
    query = {
        value: regex,
        company: (req.company) ? req.company._id : {
            $in: companies
        }
    };
    Tag.find(query, projection, options, function(err, tags) {
        return res.jsonp(tags);
    });
};

exports.createDefault = function(req, res) {
    var tag = {
        author: req.user._id,
        value: req.user.name.toLowerCase(),
        company: req.company._id,
        type: 'default'
    };

    tag.save(function(err) {
        if (err) return res.status(500).send(err);
        res.send(req.user);

    });
};

exports.findDefault = function(company, cb) {
    Tag.findOne({
        company: company._id,
        type: 'default'
    }).exec(function(err, tag) {
        if (err) return cb(err);
        cb(null, tag);
    });
};