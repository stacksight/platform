'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Profile, app, auth, database) {
    var Profile = require('../providers/profile.js').Profile,
        profile = new Profile();

    app.put('/profile', function(req, res, next) {
        profile.save({id: req.user._id, profile: req.body} , function(err, doc) {
            if (err) return res.json(500, err);
            res.json(200);
        });
    });
};
