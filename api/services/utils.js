'use strict';


var indexNameByDate = exports.indexNameByDate = function(name, date) {
    var d = (date) ? new Date(date) : new Date();
    var start = (name) ? name + '-' : '';
    return start + d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
};

function isDate(dateArg) {
    var t = (dateArg instanceof Date) ? dateArg : (new Date(dateArg));
    return !isNaN(t.valueOf());
}

function isValidRange(minDate, maxDate) {
    return (new Date(minDate) <= new Date(maxDate));
}

exports.betweenDates = function(startDt, endDt) {

    var error = ((isDate(endDt)) && (isDate(startDt)) && isValidRange(startDt, endDt)) ? false : true;
    var between = [];
    if (error) console.error('error occured!!!... Please Enter Valid Dates');
    else {
        var currentDate = new Date(startDt),
            end = new Date(endDt);
        while (currentDate <= end) {
            var name = indexNameByDate(null, currentDate);
            // var d = new Date(currentDate);
            // between.push(new Date(currentDate));
            // between.push(d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2));
            between.push(name);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }
    return between;
};

exports.arrayIncludesArray = function(array1, array2) {
    for (var i = 0; i < array2.length; i++) {
        if (array1.indexOf(array2[i]) === -1)
            return false;
    }
    return true;
}