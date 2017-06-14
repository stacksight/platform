'use strict';

angular.module('mean.apps').factory('Apps', ['Sapi', 'Global', 'Updates',
    function(Sapi, Global, Updates) {

        function update(id, data, cb) {
            Sapi.put({
                cmd_api: '/apps/' + id,
                data: data
            }).then(function(data) {
                cb(null, data);
            }, function(err) {
                cb(err);
            });
        }

        return {
            find: function(cb) {
                Sapi.get({
                    cmd_api: '/sapi/apps'
                }).then(function(apps) {
                    var data = {
                        apps: apps
                    };
                    cb(null, data);
                }, function(data) {
                    cb(data);
                });
            },
            updates: function(apps, cb) {
                var stacks = [];
                var data = {
                    appUpdates: {},
                    stacksUpdates: {},
                    apps: apps
                };
                var available, critical;
                data.apps.forEach(function(app) {
                    data.appUpdates[app._id] = {
                        critical: 0,
                        available: 0
                    };
                    app.stacks.forEach(function(stack) {
                        stacks.push(stack);
                    });
                });
                Updates.all(stacks, function(err, updates) {
                    if (err) return console.log('GET UPDATES ERR:', err);
                    data.stacksUpdates = updates;
                    data.apps.forEach(function(app) {
                        //app.insightClass is temporary until insights will be live...
                        if (!app.stacks || !app.stacks.length) return app.insightClass = 'no-stacks';
                        app.stacks.forEach(function(stack) {

                            if (updates[stack] || (stack && stack._id && updates[stack._id])) {
                                critical = (updates[stack]) ?  updates[stack].critical.length : updates[stack._id].critical.length;
                                available = (updates[stack]) ?  updates[stack].available.length : updates[stack._id].available.length;

                                data.appUpdates[app._id].critical += critical;
                                data.appUpdates[app._id].available += available;

                                if (stack._id) {
                                    if (critical) {
                                        stack.updatesText = critical + ' Update(s) required';
                                        stack.insightClass = 'red';
                                    } else if (available) {
                                        stack.updatesText = available + ' Update(s) available';
                                        stack.insightClass = 'yellow';
                                    }
                                }
                            }

                            app.insightClass = (data.appUpdates[app._id].critical) ? 'critical' :
                                               (data.appUpdates[app._id].available) ? 'available' : 'updated';
                        });
                    });
                    cb(null, data);
                });
            },
            findOne: function(id, cb) {
                Sapi.get({
                    cmd_api: '/sapi/apps/' + id
                }).then(function(data) {
                    cb(null, data);
                }, function(data) {
                    cb(data);
                });
            },
            create: function(data, cb) {
                Sapi.post({
                    cmd_api: '/apps',
                    data: data
                }).then(function(data) {
                    data.insightClass = 'no-stacks';
                    cb(null, data);
                }, function(err) {
                    cb(err);
                });
            },
            update: update,
            delete: function(app, cb) {

                if (app.author._id === Global.user._id) {
                    Sapi.delete({
                        cmd_api: '/apps/' + app._id
                    }).then(function(data) {
                        cb(null, data);
                    }, function(err) {
                        cb(err);
                    });
                } else {
                    swal({
                        title: "Are you sure?",
                        text: "You are not the owner of this group therefore by confirming you will not see it in your dadshboard anymore!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, remove it!",
                        closeOnConfirm: false
                    }, function() {
                        var data = {
                            action: 'updateArray',
                            updateAction: 'disconnect',
                            object: Global.user,
                            array: 'collaborators',
                            key: 'email'
                        };
                        update(app._id, data, function(err, data) {
                            if (err) return cb(err);
                            swal("Removed!", "This group has been removed.", "success");
                            cb(null);
                        });
                    });
                }
            }
        };
    }
]);