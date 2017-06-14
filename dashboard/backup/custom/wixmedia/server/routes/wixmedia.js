'use strict';
module.exports = function(Wixmedia, app, auth, database) {
  var settingsController = require('../controllers/settings')(Wixmedia);
  var uploadController = require('../controllers/upload')(Wixmedia);
  var collectionsController = require('../controllers/collections')(Wixmedia);

    app.post('/wixmedia/upload', require('connect-multiparty')(), uploadController.upload);
    app.get('/wixmedia/settings', auth.requiresAdmin, settingsController.getSettings);
    app.post('/wixmedia/settings', auth.requiresAdmin, settingsController.saveSettings);
    app.get('/wixmedia/collections', auth.requiresAdmin, collectionsController.get);
    app.post('/wixmedia/collections', collectionsController.add);
    app.delete('/wixmedia/collections/:id', collectionsController.remove);
};
