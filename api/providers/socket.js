var sockets = {};

exports._new = function(id, socket) {
    console.log('USER ' + id + ' connected on socket ' + socket.id);
    if (!sockets[id]) sockets[id] = {};
	sockets[id][socket.id] = socket;

    console.log('*************** SOCKETS LIST ******************');
    for (var index in sockets) {
        console.log('user', index);
        for (var index1 in sockets[index]) {
            console.log('id', index1);
        }
    }
    console.log('*************** END OF SOCKETS LIST ***********');


	socket.on('disconnect', function() {
		console.log('User ' + id + ' disconnected');
		delete sockets[id][socket.id];
	});
};

exports.sockets = sockets;



