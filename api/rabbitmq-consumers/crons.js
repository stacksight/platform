'use strict';


module.exports = function(rabbit, qData) {
    rabbit.consume(qData.name, qData.maxUnackMessages, handleMessage);
};

function handleMessage(message, error, done) {
    var type = message.type,
        subtype = message.subtype;

    if (type && subtype && actions[type] && actions[type][subtype]) return actions[type][subtype](message, error, done);
    if (actions[type]) return actions[type](message, error, done);
    console.log('CRON TYPE ' + type + ' IS MISSING');
    done();
}

var actions = {
    clean: {
        mongo: function(message, error, done) {
            //e7c816d9de2de87171313a3fa7cab3967ff33c8b5c71720ad4ccdb529de53b8a
            require('../crons/clean_docs')().mongo(error, done);
        },
        elastic: function(message, error, done) {
            // e7c816d9de2de87171313a3fa7cab396d8d402a21c6ef8e1cb53f4768e926736
            require('../crons/clean_docs')().elastic(error, done);
        },
        data: function(message, error, done) {
            //e7c816d9de2de87171313a3fa7cab3969b8364b1da8ac90a75ac8a3d1ac4d636
            require('../crons/clean_docs')().data(error, done);
        },
    },
    performance: function(message, error, done) {
        require('../crons/performance')(message, error, done);
    },
    accessibility: function(message, error, done) {
        require('../crons/accessibility')(message, error, done);
    },
    availability: function(message, error, done) {
        require('../crons/availability')(message, error, done);
    },
    //fb1338968a80c7aa01946d644f5f9bb7a116d4feb8c63665ea9bae131da5b289
    ssl: function(message, error, done) {
        require('../crons/ssl')(message, error, done);
    },
    apps: {
        //64a3e605d1e103f846522a0fc4ef3cebf1821bb65ff6f8bce6c369bee984ced4ec872ca30ff964c09d07fb0b19344766
        aggregations: function(message, error, done) {
            require('../crons/apps/aggregations')(message, error, done);
        }
    },
    reindex: function(message, error, done) {
        //975be2a450b6c8e89d0deb24b95cb8cc45486b21bca788baec50c01984b97531
        require('../crons/reindex')(message, error, done);
    },
    stacks: {
        //fb1338968a80c7aa01946d644f5f9bb7dbd5542ad70ef3ed3a2f915518c825defdd42500cac2275a3b4a94d75d4da770
        aggregations: function(message, error, done) {
            require('../crons/stacks/aggregations')(message, error, done);
        }
    },
    index: {
        settings: function(message, error, done) {
            //b16bc06eba3a55550888cc3b2568075bed56e203c12499e0053f7814de10096a
            require('../crons/update-index')(message, error, done);
        }
    },
    collaborators: function(message, error, done) {
        //e7c816d9de2de87171313a3fa7cab396078821f5ec4abdbc4e74280496f47663
        require('../crons/collaborators')(message, error, done);
    },
    notifications: {
        //df84ef5aa4484375ac2956525de342956017b064fa62a460745954af3c3de94fba0b30040895c8a411e1e5b1682a45f1
        daily: function(message, error, done) {
            require('../crons/notifications')('daily', error, done);
        },
        //df84ef5aa4484375ac2956525de342951e03830af4e06f92f18209ebb6e8f539b919f8f90cdce406b11984edeb4d722b
        weekly: function(message, error, done) {
            require('../crons/notifications')('weekly', error, done);
        }
    }
};