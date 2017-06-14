'use strict';

var mongoose = require('mongoose');
var Company = mongoose.model('Company');
var User = mongoose.model('User');
var _ = require('lodash');

module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {
    var errWithoutCatch;
    var app = message;
    Company.findOne({
        owner: app.author
    }).exec(function(err, company) {
        if (err) {
            error();
            return console.log(2, err);
        }
        console.log('APP', app.name, 'COMPANY', company.name);
        if (!company) return done();
        var newCollaborators = [];
        app.collaborators.forEach(function(appCol) {
            var exists = _.find(company.collaborators, {
                'email': appCol.email
            });
            if (!exists) {
                appCol.permissions = ['guest'];
                newCollaborators.push(appCol);
                if (appCol.id) {
                    User.findOne({
                        _id: appCol.id
                    }).exec(function(err, user) {
                        if (err) {
                            errWithoutCatch = err;
                            return console.log('find user err', err, company.name, appCol);
                        }
                        user.companies.addToSet({
                            id: company._id,
                            permission: (company.owner.toString() === user._id.toString()) ? 'owner': 'guest',
                            name: company.name
                        });
                        user.save(function(err) {
                            if (err) console.log('COMPANY DIDNT SAVE IN USER');
                            console.log('USER ' + user.name + ' saved');
                        });
                    });
                }
            }
            if (exists && appCol.id) {
                User.findOne({
                    _id: appCol.id
                }).exec(function(err, user) {
                    if (err) {
                        errWithoutCatch = err;
                        return console.log('find user err', err, company.name, appCol);
                    }
                    user.companies.addToSet({
                        id: company._id,
                        permission: (company.owner.toString() === user._id.toString()) ? 'owner' : 'guest',
                        name: company.name
                    });
                    user.save(function(err) {
                        if (err) {
                            errWithoutCatch = err;
                            return console.log('COMPANY DIDNT SAVE IN USER', err);
                        }
                        console.log('USER ' + user.name + ' saved');
                    });
                });
            }
        });
        if (newCollaborators.length) {
            Company.update({
                _id: company._id
            }, {
                $push: {
                    collaborators: {
                        $each: newCollaborators
                    }
                }
            }).exec(function(err, doc) {
                if (err) console.log('UPDATE ERR', err);
                console.log('COMPANY ' + company.name + ' SAVED OK');
                done();
            });
        } else {
            done();
        }

        // if (errWithoutCatch) error();
    });
};