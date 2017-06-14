'use strict';
var wixmedia = require('wixmedia');
var WixAuthClient = require('../../node_modules/wixmedia/src/node/AuthClient');
var request = require('request');
var ProfileC = require('../../../../custom/profile/server/providers/profile').Profile,
    profile = new ProfileC();

module.exports = function (Wixmedia) {
    var COLLECTIONS_API_URL = Wixmedia.config.COLLECTIONS_API_URL;
    var WIXMEDIA_BASE_URL = Wixmedia.config.WIXMEDIA_BASE_URL;
  return {
    upload: function (req, res) {
      Wixmedia.settings(function (err, settingsRow) {
        if (err) {
          return res.status(500).json({error: err});
        }
        if (settingsRow === null) {
              return res.status(500).json({error: 'no settings'});
        }
        var settings = settingsRow.settings;
        var uploader = wixmedia.uploader(settings.apiKey, settings.apiSecret);
        var authClient = new WixAuthClient(settings.apiKey, settings.apiSecret);

        uploader.uploadFromFile(req.files.file.path).then(function (data) {
          var fileData = {
            title: req.files.file.originalFilename,
            type: 'image',
            public_properties: {
              image: data.fileName,
              fileName: data.originalFileName,
              user: settings.apiKey
            },
            private_properties: {}
          };


            authClient.getAuthToken().then(function (token) {
                var headers = authClient.getAuthHeaders(token);

                if (req.user.profile.pictures.collectionId) {
                  request({
                      url: Wixmedia.config.COLLECTIONS_API_URL + '/' + req.user.profile.pictures.collectionId + '/items/prepend',
                      method: 'POST',
                      json: true,
                      body: {items: [fileData]},
                      headers: headers
                  }, function (err, response, body) {
                      if (err) return res.status(500).json({error: err});
                      var image = WIXMEDIA_BASE_URL + body.items[0].object.public_properties.user + '/images/' + body.items[0].object.public_properties.image + '/';
                      var profileObj =  req.user.profile;
                      profileObj.pictures.profile = image;
                      profile.save({id: req.user._id, profile: profileObj} , function(err, doc) {
                          if (err) {
                              return res.status(500).json({error: err});
                          }
                          res.send({success: true, imageUrl: image});

                      });
                  });
              } else {
                  request({
                      url: COLLECTIONS_API_URL,
                      method: 'POST',
                      json: true,
                      body: {
                          type: 'image',
                          title: req.user.email,
                          items:  [fileData],
                          public_properties: {},
                          private_properties: {}
                      },
                      headers: headers
                  }, function (err, response, body) {
                      if (err) return res.status(500).json({error: err});
                      var profileObj = req.user.profile;
                      var image = WIXMEDIA_BASE_URL + body.collection.items[0].public_properties.user + '/images/' + body.collection.items[0].public_properties.image + '/';
                      profileObj.pictures.collectionId = body.collection.id;
                      profileObj.pictures.profile = image;
                      profile.save({id: req.user._id, profile: profileObj} , function(err, doc) {
                          if (err) {
                              return res.status(500).json({error: err});
                          }
                          res.json({success: true, imageUrl: image});
                      });

                  });
              }
          });
        }, function (error) {
          return res.status(500).json({error: error});
        });
      })
    }
  }
};
