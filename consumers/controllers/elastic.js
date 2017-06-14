'use strict';

var producer = require('../providers/producer');

exports._index = function(index, type, _data) { // index through service

    var data = {
        index: index,
        originalIndex: index,
        type: type,
        data: _data
    };

    data.data.created = data.data.created || new Date().toISOString();

    producer.createJob('translation-sts', data);
};
