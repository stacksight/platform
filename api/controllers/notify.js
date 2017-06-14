'use strict';

var notifyService = require('../services/notify');

exports.notify = function(req, res, next) {
    if (!req.body.emails) return res.status(400).send('email data is missing');
    var by = req.params.by,
        recipients = req.body.emails, //change it to be generic
        body = req.body.body;

    if (!notifyService.notify[by]) return res.status(400).send('This notify option is not supported yet');
    if (!recipients || !body) return res.status(400).send('Missing data. Check your request again');

    var emailObj = {
        to: recipients,
        locals: {
            groupName: (req._app) ? req._app.name : '',
            sender: req.user.name,
            body: body
        },
        tpl: 'free-text',
        subject: 'Stacksight Message'
    };

    notifyService.notify[by](emailObj, function(err, data) {
    	if (err) return res.status(500).send(err);
    	res.send(data);
    });

};
