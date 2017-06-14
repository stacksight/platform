'use strict';



/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Stripe, app, auth, database) {

    var stripe = require('../controllers/stripe')(Stripe);
    /*

    This will be refactored. Dont panick :) !

    */

    // For custom users
    app.get('/stripe/cards', auth.requiresLogin, stripe.getCards);

    app.post('/stripe/cards', auth.requiresLogin, stripe.addCard);

    app.post('/stripe/subscribe', auth.requiresLogin, stripe.subscribe);


    // For all admin
    app.get('/stripe/customers', auth.requiresAdmin, stripe.customers);

    app.get('/stripe/charges', auth.requiresAdmin, stripe.charges);

    app.get('/stripe/config', auth.requiresLogin, stripe.getConfig);

    app.post('/stripe/config', auth.requiresAdmin, stripe.updateConfig);

    app.get('/stripe/plans', auth.requiresLogin, stripe.plans);

    app.put('/stripe/plans/:id', auth.requiresAdmin, stripe.updatePlan);

    app.get('/stripe/plans/:id', auth.requiresLogin, stripe.getPlan);

    app.get('/stripe/customer/:id', auth.requiresLogin, stripe.getCustomer);
};
