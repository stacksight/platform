require('../providers/rabbitmq');
require('../controllers/events');

var express = require('express'),
    router = express.Router(),
    users = require('../controllers/users'),
    apps = require('../controllers/apps'),
    stacks = require('../controllers/stacks'),
    appsun = require('../controllers/appsun'),
    oauth = require('../controllers/oauth'),
    healthStats = require('../controllers/health-stats'),
    plans = require('../controllers/billing/plans'),
    customers = require('../controllers/billing/customers'),
    charges = require('../controllers/billing/charges'),
    subscriptions = require('../controllers/billing/subscriptions'),
    coupons = require('../controllers/billing/coupons'),
    cp = require('../controllers/configuration-policy'),
    pubConf = require('../controllers/public-config'),
    companies = require('../controllers/companies'),
    tags = require('../controllers/tags'),
    acl = require('../services/acl')(),
    notifications = require('../controllers/notifications');

/*
  Users requests
*/

// Create User
router.post('/user', users.create, users.createToken, companies.create);
router.post('/user/socialLogin/:provider', users.socialLogin, users.create, users.createToken, companies.create);

// Get user ID based on authorized token
router.get('/user', users.authorize, users.findOne);
router.put('/user', users.authorize, users.update);

router.get('/users', users.authorize, users.find);

router.post('/user/login', users.login, users.get);

router.post('/forgot-password', users.forgotpassword);

router.post('/reset/:token', users.resetpassword);
router.post('/user/changepassword', users.authorize, users.changepassword);


/*
  Tags functions
*/
router.route('/tags/all')
    .get(users.authorize, tags.find);
router.route('/tags/:companyId')
    .get(users.authorize, companies.company, acl.hasPermissions, tags.find);
router.route('/tags/:stackId')
    .post(users.authorize, stacks.stack, acl.hasPermissions, tags.create, stacks.update);

router.route('/tags/:stackId/:companyId')
    .get(users.authorize, companies.company, acl.hasPermissions, tags.find);

/*
 Oauth
*/

router.route('/oauth/slack/check').post(users.authorize, oauth.code);
/*
  Stacks functions
*/
router.route('/stacks')
    .get(users.authorize, stacks.find)
    .post(users.authorize, companies.company, acl.hasPermissions, cp.numStacks, stacks.create);

router.route('/stacks/:stackId')
    .get(users.authorize, stacks.stack, acl.hasPermissions, stacks.findOne)
    .put(users.authorize, stacks.stack, acl.hasPermissions, stacks.update)
    .delete(users.authorize, stacks.stack, acl.hasPermissions, stacks.delete);

router.route('/stacks/:stackId/confirmInvitation')
    .get(users.authorize, stacks.stack, cp.teamSupport, stacks.confirmInvitation);

router.route('/stacks/import/:source')
    .post(users.authorize, stacks.import);

router.route('/stacks/create/:companyId/:source')
    .post(users.authorize, companies.company, acl.hasPermissions, cp.numStacks, stacks.createFromSource);

router.route('/stacks/user/:userId/company/:companyId')
    .get(users.authorize, companies.company, acl.hasPermissions, stacks.byCollaborator);

/*
  Companies functions
*/

router.route('/companies/:companyId/inviteCollaborators')
    .post(users.authorize, companies.company, acl.hasPermissions, cp.teamSupport, companies.inviteCollaborators);
router.route('/companies/:companyId/removeCollaborators')
    .post(users.authorize, companies.company, acl.rewritePath, acl.hasPermissions, companies.removeCollaboratorByGuest ,companies.removeCollaborators);
router.route('/companies/:companyId/confirmInvitation')
    .get(users.authorize, companies.company, cp.teamSupport, companies.confirmInvitation);
router.route('/companies/:companyId/updateRole')
    .post(users.authorize, companies.company, acl.hasPermissions, companies.updateRole);


router.route('/companies/:companyId')
    .get(users.authorize, companies.company, acl.hasPermissions, companies.findOne);

/*
 AppSun functions
 */

router.get('/Appsun/search/:stackId/:index/:type', users.authorize, stacks.stack, appsun.getIndex, appsun.search);
router.get('/Appsun/aggs/:name/:stackId/:index/:type?', users.authorize, stacks.stack, appsun.getIndex, appsun.aggregation);

router.get('/stacksun/search/:index/:type?', users.authorize, stacks.find, appsun.getIndex, appsun.search);
router.get('/stacksun/aggs/:name/:index/:type', users.authorize, stacks.find, appsun.getIndex, appsun.aggregation);


/*
 Diagrams functions
 */

router.get('/healthStats/latestScore/:stackId', stacks.stack, healthStats.latestScore);
router.get('/healthStats/:type/:stackId', healthStats.generic);
/*
 Mails functions
 */

var mails = require('../providers/mails');
router.route('/mail/:tpl/:to')
    .post(mails.sendTests);

/*
 Crons functions
 */

var crons = require('../crons');
router.get('/crons/:type/:subtype?', crons.requireAuth, crons.producer);

var autocomplete = require('../controllers/autocomplete-search');
router.get('/autocomplete-search/:index/:type', users.authorize, stacks.find, autocomplete.search);

var inventory = require('../controllers/inventory');
router.get('/inventory/search', users.authorize, stacks.find, inventory.search);
router.get('/inventory/info', users.authorize, stacks.find, inventory.info);


var notifyCtrl = require('../controllers/notify');
router.post('/notify/:by', users.authorize, notifyCtrl.notify);
router.post('/notify/:by/:appId', users.authorize, apps.app, notifyCtrl.notify);

/*
 Billing functions
 */

router.route('/plans/personal')
    .get(users.authorize, plans.personal);

router.route('/plans/:id?')
    .get(function(req, res, next) {
        if (req.params.id)
            return next();
        plans.find(req, res);
    }, plans.plan, plans.findOne);

router.route('/customers/:id?')
    .post(users.authorize, customers.create)
    .put(users.authorize, customers.authorize, customers.update);

router.route('/subscriptions/:companyId')
    .post(users.authorize, companies.company, companies.isOwner, subscriptions.checkCoupon, coupons.hasPermissions, companies.changeName, subscriptions.findOrCreate, subscriptions.pay);

router.route('/coupons')
    .post(users.authorize, coupons.hasPermissions, coupons.findOne);

router.route('/charges')
    .get(users.authorize, customers.authorize, charges.getByUser);

/*
 Public config functions
 */

router.route('/config')
    .get(users.authorize, pubConf.get)

/*
 Notifications functions
 */
router.route('/notifications')
    .get(users.authorize, notifications.find);


module.exports = router;