'use strict';

require('../models/feature');
var mongoose = require('mongoose'),
    Feature = mongoose.model('Feature'),
    _ = require('lodash');

exports.feature = function(req, res, next) {
    var featureId = req.params.id;
    Feature.findOne({ _id: featureId }).exec(function(err, feature) {
        if (err || !feature) return res.status(500).send(err || 'feature does not exist');
        req.feature = feature;
        next();
    });
};


exports.create = function(req, res) {
    var feature = new Feature(req.body);
    feature.save(function(err, doc) {
        return res.send({ err: err, feature: doc });
    });

};


exports.update = function(req, res) {
    var feature = req.feature;

    feature = _.extend(feature, req.body);

    feature.save(function(err, doc) {
        if (err) return res.status(500).send(err);
        res.send(doc);
    });
};

exports.delete = function(req, res) {
    var feature = req.feature;
    feature.remove(function(err, doc) {
        if (err) return res.status(500).send(err);
        res.send(doc);
    });
};

exports.find = function(req, res) {
    Feature.find({}).exec(function(err, features) {
        if (err) return res.status(500).send(err);
        return res.send(features);
    });
};

exports.findOne = function(req, res) {
    res.send(req.feature);
};

exports.saveDescriptions = function(plan, cb) {
    var values, multiple, description, planFeatures, valueType, gf; //gf = globalFeature
    planFeatures = plan.features;


    Feature.find().lean().exec(function(err, allFeatures) {
        if (err) return cb(err);

        allFeatures = _.indexBy(allFeatures, '_id');
        plan.flattenFeatures = {};
        planFeatures.forEach(function(feature, i) {
            gf = allFeatures[feature.id];
            values = feature.values;
            //////////
            multiple = gf.multiple;
            description = gf.description || gf.name;
            valueType = gf.valueType;
            //////////

            if (valueType !== 'bool') {
                if (description.indexOf('#') !== -1) {
                    description = (multiple) ? description.replace('#', values.toString()) : description.replace('#', feature.value);
                } else {
                    description = (multiple) ? description + ' ' + values.toString() : description + ' ' + feature.value;
                }
            }
            if (feature.active) {
                plan.flattenFeatures[gf.id] = (multiple) ? feature.values : feature.value;
                plan.flattenFeatures[gf.id] = (plan.flattenFeatures[gf.id] === 'true') ? true :
                    (plan.flattenFeatures[gf.id] === 'false') ? false : 
                    (gf.valueType === 'number' ? parseInt(plan.flattenFeatures[gf.id]) : plan.flattenFeatures[gf.id]);
            }

            feature.description = feature.overrideDesc || description;
            feature.locatedIn = gf.locatedIn;
        });

        cb(null);
    });
};

exports.all = function(cb) {
    Feature.find().lean().exec(function(err, features) {
        if (err) return cb(err);
        features = _.indexBy(features, '_id');
        cb(null, features);
    });
};
