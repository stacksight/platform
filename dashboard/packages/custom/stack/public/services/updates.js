angular.module('mean.stack').factory('Updates', ['Sapi',
    function(Sapi) {

        var statusTypes = {
            critical: [1],
            available: [2, 3, 4, 5]
        };
        return {
            statusTypes: statusTypes,
            all: function(ids, cb) {
                Sapi.post({
                    cmd_api: '/updates',
                    data: ids
                }).then(function(data) {
                    // var stacksUpdates = {};
                    // data.forEach(function(update) {
                    //     if (!stacksUpdates[update._source.appId])
                    //         stacksUpdates[update._source.appId] = {
                    //             critical: [],
                    //             available: []
                    //         };
                    //     else return;
                    //     update._source.data.forEach(function(doc) {
                    //         if (statusTypes.critical.indexOf(doc.status) > -1) stacksUpdates[update._source.appId].critical.push(doc);
                    //         else stacksUpdates[update._source.appId].available.push(doc);
                    //     });
                    // });
                    // cb(null, stacksUpdates);
                    /////////////////////////////
                    var stacksUpdates = {};
                    data.forEach(function(stack) {
                        if (!stacksUpdates[stack.key])
                            stacksUpdates[stack.key] = {
                                critical: [],
                                available: []
                            };
                        if (stack['top-stacks-hits'].hits.hits[0]._source.data && stack['top-stacks-hits'].hits.hits[0]._source.data.length)
                            stack['top-stacks-hits'].hits.hits[0]._source.data.forEach(function(doc) {
                                if (doc.current_version === doc.latest_version || !doc.title) return;
                                if (statusTypes.critical.indexOf(doc.status) > -1) stacksUpdates[stack.key].critical.push(doc);
                                else stacksUpdates[stack.key].available.push(doc);
                            });
                    });
                    cb(null, stacksUpdates);
                }, function(err) {
                    cb(err);
                });
            }
        }

    }
]);
