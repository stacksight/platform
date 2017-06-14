'use strict';

angular.module('mean.stack').factory('Stack', ['Sapi', '$q', '$http',
    function(Sapi, $q, $http) {
        var stack;
        var urlPattern = /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;


        return {
            find: function(cb) {
                Sapi.get({
                    cmd_api: '/sapi/stacks'
                }).then(function(stacks) {
                    cb(null, stacks);
                }, function(err) {
                    cb(err);
                });
            },
            findOne: function(id, cb) {
                if (stack && stack._id === id) return cb(stack);
                Sapi.get({
                    cmd_api: '/sapi/stacks/' + id + '?populate=collaborators'
                }).then(function(data) {
                    stack = data;
                    stack.tags = stack.tags || [];
                    stack.tags.push({
                        value: stack.company.name.toLowerCase(),
                        desc: 'company'
                    });

                     if (data && data.collaborators) {
                        data.collaborators.forEach(function(col) {
                            if (!col.id) return;
                            var cData = col.id;
                            delete col.id;
                            col.id = cData._id;
                            col.name = cData.name;
                            col.profile = cData.profile;
                        });
                    }

                    cb(data);
                }, function() {
                    cb();
                });
            },
            update: function(id, data, cb) {
                var data = {
                    stack: data,
                    action: 'updateDetails'
                };
                Sapi.put({
                    cmd_api: '/stacks/' + id,
                    data: data
                }).then(function(data) {
                    cb(null, data);
                }, function(err) {
                    cb(err);
                });
            },
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
                }).then(function(data) {
                    cb(null, data);
                }, function(err) {
                    cb(err);
                });
            },
            createFromPlatform: function(projects, cb) {

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
                    cmd_api: '/stacks/create/platform',
                    data: {
                        projects: projects
                    }
                }).then(function(data) {
                    cb(null, data);
                }, function(err) {
                    cb(err);
                });
            },
            avgScore: function(stackId) {
                var defer = $q.defer();
                Sapi.get({
                    cmd_api: '/sapi/healthStats/avgScore/' + stackId
                }).then(function(data) {
                    defer.resolve(data);
                }, function(error) {
                    defer.reject(error);
                });
                return defer.promise;
            }
        };
    }
]);