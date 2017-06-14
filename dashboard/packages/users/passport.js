'use strict';

/*jshint nonew: false */


var mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GitHubStrategy = require('passport-github2').Strategy,
    GoogleStrategy = require('passport-google-oauth20').Strategy,
    LinkedinStrategy = require('passport-linkedin-oauth2').Strategy,
    GooglePlusStrategy = require('passport-google-plus'),
    User = mongoose.model('User'),
    request = require('request'),
    Profile = require('../custom/profile/server/providers/profile.js').Profile,
    Profile = new Profile(),
    config = require('meanio').loadConfig();

module.exports = function(passport) {
    // Serialize the user id to push into the session
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // Deserialize the user object based on a pre-serialized token
    // which is the user id
    passport.deserializeUser(function(user, done) {
        done(null, user);
        // User.findOne({
        //     _id: user._id
        // }).exec(function(err, user1) {
        //     done(err, user1);

        // });
    });

    // Use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {
            var options = {
                uri: config.meanApi.uri + '/user/login',
                form: {
                    'email': email,
                    'password': password
                }
            };
            request.post(options, function(error, response, body) {
                if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
                    body = JSON.parse(body);
                    return done(null, body);
                } else {
                    console.log('login error', error);
                    return done(null, false, {
                        message: 'Unknown user'
                    });
                }
            });
        }));

    // Use google strategy
    passport.use(new GoogleStrategy({
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {

            var body = {
                profile: profile,
                name: profile.displayName,
                email: profile.emails[0].value,
                username: profile.emails[0].value,
                provider: 'google',
                google: profile._json,
                roles: ['authenticated']
            };
            var options = {
                uri: config.meanApi.uri + '/user/socialLogin/google',
                form: body
            };
            request.post(options, function(error, response, body) {
                if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
                    body = JSON.parse(body);
                    return done(null, body);
                } else
                    return done(null, false, {
                        message: 'Google login failed, email already used by other login strategy'
                    });
            });
        }
    ));

    // Use twitter strategy
    passport.use(new TwitterStrategy({
            consumerKey: config.twitter.clientID,
            consumerSecret: config.twitter.clientSecret,
            callbackURL: config.twitter.callbackURL
        },
        function(token, tokenSecret, profile, done) {
            User.findOne({
                'twitter.id_str': profile.id
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (user) {
                    return done(err, user);
                }
                user = new User({
                    name: profile.displayName,
                    username: profile.username,
                    provider: 'twitter',
                    twitter: profile._json,
                    roles: ['authenticated']
                });
                user.save(function(err) {
                    if (err) {
                        console.log(err);
                        return done(null, false, {
                            message: 'Twitter login failed, email already used by other login strategy'
                        });
                    } else {
                        return done(err, user);
                    }
                });
            });
        }
    ));

    // Use facebook strategy
    passport.use(new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL,
            profileFields: ['id', 'displayName', 'photos', 'email']
        },
        function(accessToken, refreshToken, profile, done) {
            var body = {
                profile: profile,
                name: profile.displayName,
                email: profile.emails[0].value,
                username: profile.username || profile.emails[0].value.split('@')[0],
                provider: 'facebook',
                facebook: profile._json,
                roles: ['authenticated']
            };
            var options = {
                uri: config.meanApi.uri + '/user/socialLogin/facebook',
                form: body
            };
            request.post(options, function(error, response, body) {
                if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
                    body = JSON.parse(body);
                    return done(null, body);
                } else
                    return done(null, false, {
                        message: 'Facebook login failed, email already used by other login strategy'
                    });
            });
        }
    ));

    // Use github strategy
    passport.use(new GitHubStrategy({
            clientID: config.github.clientID,
            clientSecret: config.github.clientSecret,
            callbackURL: config.github.callbackURL,
            scope: ['user', 'user:email']
        },
        function(accessToken, refreshToken, profile, done) {

            var body = {
                profile: profile,
                name: profile.displayName || profile.username,
                email: profile.emails[0].value,
                username: profile.username,
                provider: 'github',
                github: profile._json,
                roles: ['authenticated']
            };

            var options = {
                uri: config.meanApi.uri + '/user/socialLogin/github',
                form: body
            };
            request.post(options, function(error, response, body) {
                if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
                    body = JSON.parse(body);
                    return done(null, body);
                } else
                    return done(null, false, {
                        message: 'Github login failed, email already used by other login strategy'
                    });
            });
        }
    ));


    // use linkedin strategy
    passport.use(new LinkedinStrategy({
            clientID: config.linkedin.clientID,
            clientSecret: config.linkedin.clientSecret,
            callbackURL: config.linkedin.callbackURL,
            profileFields: ['id', 'first-name', 'last-name', 'email-address'],
            scope: ['r_emailaddress', 'r_basicprofile'],
            state: true
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function() {
                var body = {
                    profile: profile,
                    name: profile.displayName || (profile.name.givenName + ' ' + profile.name.familyName),
                    email: profile.emails[0].value,
                    username: profile.emails[0].value,
                    provider: 'linkedin',
                    linkedin: profile._json,
                    roles: ['authenticated']
                };

                var options = {
                    uri: config.meanApi.uri + '/user/socialLogin/linkedin',
                    form: body
                };
                request.post(options, function(error, response, body) {
                    if (!error && (response.statusCode === 200 || response.statusCode === 201)) {
                        body = JSON.parse(body);
                        return done(null, body);
                    } else
                        return done(null, false, {
                            message: 'Linked login failed, email already used by other login strategy'
                        });
                });
            });
        }
    ));
    return passport;
};
