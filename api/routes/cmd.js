'use strict';

var express = require('express');
var router = express.Router();

var apps = require('../controllers/apps');
var stacks = require('../controllers/stacks');
var users = require('../controllers/users');

router.use(function(req, res, next) {
	console.log('============ I am a middleware of commands routes ==========');
	next();
});

router.post('/stack', users.slackauthorize, function(req, res) {
	if(req.body.text){
		var split_command = req.body.text.split(' ');
		switch (split_command[0]){
			case 'list':
				req.slack = {
					response_url: req.body.response_url
				}
				apps.slack_find_groups(req, res);
				break;
			case 'stacks':
				req.slack = {
					response_url: req.body.response_url,
					group: split_command[1]
				};
				apps.slack_find_stacks(req, res);
				break;
			case 'info':
				req.slack = {
					response_url: req.body.response_url,
					group: split_command[1]
				};
				apps.slack_info_group(req, res);
				break;
			case 'health':
				break;
			default:
				res.send({
					"response_type": "in_channel",
					"text": "Unknown command",
				});
				break;
		}
		//apps.find_slack
	}
});

module.exports = router;
