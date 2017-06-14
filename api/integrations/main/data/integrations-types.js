'use strict';

module.exports = {
    webhook: {
        requiredParams: ['token', 'appId'],
        folder: 'webhooks'
    },
    scan: {
        requiredParams: ['mngToken', 'appId'],
        folder: 'scans'
    }
};