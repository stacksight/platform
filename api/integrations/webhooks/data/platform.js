'use strict';

module.exports = {
    requiredFields: ['token'],
    'environment.push': {
        type: '*commit',
        action: '*pushed',
        user: 'payload.user.display_name',
        getname: function(data) {
            if (data.payload.commits_count === 1)
                return data.payload.commits[0].message
            return data.payload.commits_count;
        }
    }
};