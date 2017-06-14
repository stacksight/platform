'use strict';

var mongoose = require('mongoose'),
    Notification = mongoose.model('Notification'),
    mails = require('../providers/mails'),
    config = require(process.cwd() + '/config');

const util = require('util');

module.exports = function (rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {

    var query = {
        isSent: false,
        frequency: message.frequency,
        to: message.email
    };

    Notification.aggregate({
        $match: query
    }, {
        $sort: {
            created: -1
        }
    }, {
        $group: {
            _id: {
                stackName: "$stackName",
                tpl: "$tpl"
            },
            types: { "$push": {email: "$$ROOT", created: "$created"} }
        }
    }, {
        $group: {
            _id: {
                stackName: "$_id.stackName"
            },
            types: { "$push": {tpl: "$_id.tpl", emails: "$types"} }
        }
    }).exec(function (err, stacks) {
        if (err) return error();

        if (stacks.length === 0) return done();

        stacks.forEach(function (stack) {
            var stackScore = 0;
            stack.appId = stack.types[0].emails[0].email.stack;
            stack.stackDashboardUrl = config.dashboardHost + "/#!/stack/" + stack.appId;
            stack.types.forEach(function (type) {
                type.email = type.emails.shift().email;
                // Sort the list by a similar sort to the dashboard - put the most critical on top.
                // Sort by num of critical + non-critical updates, then by name
                if (type.email.tpl === 'updates') {
                    stackScore += (type.email.locals.critical * 1000);  
                    stackScore += (type.email.locals.available);  
                }
                if (type.email.tpl === 'ssl_validity') {
                    if (!type.email.locals.desc.match(/^.*valid.*$/)) { // no "severity" property for now. Use simple regex match
                        stackScore += 100;
                    }
                }
            });
            stack.score = stackScore;
        });

        stacks.sort(function(a,b){
            console.log(util.inspect(a,{depth:null}));
            // if (b.stackScore - a.stackScore == 0) {
            //     return [a._id.stackName, b._id.stackName].sort();
            // }
            // else return b.stackScore - a.stackScore;
            return b.score - a.score;
        });

        console.log('@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@');
        //console.log(util.inspect(stacks,{depth:null}));

        var options = {
            to: message.email,
            subject: 'Stacksight.io ' + message.frequency + ' updates for ' + new Date(),
            locals: {
                stacks: stacks,
                user: message.uname,
                frequency: message.frequency
            }
        };
        
        mails.sendHtml('updates-digest', options, function (err) {
            if (err) return error();

            done();

            Notification.update(query, {
                $set: {
                    isSent: true,
                    postDate: Date.now()
                }
            }, {
                multi: true
            }).exec(function (err) {
                // done();
            });
        });
    });
};
