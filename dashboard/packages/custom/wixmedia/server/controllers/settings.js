'use strict';
module.exports = function (Wixmedia) {
  return {
    getSettings: function (req, res) {
      Wixmedia.settings(function (err, settingsRow) {
        if (err) {
          return res.status(500).json({error: err});
        }

        return res.json(settingsRow ? settingsRow.settings : {});
      });

    },

    saveSettings: function (req, res) {
      var data = {
        apiKey: req.body.apiKey,
        apiSecret: req.body.apiSecret
      };

      Wixmedia.settings(data, function (err) {
        if (err) {
          return res.status(500).json({error: err});
        }

        return res.json({success: true});
      });

    }
  };
};