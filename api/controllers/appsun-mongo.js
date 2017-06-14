var models = require('../models/appsun')();

exports.create = function(data) {
    try {
        var data = JSON.parse(JSON.stringify(data));
    } catch (e) {
        return console.error('APPSUN MONGO ERROR', e.message);
    }

    var type = data.type;
    data.data.index = data.index;
    data.data.etype = type;

    var model = new models.get(data.originalIndex)(data.data);

    if (model.calculatedId) {
        var _model = models.get(data.originalIndex);
        _model.findOneAndUpdate({
            calculatedId: model.calculatedId
        }, { $set: data.data }, { upsert: true, multi: true }, function(err, doc) {});
    } else {
        model.save(function(err, doc) {
            if (err) console.error('appsun mongo error : ', err);
        });
    }
};
