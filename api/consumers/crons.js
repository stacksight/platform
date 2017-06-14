'use strict';


var q = require('../providers/busmq').get('crons-sts');
q.consume();

var actions = {
    clean: {
        mongo: function(message) {
            require('../crons/clean_docs')().mongo();
        },
        elastic: function(message) {
            require('../crons/clean_docs')().elastic();
        }
    },
    performance: function(message) {
        require('../crons/performance')(message);
    },
    accessibility: function(message) {
        require('../crons/accessibility')(message);
    },
    availability: function(message) {
        require('../crons/availability')(message);
    },
    apps: {
        //64a3e605d1e103f846522a0fc4ef3cebf1821bb65ff6f8bce6c369bee984ced4ec872ca30ff964c09d07fb0b19344766
        aggregations: function(message) {
            require('../crons/apps/aggregations')(message);
        }
    },
    reindex: function(message) {
        //975be2a450b6c8e89d0deb24b95cb8cc45486b21bca788baec50c01984b97531
        require('../crons/reindex')(message);
    },
    //5b0dfb3691559f7231e7074f9a2cb6864059a6a3e912eaae55c771e7b4e0ac48
    mongoevents: function(message) {
        require('../crons/mongoevents')(message);
    }
};


q.on('message', function(message) {
    message = JSON.parse(message);

    var type = message.type,
        subtype = message.subtype;

    if (type && subtype)
        if (actions[type][subtype]) return actions[type][subtype](message);
    if (actions[type]) actions[type](message);

    // return (type && subtype) ? actions[type][subtype](message) : actions[type](message);
});
