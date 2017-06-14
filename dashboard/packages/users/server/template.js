'use strict';

var config = require('meanio').loadConfig();
var host = config.host;

module.exports = {
  forgot_password_email: function(user, req, token, mailOptions) {
    mailOptions.html = [
      'Hi ' + user.name + ',',
      'We have received a request to reset the password for your account.',
      'If you made this request, please click on the link below or paste this into your browser to complete the process:',
       host + '/#!/auth/reset/' + token,
      'This link will work for 1 hour or until your password is reset.',
      'If you did not ask to change your password, please ignore this email and your account will remain unchanged.'
    ].join('\n\n');
    mailOptions.subject = 'Resetting the password';
    return mailOptions;
  }
};
