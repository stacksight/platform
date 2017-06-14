'use strict';

var stacks = require('../controllers/stacks'),
	users = require('../controllers/users'),
	_ = require('lodash'),
	mongoose = require('mongoose'),
	Notification = mongoose.model('Notification'),
	config = require(process.cwd() + '/config'),
	notifyService = require('../services/notify');

module.exports = function(rabbit, qData) {
	rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {

	stacks._stack(message.data.appId, function(err, stack, company) {

		if (err) {
			error();
			return console.error('HEALTH OBSERVER ERR1', err);
		}

		var integration = _.find(stack.integrations, function(o) { // find the incoming integration by type
			return o.name === message.type;
		});

		if (!message.data.data) return done();
		if (message.data.data.calc_percent) return actions.calc_percent(company, stack, message, integration, done, error);
		if (!message.data.data.widgets) return done();
		actions.notify(company, stack, message, integration, done, error);

	}, true);


}

var actions = {
	calc_percent: function(company, stack, message, integration, done, error) {
		var data = { // my new data
			name: message.type,
			index: 'health',
			type: message.type,
			updated: new Date(),
			data: {
				score: message.data.data.calc_percent
			}
		};


		integration = (integration) ? _.extend(integration, data) : data;

		if (!integration._id) integration = stack.integrations.push(integration);
		// calculate the avg of all integrations

		var cnt = 0,
			sum = 0;
		for (var i = 0; i < stack.integrations.length; i++) {
			var element = stack.integrations[i];
			if (element.data && element.data.score) {
				cnt++;
				sum += element.data.score;
			}
		}
		stack.score = sum / cnt;
		stacks._update(stack, function(err, doc) {
			if (err) {
				error();
				return console.error('HEALTH OBSERVER CALC_PERCENT ERR2', err);
			} else {
				done();
				console.log('HEALTH OBSERVER CALC_PERCENT SUCCESS');
			}
		});
	},
	notify: function(company, stack, message, integration, done, error) {

		if (!company) return done();

		if (!_.isArray(message.data.data.widgets)) message.data.data.widgets = [message.data.data.widgets];

		var category = message.data.data.category;
		if (!category) return done();

		message.data.data.widgets.forEach(function(widget) {
			if (widget.type !== "bool") return done(); // now ssl data contains only 1 widget

			users.getCollaborators(stack, category, function(err, _data) {

				if (err) return error(err);

				var locals = {
					desc: widget.desc,
					company: company.name,
					stack: stack.name,
					link: config.dashboardHost + '/#!/stack/' + stack._id
				};

				if (_data.email) {
					for (var index in _data.email) {
						_data.email[index].forEach(function(email) {
							var notification = new Notification({
								to: email,
								stack: stack._id,
								stackName: stack.name,
								type: category,
								tpl: category,
								locals: locals,
								frequency: index
							});
							notification.save(function(err, doc) {
								if (err) console.error('SAVE BOOL NOTIFICATION ERR', err);
							});
						});
					}
				}

				var obj = {};
				// obj.email = (_data.email && _data.email.immediate) ? {
				// 	to: _data.email.immediate,
				// 	locals: locals,
				// 	tpl: category
				// } : null;
				obj.pushNotification = {
					users: _data.pushNotification,
					alert: category
				};

				obj.slack = {
					users: _data.slack,
					message: '<' + locals.link + '|' + locals.company + '/' + locals.stack  + '>' + ' alert: ' + locals.desc
				};

				for (var key in _data) {
					if (notifyService.notify[key] && obj[key]) notifyService.notify[key](obj[key]);
				}

				done();
			});
		});


	}
};