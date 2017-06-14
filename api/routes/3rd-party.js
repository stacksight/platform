'use strict';

var express = require('express'),
    router = express.Router(),
    addRequestId = require('express-request-id')(),
    elastic = require('../controllers/elastic'),
    integrations = require('../controllers/integrations'),
    users = require('../controllers/users'),
    webhooks = require('../controllers/webhooks'),
    stacks = require('../controllers/stacks'),
    companies = require('../controllers/companies'),
    cp = require('../controllers/configuration-policy');



// main index route
router.post('/index/:index/:type/:id?', addRequestId, elastic.index);

// old integrations API (for github/gitlab/bitbucket)
router.post('/integrations/:service', integrations.requiredParams, integrations.index);

// new integrations API - change implement class
router.post('/integrations/:type/:service', integrations.start);

router.post('/webhooks/calendly', webhooks.calendly);

// create stacks for multisite
// Send users.authorize as POST Header Authorization (token) (i.e. curl --header "Authorization: $DNOTIFICATIONSTOKEN")
// companies.findByUser -> where the user is an owner
// cp.numStacks - Check Stack number Limits
// stacks.register -> register the stacks.
router.post('/stacks/register/:cms?', users.authorize, companies.findByUser, cp.numStacks, stacks.register);


module.exports = router;
