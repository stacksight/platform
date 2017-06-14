'use strict';

var Scan = require('./scan'),
    _ = require('lodash');

class SSL extends Scan {

    constructor(data, type,  service, dataType, options) {
        super(data, type, service, dataType, options);
    }

    normalizeData(options, cb) {
        if (!this.data.data || !this.data.data.widgets) return console.log('SSL VALIDITY DATA ERROR', this.data);
        this.data.data.widgets.forEach(function(widget) {
            widget.title = 'SSL Validity';
            //console.log("dumping widget in integrations/scans/..../ssl.js:");
            //console.log(widget);
            switch (widget.errorType) {
                case false:
                    if (widget.bool_value) widget.desc = 'Your SSL certificate is valid until ' + widget.to_date;
                    else if (widget.bool_value === false) widget.desc = 'Your SSL certificate has expired! You should renew it asap!';
                    widget.from_date = new Date(widget.from_date);
                    widget.to_date = new Date(widget.to_date);
                    break;
                case 'ECONNRESET':
                    widget.desc = "An error has occured. <br />It seems that your server doesn't support HTTPS. You probably want to check it.";
                    break;
                default:
                    widget.desc = 'An error has occured. <br /><strong>You may not be using SSL at all</strong>. If this is the case, you should consider it strongly!';
            }
            
        });
        cb();
    }
}

module.exports = SSL;