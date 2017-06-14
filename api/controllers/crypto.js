var crypto = require('crypto');

exports.encrypt = function(plain, salt) {

  var key = new Buffer(salt);

  var cipher = crypto.createCipher('aes-256-cbc', key);

  var crypted = cipher.update(plain, 'utf8', 'hex');

  crypted += cipher.final('hex');

  return crypted;
};

exports.decrypt = function(encrypted, salt) {

  var key = new Buffer(salt);

  var decipher = crypto.createDecipher('aes-256-cbc', key);

  var plain = decipher.update(encrypted, 'hex', 'utf8');

  plain += decipher.final('utf8');

  return plain;
};


exports.hash = function(str) {

  var md5 = crypto.createHash('md5');

  md5.update(str);

  return md5.digest('hex');
};


// exports.randomString = function(size) {
//   crypto.randomBytes(size, function(err, buf) {

//     if (err) throw err;

//     console.log('Have %d bytes of random data: %s', buf.length, buf);

//     console.log(buf);
//     console.log(buf.toString());
//   });
// };
