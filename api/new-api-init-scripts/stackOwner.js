var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_CONNECTION_STRING);

require('../models/stack1');

require('../models/app');
require('../models/user');
var Stack = mongoose.model('Stack1');
var App = mongoose.model('App');

var options = [{
    path: 'app',
    model: 'App',
    select: 'name author'
}];

var count = 0,
    length = 0;

Stack.find({}).populate(options).exec(function(err, stacks) {
    if (err) return console.log(err);
    console.log('STACK LENGTH', stacks.length);
    length = stacks.length;
    stacks.forEach(function(stack) {
        if (!stack.app) {
            console.log('err: stack without app', stack._id, stack.name);
            length --;
            return;
        }
        if (stack.owner) {
            length --;
            return;
        }
        // console.log('****************');
        stack.owner = stack.app.author;
        // console.log(stack.author);
        // console.log(stack.owner);
        // console.log(stack.name, stack.app.name);
        // console.log('****************');
        stack.save(function(err) {
            if (err) return console.log(err, stack._id);
            count ++;
            console.log('count updated -', count, 'length - ', length);
        });
    });
});