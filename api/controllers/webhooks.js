'use strict';

var producer = require('../producers'),
    utils = require('../services/utils');

exports.calendly = function(req, res) {

    var message = {
        internalIndex: true,
        index: utils.indexNameByDate('calendly'),
        type: 'calendly',
        data: req.body
    };

    producer.createJob('index-sts', message);
};
