'use strict';

/* jshint -W098 */
angular.module('mean.stack').controller('IntegrationsBitbucketController', ['$scope', 'Global', 'Stacks', 'Appsun', '$stateParams', 'MeanSocket', 'ConfigApp',
    function($scope, Global, Stacks, Appsun, $stateParams, MeanSocket, ConfigApp) {

        var vmibb = this;
        vmibb.global = Global;

        ConfigApp.get().then(function(config) {
            vmibb.cmd = config.apiHost + '/integrations/webhook/bitbucket?type=event&token=' + vmibb.global.user.profile.token + '&appId=' + $scope.stack._id;
        });

        var options = {};
        options.id = $stateParams.id;
        options.index = 'integrations-bitbucket';
        options.from = 0;
        options.size = 200;
        options.type = 'integrations-bitbucket';

        vmibb.docs = [];
        vmibb.showLoader = true;
        Appsun.bitbucket(options, function(data) {
            vmibb.showLoader = false;
            if (!data || !data.docs) return;
            var created;
            data.docs.forEach(function(o) {
                created = o._source.created;
                o = prepereItem(o);
                o.created = created;
                vmibb.docs.push(o);
            });
        });

        function prepereItem(o) {
            o = o._source.data;
            o.actor = (o.actor) ? o.actor.display_name : '';
            getDetails(o);
            return o;
        }

        function getDetails(o) {
            o.action = '';
            o.name = '';
            o.object = '';
            var types = o.eventKey.split(':');
            switch (types[0]) {
                case 'issue':
                    o.object = 'issue';
                    o.name = o.issue.title;
                    o.action = o.eventKey.split('issue:')[1];
                    o.action = (o.action === 'comment_created') ? 'commented' : o.action;
                    o.link = o.issue.links.html.href;
                    break;
                case 'repo':
                    switch (types[1]) {
                        case 'push':
                            if (!o.push.changes[0].new) {
                                o.action = 'deleted';
                                o.name = o.push.changes[0].old.name;
                                o.object = o.push.changes[0].old.type;
                            } else if (!o.push.changes[0].old) {
                                o.action = 'created';
                                o.name = o.push.changes[0].new.name;
                                o.object = o.push.changes[0].new.type;
                            } else {
                                var messages = '',
                                    cnt = 0;
                                o.push.changes[0].commits.forEach(function(c) {
                                    messages += c.message + ' ,';
                                    cnt++;
                                });
                                messages = messages.slice(0, -1);
                                o.action = 'pushed';
                                o.name = messages;
                                o.object = (cnt > 1) ? 'commits' : 'commit';
                                o.cont = 'to ' + o.repository.name + ' ' + o.push.changes[0].new.type;
                            }
                            o.link = o.push.changes[0].links.html.href;
                            break;
                        case 'fork':
                            o.action = 'forked to';
                            o.name = o.fork.full_name;
                            o.object = 'repo';
                            o.link = o.fork.links.html.href;
                            break;
                        case 'commit_comment_created':
                            o.action = 'commented';
                            o.name = o.commit.message;
                            o.object = 'commit';
                            o.link = o.comment.links.html.href;
                            break;
                        case 'commit_status_created':
                            //TODO: check commit comment created;
                            o.action = 'commented';
                            o.name = o.commit.message;
                            o.object = 'commit';
                            break;
                    }
                    break;
                case 'pullrequest':
                    o.object = 'pull request';
                    o.name = o.pullrequest.title;
                    o.action = (o.eventKey.split('pullrequest:')[1] === 'comment_created') ? 'commented' : o.eventKey.split('pullrequest:')[1];
                    o.link = o.pullrequest.links.html.href;
                    break;
            }
        };


        MeanSocket.on('log added', function(log) {
            if (log._source.appId === $stateParams.id && log._type.indexOf('bitbucket') !== -1) {
                console.log('------LOG ADDED----', log);
                var created = log._source.created;
                log = prepereItem(log);
                log.created = created;
                vmibb.docs.unshift(log);
            }
        });
    }

]);
