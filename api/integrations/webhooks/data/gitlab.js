'use strict';

module.exports = {
    'Push Hook': {
        type: '*commit',
        name: 'total_commits_count',
        action: '*pushed',
        user: 'user_name',
        getname: function(data) {
            if (data.commits.length > 1) return data.total_commits_count;
            return data.commits[0].message;
        }
    },
    'Tag Push Hook': {
        type: '*tag',
        name: 'ref',
        action: '*pushed',
        user: 'user_name'
    },
    'Issue Hook': {
        type: 'object_kind',
        name: 'object_attributes.title',
        action: 'object_attributes.action',
        user: 'user.name',
        url: 'object_attributes.url'
    },
    'Note Hook': {
        type: '*comment',
        name: 'object_attributes.noteable_type',
        action: '*created',
        user: 'user.name',
        url: 'object_attributes.url',
        toDelete : ['object_attributes.created_at', 'object_attributes.updated_at']
    },
    'Merge Request Hook': {
        type: 'object_kind',
        name: 'object_attributes.title',
        action: 'object_attributes.action',
        user: 'user.name',
        url: 'object_attributes.url'
    },
    'Wiki Page Hook': {
        type: 'object_kind',
        name: 'object_attributes.title',
        action: 'object_attributes.action',
        user: 'user.name',
        url: 'object_attributes.url'
    },
    'Build Hook': {
        type: 'object_kind',
        name: 'ref',
        action: '*built',
        user: 'user.name'
    }
};