var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_CONNECTION_STRING);

require('../models/stack1');
require('../models/app');
require('../models/user');
require('../models/tag');
var Stack = mongoose.model('Stack1');
var App = mongoose.model('App');
var Tag = mongoose.model('Tag');

var appsLength = 0,
    countTags = 0,
    stacksLength = 0,
    countStacks = 0;

App.find({}).populate('author', 'companies').exec(function(err, apps) {
    if (err) return console.log(err);
    appsLength = apps.length;
    console.log('APPS LENGTH', appsLength);

    apps.forEach(function(app) {
        if (!app.author || !app.author.companies) {
            console.log('APP ERROR', app._id, app.author);
            appsLength--;
            return;
        }
        stacksLength += app.stacks.length;
        var tag = {
            author: app.author,
            value: app.name.toLowerCase(),
            company: app.author.companies[0].id, // we now have only 1 company
            type: 'group'
        };
        Tag.findOneAndUpdate(tag, {
            $set: tag
        }, {
            upsert: true,
            new: true
        }).exec(function(err, _tag) {
            if (err) return console.log('tag save err', err, app._id, app.name);
            countTags++;

            app.stacks.forEach(function(stack) {
                Stack.findOne({
                    _id: stack
                }).exec(function(err, s) {
                    if (err) return console.log('Find stack err', err);
                    if (!s) {
                        console.log('MISSING STACK', stack);
                        stacksLength --;
                        return;
                    }
                    s.collaborators = app.collaborators;
                    s.tags.addToSet({
                        tag: _tag._id,
                        value: _tag.value,
                        author: _tag.author
                    });
                    s.save(function(err) {
                        if (err) return console.log('update stack err', err, stack._id, stack.name);
                        countStacks ++;
                        console.log('apps length', appsLength, 'stacksLength', stacksLength, 'countStacks', countStacks, 'countTags', countTags);
                    });
                });
            });
        });
    });
});