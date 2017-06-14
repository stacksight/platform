'use strict';

var config = require(process.cwd() + '/config');

exports.get = function(req, res, next) {
    return res.send({
        slack: {
            app_id: config.slack.client_id
        },
        billingProvider: config.billingProvider,
        defaultPlan: config.defaultPlan,
        dashboardHost: config.dashboardHost,
        apiHost: config.host + config.baseUrl,
        stripe: {
            publicKey: config.stripe.publicKey
        },
        appPolicy: {
            government: {
                security: 80,
                performance: 40,
                seo: 30,
                backups: 100,
                accessibility: 90
            },
            enterprise: {
                security: 70,
                performance: 30,
                seo: 40,
                backups: 60,
                accessibility: 70
            },
            university: {
                security: 80,
                performance: 80,
                seo: 80,
                backups: 80,
                accessibility: 80
            },
            startup: {
                security: 20,
                performance: 20,
                seo: 20,
                backups: 20,
                accessibility: 20
            }
        }
    });
};