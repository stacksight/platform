'use strict';

var mean = require('meanio');

exports.get = function(req, res, next) {

	var roles = req.user ? req.user.roles : ['anonymous'];
	var menu = 'network';
	var defaultMenu = req.query.defaultMenu || [];

	if (!Array.isArray(defaultMenu)) defaultMenu = [defaultMenu];

	var items = mean.menus.get({
		roles: roles,
		menu: menu,
		defaultMenu: defaultMenu.map(function(item) {
			return JSON.parse(item);
		})
	});

	req.menus = items;
	next();
};


