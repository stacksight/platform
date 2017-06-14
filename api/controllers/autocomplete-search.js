'use strict';

var Elastic = require('../providers/elastic')(),
    _ = require('lodash'),
    Global = require('../services/global');


function buildBaseQuery(req) {

    var index = [],
        type = req.params.type,
        displayFields = req.query.displayFields.split(','),
        searchField = req.query.searchField,
        text = req.query.text;

    index.push(req.params.index + '-*');
    index.push('user-ss-*-' + req.params.index + Global.rollIndex);

    var search = {
        fields: displayFields,
        index: index,
        type: type,
        body: {
            query: {
                bool: {
                    must: [{
                        match: {}
                    }]
                }
            }
        }
    };
    search.body.query.bool.must[0].match[searchField] = {
        query: text,
        type: 'phrase'
    };
    return search;
}

// exports.search = function(req, res) {
//     var search = buildBaseQuery(req);

//     Elastic.search(search, function(error, response) {
//         console[(error) ? 'error' : 'log']('ELASTICSEARCH AUTO COMPLETE ERROR: ', error);
//         if (error && error.status === '404') return res.send([]); //no data is not a search error
//         if (error) return res.send(500);
//         if (response.hits && response.hits.hits) return res.send(response.hits.hits);
//         res.send([]);
//     });

// };
exports.search = function(req, res, next) {
    var search = buildBaseQuery(req),
        stacks = _.map(req.stacks, '_id');

    search.body.query.bool.must.push({
        terms: {
            appId: stacks
        }
    });

    Elastic.search(search, function(error, response) {
        console[(error) ? 'error' : 'log']('ELASTICSEARCH SEARCH BY APP ERROR: ', error);
        if (error && error.status === '404') return res.send([]); //no data is not a search error
        if (error) return res.send(500);
        if (response.hits && response.hits.hits) {
            var data = _.uniq(response.hits.hits, function(e) {
                return e.fields.nameNversion[0];
            });
            return res.send(data);
        }
        res.send([]);
    });
};
