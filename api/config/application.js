module.exports = function(app) {
	app.set('port', process.env.PORT || 3000);
	switch (app.get('env')) {
		case 'development':
			break;
	}

};
