var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_CONNECTION_STRING);

require('../models/stack1');
require('../models/app');
require('../models/user');
require('../models/tag');
require('../models/company');

var Stack = mongoose.model('Stack1');
var App = mongoose.model('App');
var Tag = mongoose.model('Tag');
var Company = mongoose.model('Company');
var User = mongoose.model('User');

var length = 0, countStacks = 0, countCompanies = 0;


Stack.find({}).populate('app').populate('owner', 'email').exec(function(err, stacks) {
    if (err) return console.log(err);
    console.log(stacks.length, 'stacks count');
    length = stacks.length;
    stacks.forEach(function(stack) {
        if (!stack.app || !stack.app.name || stack.app.stacks.indexOf(stack._id) === -1 || !stack.owner) {
            length --;
            console.log('stack with problem', stack._id, stack.name);
            return;
        }
        Company.findOne({
            owner: stack.app.author
        }).exec(function(err, company) {
            if (err) return console.log('find company err', err);
            if (!company) return console.log('no company');
            // console.log('start update company ' + company.name, company._id);
            stack.company = company._id;
            // stack.collaborators = [{
            //     id: stack.owner._id,
            //     status: 'accepted',
            //     email: stack.owner.email,
            //     permissions: ['owner']
            // }];
            stack.save(function(err) {
                if (err) {
                    return console.log('update stack err', err)
                };
                countStacks ++;
                company.stacks = company.stacks || [];
                company.stacks.addToSet(stack);
                company.save(function(err) {
                    if (err) return console.log('update company err', err, company.name, stack.name, stack._id);
                    console.log('company ' + company.name + ' was saved');
                    console.log('stacks length', length , 'countStacks', countStacks);
                });
            });
        });
    });
});