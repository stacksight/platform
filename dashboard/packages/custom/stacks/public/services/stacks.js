'use strict';

angular.module('mean.stacks').factory('Stacks', ['Sapi', '$q', '$http', 'Serialize',
	function(Sapi, $q, $http, Serialize) {
		var stack;
		var urlPattern = /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;

		return {
			find: function(options, cb) {

				Sapi.get({
					cmd_api: '/sapi/stacks?' + Serialize.obj2qs(options)
				}).then(function(stacks) {
					stacks.forEach(function(stack) {
						stack.tags = stack.tags || [];
						if (stack.company)
							stack.tags.push({
								value: stack.company.name.toLowerCase(),
								desc: 'company'
							});
					});
					cb(null, stacks);
				}, function(err) {
					cb(err);
				});
			},
			findByCollaborator: function(collaboratorId, company, cb) {

				Sapi.get({
					cmd_api: '/sapi/stacks/user/' + collaboratorId + '/company/' + company._id
				}).then(function(stacks) {
					stacks.forEach(function(stack) {
						stack.tags = stack.tags || [];
						stack.tags.push({
							value: company.name.toLowerCase(),
							desc: 'company'
						});
					});
					cb(null, stacks);
				}, function(err) {
					cb(err);
				});
			},
			findOne: function(id, cb) {
				if (stack && stack._id === id) return cb(stack);
				Sapi.get({
					cmd_api: '/sapi/stacks/' + id
				}).then(function(data) {
					stack = data;
					cb(data);
				}, function() {
					cb();
				});
			},
			update: function(id, data, cb) {
				console.log('UPDATE DATA ==========', data);
				Sapi.put({
					cmd_api: '/stacks/' + id,
					data: data
				}).then(function(data) {
					cb(null, data);
				}, function(err) {
					cb(err);
				});

			},
			// updateArray: function(id, data, cb) {
			// 	var options =  {};
			// 	Sapi.put({
			// 		cmd_api: '/stacks/' + id,
			// 		data: data
			// 	}).then(function(data) {
			// 		cb(null, data);
			// 	}, function(err) {
			// 		cb(err);
			// 	});

			// },
			delete: function(id, cb) {
				Sapi.delete({
					cmd_api: '/stacks/' + id
				}).then(function(data) {
					cb(null, data);
				}, function(err) {
					cb(err);
				});
			},
			relocation: function(id, to, cb) {
				Sapi.put({
					cmd_api: '/stacks/' + id + '/relocation',
					data: {
						to: to
					}
				}).then(function(data) {
					cb(null, data);
				}, function(err) {
					cb(err);
				});
			},
			importFromPlatform: function(user, cb) {
				if (!user.oauth_platform || !user.oauth_platform.api_token) return cb('You must enter platform api key');
				Sapi.post({
					cmd_api: '/stacks/import/platform',
					data: {
						token: user.oauth_platform.api_token
					}
				}).then(function(data) {
					cb(null, data);
				}, function(err) {
					cb(err);
				});
			},
			create: function(stack, cb) {
				if (!stack.host) return cb("Stack host is required");
				if (!urlPattern.test(stack.host)) return cb("Invalid host");
				Sapi.post({
					cmd_api: '/stacks',
					data: stack
				}).then(function(stack) {
					stack.tags = stack.tags || [];
					if (stack.company)
						stack.tags.push({
							value: stack.company.name.toLowerCase(),
							desc: 'company'
						});
					cb(null, stack);
				}, function(err) {
					cb(err);
				});
			},
			createFromPlatform: function(company, projects, cb) {

				var envs = [];

				projects.forEach(function(project) {
					envs = [];
					project.environments.forEach(function(env) {
						if (env.selected && (env.selected === true || env.selected === 'true')) {
							envs.push(env);
						}
					});
					project.environments = envs;
				});

				Sapi.post({
					cmd_api: '/stacks/create/' + company + '/platform',
					data: {
						projects: projects
					}
				}).then(function(data) {
					cb(null, data);
				}, function(err) {
					cb(err);
				});
			}
		};
	}
]);