var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_CONNECTION_STRING);

require('../models/stack');
require('../models/app');
require('../models/user');
require('../models/tag');
require('../models/company');
var Stack = mongoose.model('Stack');
var App = mongoose.model('App');
var Tag = mongoose.model('Tag');
var Company = mongoose.model('Company');
var User = mongoose.model('User');

var length = 0,
    countCompanies = 0,
    countUsers = 0;

User.find({}).exec(function(err, users) {
    if (err) return console.log(err);
    length = users.length;
    users.forEach(function(user) {
        var company = {
            name: user.email,
            owner: user._id,
            collaborators: [{
                id: user._id,
                status: 'accepted',
                email: user.email,
                permissions: ['owner']
            }]
        };
        Company.findOneAndUpdate(company, {
            $set: company
        }, {
            upsert: true,
            new: true
        }).exec(function(err, _company) {
            if (err) return console.log('create company to user ' + user._id + ' ' + user.name + ' was failed', err);
            countCompanies ++;
            // console.log(_company.name + ' default company created.');
            user.companies.addToSet({
                id: _company._id,
                permission: 'owner',
                name: _company.name
            });
            user.save(function(err) {
                if (err) return console.log('SAVE COMPANY TO USER WAS FAILED', user._id, user.name,  err);
               countUsers ++;
               console.log('countCompanies', countCompanies, 'countUsers', countUsers);
            });
        });
    });
});