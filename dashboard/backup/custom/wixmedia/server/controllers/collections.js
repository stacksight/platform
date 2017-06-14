'use strict';
var request = require('request');
var WixAuthClient = require('../../node_modules/wixmedia/src/node/AuthClient');

module.exports = function (Wixmedia) {
    var COLLECTIONS_API_URL = Wixmedia.config.COLLECTIONS_API_URL;

    return {
        get: function (req, res) {
            Wixmedia.settings(function (err, settingsRow) {
                if (err) {
                    return res.status(500).json({error: err});
                }

                if (settingsRow === null) {
                    return res.status(500).json({error: 'no settings'});
                }

                var settings = settingsRow.settings;

                var authClient = new WixAuthClient(settings.apiKey, settings.apiSecret);

                authClient.getAuthToken().then(function (token) {
                    var headers = authClient.getAuthHeaders(token);
                    headers['Content-Type'] = 'application/json';
                    request({
                        url: COLLECTIONS_API_URL + '?type=image',
                        method: 'GET',
                        headers: headers
                    }, function (err, response, body) {
                        if (err) {
                            return res.status(500).json({error: err});
                        }
                        try {
                            res.json(JSON.parse(body).collections || []);
                        } catch (e) {
                            res.status(500).json({error: e});
                        }
                    });
                }, function (err) {
                    return res.status(500).json({error: err});
                });
            });
        },

        add: function (req, res) {
            Wixmedia.settings(function (err, settingsRow) {
                if (err) {
                    return res.status(500).json({error: err});
                }

                var settings = settingsRow.settings;

                var authClient = new WixAuthClient(settings.apiKey, settings.apiSecret);

                authClient.getAuthToken().then(function (token) {
                    var headers = authClient.getAuthHeaders(token);
                    request({
                        url: COLLECTIONS_API_URL,
                        method: 'POST',
                        json: true,
                        body: {
                            type: 'image',
                            title: req.body.title,
                            items: [],
                            public_properties: {},
                            private_properties: {}
                        },
                        headers: headers
                    }, function (err) {
                        if (err) {
                            return res.status(500).json({error: err});
                        }

                        res.json({success: true});
                    });
                });
            });
        },

        remove: function (req, res) {
            Wixmedia.settings(function (err, settingsRow) {
                if (err) {
                    return res.status(500).json({error: err});
                }

                var settings = settingsRow.settings;

                var authClient = new WixAuthClient(settings.apiKey, settings.apiSecret);

                authClient.getAuthToken().then(function (token) {
                    var headers = authClient.getAuthHeaders(token);
                    headers['Content-Type'] = 'application/json';
                    request({
                        url: COLLECTIONS_API_URL + '/' + req.params.id,
                        method: 'DELETE',
                        headers: headers
                    }, function (err) {
                        if (err) {
                            return res.status(500).json({error: err});
                        }
                        res.json({success: true});
                    });
                });
            });
        }
    }
};
