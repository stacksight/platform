'use strict';

var q = require('../providers/busmq').get('translation-sts'),
    producer = require('../producers/index'),
    translationIndexes = ['health', 'integrations-platform'],
    _ = require('lodash'),
    Global = require('../services/global'),
    urlPattern = Global.urlPattern1;

q.consume();

q.on('message', function(message, id) {
    message = JSON.parse(message); //try & catch ???

    if (translationIndexes.indexOf(message.index) === -1 || !translations[message.index]) {
        return producer.createJob('index-sts', message);
    }

    try {
        translations[message.index](message, function(messages) {
            // messages.forEach(function(_message) {
            //     producer.createJob('index-sts', _message);
            // });
            // q.ack(id);
        });
    } catch (e) {
        return console.error('Translations error:', e.message);
    }
});


var translations = {
    health: function(message, cb) {

        var messages = [];
        var healthArray = message.data.data;

        if (!_.isArray(healthArray)) healthArray = [healthArray];
        loop(messages, message, 0, healthArray, function(messages) {
            cb(messages);
        });
    }
};

translations['integrations-platform'] = function(message, cb) {
    message.id = message.data.data.id;
    message.data.calculatedId = message.id;

    if (message.data.data.log) {
        message.data.domain = message.data.data.log.match(urlPattern)[0];
        message.data.domain = message.data.domain.replace(/\/$/, '');
        message.data.domain = message.data.domain.replace('http://', '');
        message.data.domain = message.data.domain.replace('https://', '');
    }
    if (!message.data.domain) return console.log('Platform - data is missing to recognize stack');
    producer.createJob('index-sts', message);
};


function loop(messages, message, count, data, cb) {
    if (_.isArray(data)) {
        data.forEach(function(d) {
            return loop(messages, message, count, d, cb);
        });
    } else {
        var category = (data.category) ? data.category.toLowerCase() : '_undefined';

        healthTranslation[category](data, message, function(_o) {
            if (_.isArray(_o)) return loop(messages, message, count, _o, cb);

            var _message = JSON.parse(JSON.stringify(message));
            _message.type = category;
            _message.data.data = _o;

            if (_o.parentMessage) { //parent data;
                for (var index in _o.parentMessage)
                    _message.data[index] = _o.parentMessage[index];
            }
            if (_o.extraPrentMessage) { //extra parent data;
                for (var index in _o.extraPrentMessage)
                    _message[index] = _o.extraPrentMessage[index];
            }

            messages.push(_message);

            //need to return cb with all messages and index it in the callback
            producer.createJob('index-sts', _message);
        });
    }
};

var healthTranslation = {
    security: function(o, message, cb) {
        o.widgets.forEach(function(w) {
            if (w.type === 'meter') {
                o.calc_percent = (w.point_cur / w.point_max) * 100;
                return;
            }
        });
        cb(o);
    },
    backups: function(o, message, cb) {
        var dates = [];
        if (o.widgets[0] && o.widgets[0].data) {
            for (var index in o.widgets[0].data) {
                var _o = JSON.parse(JSON.stringify(o));
                _o.widgets[0].data = {};
                _o.widgets[0].data[index] = o.widgets[0].data[index];
                var calculatedId = message.data.token + '-' + (message.data.appId || message.data.domain) + '-backups-' + index;
                _o.parentMessage = {
                    created: new Date(index).toISOString(),
                    createdAt: new Date().toISOString(),
                    calculatedId: calculatedId
                }
                _o.calc_percent = 100;
                _o.extraPrentMessage = {
                    id: calculatedId
                };
                dates.push(_o);
            }
        }
        if (dates.length === 1) return cb(dates[0]);
        cb(dates);
    },
    seo: function(o, message, cb) {
        o.widgets.forEach(function(w) {
            if (w.type === 'seo_meter') {
                o.calc_percent = w['seo_meter']['performance_percent']
                return;
            }
        });
        cb(o);
    },
    accessibility: function(o, message, cb) {
        var rules = {
                notice: {
                    max: 100,
                    weight: 10
                },
                error: {
                    max: 100,
                    weight: 70
                },
                warning: {
                    max: 100,
                    weight: 20
                }
            },
            sum = 0;

        var widgetData = _.groupBy(o.widgets[0].data, 'type');
        var counts = _.mapValues(widgetData, function(value, key) {
            var l;
            l = (value.length) ? (value.length > rules[key].max ? rules[key].max : value.length) : 0;

            return (l / (rules[key].max)) * rules[key].weight;
        });

        for (var index in counts) sum += counts[index];
        o.calc_percent = 100 - sum;
        cb(o);
    },
    performance: function(o, message, cb) {
        var cnt = 0,
            sum = 0;
        for (var i in o.widgets[0].data) {
            for (var j in o.widgets[0].data[i].data['ruleGroups']) {
                sum += o.widgets[0].data[i].data['ruleGroups'][j].score;
                cnt++;
            }
        }
        o.calc_percent = sum / cnt;
        cb(o);
    },
    _undefined: function(o, message, cb) {
        console.log('ENTER UNDEFINED TRANSLATION');
        return cb(o);
    }
};
