'use strict';

var mongoose = require('mongoose'),
    gravatar = require('gravatar'),
    User = mongoose.model('User');

class Profile {
    constructor() { //class constructor
    }
    saveSapiToken(userId, token) {
        User.update({_id: userId}, {$set: {'profile.token': token}}).exec(function(err, numEfected) {
            console.log('update sapi token err: ' + err, numEfected);
        });
    }

    create(user, cb) {

        console.log('--------', user.token);
        var userInst;
        userInst = new User(user);
        //initialize profile fields
        userInst.profile = {
            token: user.token,
            pictures: {
                collectionId: null,
                apps: [],
                packages: [],
                profile: gravatarImg(user.email)
            },
	        preferences: {
		        apps: {}
	        }
        };
        userInst.save(function(err,doc) {
            console.log(err, doc);
            if (!err)
                return cb(doc);
        });
    }

    save(data, cb) {
        User.update({_id: data.id}, {$set: {
            profile: data.profile
        }}).exec(function(err, numEfected) {
            console.log(err, numEfected);
            cb(err);
        });
    }
}

function gravatarImg(email) {
    var url = gravatar.url(email, {}, true);
    return url;
}

exports.Profile = Profile;
