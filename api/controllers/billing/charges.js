'use strict';

var config = require(process.cwd() + '/config'),
    billingProvider = config.billingProvider,
    billingChargesController = require('./' + billingProvider + '/charges');



exports.getByUser = function(req, res) {
    billingChargesController.list({
        customer: req.user.profile.billing[billingProvider].id
    }, function(err, charges) {
        if (err) return res.status(500).send(err);
        res.send(charges);
    });
};
