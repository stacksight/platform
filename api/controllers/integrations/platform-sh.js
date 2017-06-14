'use strict';

var oauthCtrl = require('../oauth'),
    request = require('request'),
    usersCtrl = require('../users'),
    tagsCtrl = require('../tags'),
    _ = require('lodash');

exports.projects = function(token, user, cb) {

    var apiToken = token || user.oauth_platform.api_token;

    getAccessToken(user, apiToken, function(err, _user) {
        if (err) return cb(err);

        var accessToken = _user.oauth_platform.access_token;

        var objReq = {
            uri: 'https://accounts.platform.sh/api/platform/me',
            method: 'GET',
            headers: {
                'authorization': 'Bearer ' + accessToken,
            }
        };

        request(objReq, function(error, response, body) {
            if (error) return cb(error);
            body = JSON.parse(body);
            if (response && (response.statusCode > 300 || response.statusCode < 200)) cb(body);
            var projects = body.projects;
            var pCnt = 0;
            if (!projects || !projects.length) return cb('There are no projects in your platform.sh account');
            projects.forEach(function(project) {
                getProjectEnvironments(project, accessToken, function(err, data) {
                    if (err) project.environments = [];
                    else project.environments = data;
                    pCnt++;
                    if (pCnt === projects.length) return cb(null, projects, _user);
                });
            });
        });
    });
};

function getProjectEnvironments(project, token, cb) {
    var objReq = {
        uri: 'https://' + project.region + '/api/projects/' + project.id + '/environments',
        method: 'GET',
        headers: {
            'authorization': 'Bearer ' + token,
        }
    };

    request(objReq, function(error, response, body) {
        if (error) return cb(error);
        body = JSON.parse(body);
        if (response && (response.statusCode > 300 || response.statusCode < 200)) return cb(body);
        cb(null, body);
    });
}

function getAccessToken(user, token, cb) {
    if (!token) return cb('Platform API token is required');

    var objReq = {
        uri: 'https://accounts.platform.sh/oauth2/token',
        method: 'POST',
        headers: {
            'authorization': 'Basic cGxhdGZvcm0tY2xpOg==',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            'grant_type': 'api_token',
            'api_token': token
        }
    };

    request(objReq, function(error, response, body) {
        if (error) return cb(error);
        body = JSON.parse(body);
        if (response && (response.statusCode > 300 || response.statusCode < 200)) return cb(body);
        var platform_obj = body;
        platform_obj.api_token = token;
        var set = {
            oauth_platform: platform_obj
        };
        usersCtrl.updateS(user._id, set, function(err, user) {
            if (err) return cb(err);
            return cb(null, user);
        });
    });
};

exports.sitesData = function(projects, user, company, callback) {
    var envs = [],
        i = 0,
        pTag;

    tagsCtrl._create('platform.sh', user, company, function(err, tag) {
        if (err) return callback(err);
        pTag = tag;
        pLoop(function(err, data) {
            if (err) return callback(err);
            callback(null, envs);
        });
    });


    function pLoop(cb) {
        var project = projects[i];
        var ownProject = _.find(user.oauth_platform.projects, {
            id: project.id
        });
        if (!ownProject) return cb('You have no ' + project.name + ' project in platform.sh');
        tagsCtrl._create(project.name, user, company, function(err, tag) {
            if (err) return cb(err);
            project.tag = tag;
            eLoop(0, project, function(err, _data) {
                if (err) return cb(err);
                i++;
                if (i === projects.length) return cb(null);
                pLoop(cb);
            });
        });
    }

    function eLoop(j, _project, cb) {
        if (!_project.environments || !_project.environments.length) return cb(null);
        var env = _project.environments[j];
        var ownEnv = _.find(_project.environments, {
            id: env.id
        });
        if (!ownEnv) return cb('You have no ' + env.name + ' in' + env.pName + ' project in platform.sh');

        if (env.selected && (env.selected === true || env.selected === 'true')) {
            env.tags = [];
            env.tags.push(pTag);
            env.tags.push(_project.tag);
            tagsCtrl._create(env.name, user, company, function(err, tag) {
                if (err) return cb(err);
                env.tags.push(tag);
                env.pName = _project.name;
                env.pRegion = _project.region;
                env.externalId = env.id + '-' + _project.id;
                env.domain = env.id + '-' + _project.id + '.' + env.pRegion;
                env.host = 'http://' + env.domain;
                env.name = env.domain;
                env.source = 'platform';
                envs.push(env);
                j++;
                if (j === _project.environments.length) return cb(null);
                eLoop(j, _project, cb);
            });
        } else {
            j++;
            if (j === _project.environments.length) return cb(null);
            eLoop(j, _project, cb);
        }
    }
};