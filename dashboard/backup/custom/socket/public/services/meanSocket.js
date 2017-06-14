/*global io:false*/
'use strict';

var baseUrl = 'https://apps.stacksight.io:443';
// var baseUrl = 'http://localhost:3003';

angular.module('mean.socket').factory('MeanSocket', function($rootScope, $http, Global) {
    var socket = io.connect(baseUrl);
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                if (eventName === 'user joined')
                    registerSocketToUser();
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };

    function registerSocketToUser() {
        if (!Global.user || !Global.user.profile) return;
        console.log('emit user joined token');
        socket.emit('user joined token', {
            id: Global.user.profile.token
        });
    }
});
