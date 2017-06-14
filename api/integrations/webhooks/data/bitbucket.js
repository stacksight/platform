'use strict';

module.exports = {
    'repo:push': {
        type: '*commit',
        name: 'total_commits_count',
        action: '*pushed',
        user: 'actor.username',
        getname: function(data) {
            if (data.commits.length > 1) return data.total_commits_count;
            return data.commits[0].message;
        }
    },
    'repo:fork': {
        type: '*repository',
        name: 'repository.full_name',
        action: '*forked',
        user: 'actor.username'
    },
    'repo:updated': {
        type: '*repository',
        name: 'repository.full_name',
        action: '*updated',
        user: 'actor.username'
    },
    'repo:commit_comment_created': {
        type: '*comment',
        name: 'comment.content.raw',
        action: '*created',
        user: 'actor.username',
        url: 'comment.links.self.href'
    },
    'issue:created': {
        type: '*issue',
        name: 'issue.title',
        action: '*created',
        user: 'actor.username',
        url: 'issue.links.self.href'
    },
    'issue:updated': {
        type: '*issue',
        name: 'issue.title',
        action: '*created',
        user: 'actor.username',
        url: 'issue.links.self.href'
    },
    'issue:comment_created': {
        type: '*comment',
        name: 'comment.content.raw',
        action: '*created',
        user: 'actor.username',
        url: 'comment.links.self.href'
    },
    'pullrequest:created': {
        type: '*pullrequest',
        name: 'pullrequest.title',
        action: '*created',
        user: 'actor.username',
        url: 'pullrequest.links.self.href'
    },
    'pullrequest:updated': {
        type: '*pullrequest',
        name: 'pullrequest.title',
        action: '*updated',
        user: 'actor.username',
        url: 'pullrequest.links.self.href'
    },
    'pullrequest:approved': {
        type: '*pullrequest',
        name: 'pullrequest.title',
        action: '*approved',
        user: 'actor.username',
        url: 'pullrequest.links.self.href'
    },
    'pullrequest:fulfilled': {
        type: '*pullrequest',
        name: 'pullrequest.title',
        action: '*merged',
        user: 'actor.username',
        url: 'pullrequest.links.self.href'
    },
    'pullrequest:rejected': {
        type: '*pullrequest',
        name: 'pullrequest.title',
        action: '*declined',
        user: 'actor.username',
        url: 'pullrequest.links.self.href'
    },
    'pullrequest:comment_created': {
        type: '*comment',
        name: 'comment.content.raw',
        action: '*created',
        user: 'actor.username',
        url: 'comment.links.self.href'
    },
    'pullrequest:comment_updated': {
        type: '*comment',
        name: 'comment.content.raw',
        action: '*updated',
        user: 'actor.username',
        url: 'comment.links.self.href'
    },
    'pullrequest:comment_deleted': {
        type: '*comment',
        name: 'comment.content.raw',
        action: '*deleted',
        user: 'actor.username',
        url: 'comment.links.self.href'
    }
};