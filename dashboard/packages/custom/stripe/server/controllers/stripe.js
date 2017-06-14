'use strict';

var sapi = require('../../../sapi/server/controllers/sapi');

module.exports = function(Stripe) {
    return {
        getCards: function(req, res) {
            var user = req.user;
            if (!user || !user.stripe || !user.stripe.cid) {
                return res.send(200, {
                    has_more: false,
                    data: []
                });
            }


            var cid = user.stripe.cid;

            Stripe.client.customers.listCards(cid, {
                limit: req.query.limit || 10
            }, function(err, cards) {
                if (err) return res.send(500, err);
                var output = [];
                delete cards.url;
                if (cards.data) {
                    cards.data.forEach(function(card) {
                        output.push({
                            last4: card.last4,
                            type: card.type,
                            brand: card.brand,
                            exp_month: card.exp_month,
                            exp_year: card.exp_year,
                            name: card.name,
                            id: card.id
                        });
                    });
                }
                cards.data = output;
                res.json(cards);
            });
        },
        addCard: function(req, res) {
            var user = req.user;

            //Stripe customer id
            var token = req.body.token;
            var cid = (user.stripe && user.stripe.cid) ? user.stripe.cid : null;
            if (!cid) {
                //Create a new customer
                Stripe.client.customers.create({
                    source: token.id,
                    description: req.user.username
                }).then(function(customer) {

                    var options = {
                        cmd_api: '/user',
                        token: req.user.profile.token,
                        method: 'PUT',
                        form: {
                            stripe: {
                                cid: customer.id,
                                defaultCard: customer.sources.data[0].id //customer.sources.data[0].id
                            }
                        }
                    };

                    sapi.talkToApi(options, function(err, data) {
                        if (err)
                            return res.json(500, {
                                error: 'Something bad happened, try again please.'
                            });
                        req.session.passport.user.stripe.cid = customer.id;

                        req.session.save(function(err) {
                            if (err) return res.send(500, 'Something bad happened, please login again.');
                            res.send({
                                cid: customer.id,
                                card: customer.sources.data[0]
                            });
                        });
                    });
                });

            } else {
                //Add card to existing customer
                Stripe.client.customers.createCard(
                    cid, {
                        card: token.id
                    },
                    function(err, card) {

                        Stripe.client.customers.update(cid, {
                            default_source: card.id
                        }, function(err, customer) {
                            if (err) return res.send(500, "The card added but didn't updated as defaultCard");
                            res.send({
                                card: card
                            });
                        });

                        // req.user.stripe.defaultCard = card.id;

                        // var options = {
                        //     cmd_api: '/user',
                        //     token: req.user.profile.token,
                        //     method: 'PUT',
                        //     form: req.user
                        // };

                        // sapi.talkToApi(options, function(err, data) {
                        //     if (err)
                        //         return res.json(500, {
                        //             error: 'Something bad happened, try again please.'
                        //         });
                        //     req.session.passport.user = req.user;

                        //     req.session.save(function(err) {
                        //         if (err) return res.send(500, 'Something bad happened, please login again.');
                        //         res.send(200, {
                        //             card: card
                        //         });
                        //     });
                        // });
                    });
            }
        },
        subscribe: function(req, res) {
            var planId = req.body.planId;
            var cid = req.user.stripe.cid;
            Stripe.client.customers.retrieve(cid, function(err, customer) {
                if (err) res.status(500).send(err);
                if (customer.subscriptions && customer.subscriptions.data.length) {
                    Stripe.client.customers.updateSubscription(
                        cid,
                        customer.subscriptions.data[0].id, {
                            plan: planId
                        },
                        function(err, subscription) {
                            if (err) return res.send(500);
                            updateUserRole(subscription, req, res);
                        }
                    );
                } else {
                    Stripe.client.customers.createSubscription(
                        cid, {
                            plan: planId
                        },
                        function(err, subscription) {
                            if (err) return res.send(500);
                            updateUserRole(subscription, req, res);
                        }
                    );
                }
            });
        },
        customers: function(req, res) {
            Stripe.client.customers.list({
                limit: req.query.limit || 10
            }, function(err, customers) {
                if (err) return res.send(500, err);
                res.json(customers);
            });
        },
        charges: function(req, res) {
            Stripe.client.charges.list({
                limit: req.query.limit || 10
            }, function(err, customers) {
                if (err) return res.send(500, err);
                res.json(customers);
            });
        },
        getConfig: function(req, res) {
            Stripe.settings(function(err, config) {
                if (err) return res.json(500);
                if (req.user.roles.indexOf('admin') > -1)
                    return res.json(200, config ? config.settings : {});
                res.json(200, config ? {
                    publicKey: config.settings.publicKey
                } : {});
            });
        },
        updateConfig: function(req, res) {
            Stripe.settings(req.body, function(err, config) {
                if (err) return res.json(500);
                res.json(200, config ? config.settings : {});
                Stripe.createClient();
            });
        },
        plans: function(req, res) {
            Stripe.client.plans.list(function(err, plans) {

                if (err) return res.json(500);
                plans.data.forEach(function(plan) {
                    if (plan.metadata.features)
                        plan.features = plan.metadata.features.split('*');

                });
                res.jsonp(plans.data);
            });
        },
        updatePlan: function(req, res) {
            Stripe.client.plans.update(req.params.id, {
                metadata: req.body
            }, function(err, plan) {
                if (err) return res.send(err);
                res.send(plan);
                // asynchronously called
            });
        },
        getPlan: function(req, res) {
            Stripe.client.plans.retrieve(req.params.id, function(err, plan) {
                if (err) return res.send(err);
                if (plan.metadata.features)
                    plan.features = plan.metadata.features.split('*');
                res.send(plan);
            });
        },
        getCustomer: function(req, res) {
            var cid = req.user.stripe.cid;

            Stripe.client.customers.retrieve(cid, function(err, customer) {
                if (err) return res.status(500).send(err);
                res.send(customer);
            });
        }
    }
};


function updateUserRole(subscription, req, res) {

    //update user role
    var options = {
        cmd_api: '/user/updateRole',
        token: req.user.profile.token,
        method: 'PUT',
        form: {
            plan: subscription.plan.id,
            subscription: subscription.id
        }
    };

    sapi.talkToApi(options, function(err, data) {
        if (err)
            return res.json(500, {
                error: 'Something bad happened, try again please.'
            });

        req.session.passport.user = data;

        req.session.save(function(err) {
            if (err) return res.send(500, 'Something bad happened, please login again.');
            res.send(200);

        });

    });
}
