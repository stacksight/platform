angular.module('mean.stacks').filter('shownProducts', function(Global) {
    return function(products, prodName) {

        var profile = Global.user.profile;

        var shownProducts = [];
        if (products)
            products.forEach(function(product) {
                if (!profile.preferences[prodName][product.name] || (profile.preferences[prodName][product.name] && profile.preferences[prodName][product.name].show))
                    shownProducts.push(product);
            });

        return shownProducts;
    };
});

angular.module('mean.stacks').filter('propsFilter', function() {
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function(item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});
angular.module('mean.stacks').filter('slice', function() {
    return function(arr, start, end) {
        return arr.slice(start, end);
    };
});
angular.module('mean.stacks').filter('bytes', function() {
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
            return '-';
        }

        if (typeof precision === 'undefined') {
            precision = 1;
        }

        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));

        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    }
});

angular.module('mean.stacks').filter('googleBase64', function() {
    return function(gbase64) {
        //var replaceObj = {"_": "/", "-": "+"};
        //_.each(replaceObj, function(val, index){
        //   var replace = val;
        //   var find = index;
        //   gbase64.replace(new RegExp(find, 'g'), replace);
        //});
        //return gbase64;
        return gbase64.split("_").join("/").split("-").join("+");
    }
});

angular.module('mean.stacks').filter('colorize', function() {
    return function(type) {
        switch (type) {
            case 'good':
                return '#7ad03a';
                break;
            case 'warning':
            case 'ok':
                return '#fdcd00';
                break;
            case 'poor':
                return '#ee7c1b';
                break;
            case 'error':
            case 'bad':
                return '#ee534f';
                break;
            case 'no_focus':
                return '#cecece';
                break;
            case 'notice':
            case 'no_index':
                return '#31a8d5';
                break;
        }
    }
});

angular.module('mean.stacks').filter('seotype', function() {
    return function(type) {
        switch (type) {
            case 'good':
                return 'Good';
                break;
            case 'ok':
                return 'Ok';
                break;
            case 'poor':
                return 'Poor';
                break;
            case 'bad':
                return 'Bad';
                break;
            case 'no_focus':
                return 'No focus';
                break;
            case 'no_index':
                return 'No indexed';
                break;
        }
    }
});

angular.module('mean.stacks').filter('icoset', function() {
    return function(type) {
        switch (type) {
            case 'good':
                return 'fa-check-circle';
                break;
            case 'ok':
                return 'fa-check-circle';
                break;
            case 'warning':
            case 'notice':
            case 'error':
            case 'poor':
                return 'fa-exclamation-circle';
                break;
            case 'bad':
                return 'fa-times-circle';
                break;
            case 'no_focus':
                return 'fa-exclamation-circle';
                break;
            case 'no_index':
                return 'fa-exclamation-circle';
                break;
            default:
                return 'fa-exclamation-circle';
                break;
        }
    }
});

angular.module('mean.stacks').filter('speedsummary', function($interpolate, $filter) {
    return function(data) {
        if (data.summary && data.summary.args) {
            _.each(data.summary.args, function(val, index) {
                var params = {};
                if (val.type == 'HYPERLINK') {
                    _.extend(params, {
                        'BEGIN_LINK': '<a href="' + val.value + '" target="_blank">',
                        'END_LINK': '</a>'
                    });
                } else {
                    var obj = {};
                    obj[val.type] = val.value;
                    _.extend(params, obj);
                }
                data.summary.format = $interpolate(data.summary.format)(params);
            });
        }
        if (data.urlBlocks) {
            _.each(data.urlBlocks, function(val, index) {
                if (val.header) {
                    var params = {};
                    _.each(val.header.args, function(val_arg, index) {
                        if (val_arg.type == 'HYPERLINK') {
                            _.extend(params, {
                                'BEGIN_LINK': '<a href="' + val_arg.value + '" target="_blank">',
                                'END_LINK': '</a>'
                            });
                        } else {
                            var obj = {};
                            obj[val_arg.type] = val_arg.value;
                            _.extend(params, obj);
                        }
                    });
                    data.urlBlocks[index].header.format = $interpolate(val.header.format)(params);
                }
                if (val.urls) {
                    _.each(val.urls, function(url, url_index) {
                        var params = {};
                        _.each(url.result.args, function(arg, index) {
                            if (arg.type == 'HYPERLINK') {
                                _.extend(params, {
                                    'BEGIN_LINK': '<a href="' + arg.value + '" target="_blank">',
                                    'END_LINK': '</a>'
                                });
                            } else {
                                var obj = {};
                                obj[arg.type] = arg.value;
                                _.extend(params, obj);
                            }
                        });
                        data.urlBlocks[index].urls[url_index].result.format = $interpolate(url.result.format)(params);
                    });
                }
            });
        }
        return data;
    }
});