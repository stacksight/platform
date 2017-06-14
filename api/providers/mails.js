var config = require(process.cwd() + '/config');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var path = require('path');
var EmailTemplate = require('email-templates').EmailTemplate;
var sg = require('sts-sendgrid').SendGrid(config.sendgrid.token);
var _ = require('lodash');
var templates = {
    'welcome': '2be8fdf8-e0df-4171-9769-c9cea60fc77b',
    'error-log': '6c67c97b-165b-4163-90f1-d9ee0e928417',
    'updates': 'b4137594-29d4-411c-814b-3b64753cd250',
    'forgotpassword': '61696408-dece-493b-bf6d-419077cf06d7',
    'free-text': '1f4b22d8-0006-4e29-8fc8-45a9fef905cc',
    'invite': 'bc65d1d5-3d0b-4a40-848b-37499a5bfbd2',
    'invoice': 'ebb6be0f-196a-40d3-8c9d-a84a229c8050',
    'platformsh': '72b52ed4-97c6-44ef-84cf-12894010106f',
    'register': '8aa47b71-bff3-406b-a6ec-fa7f04b0514b',
    'quota-alert-sent-invitations': '82198023-1057-4cc6-ba37-f93e6c22208b',
    'quota-alert-responded-invitations': '8a0c4082-0800-4f4e-9b4d-56de14d44448',
    'ssl_validity': '9bebb4c9-16e5-4a6e-8942-7df0893a68cd'
};


function TemplateRenderer(template, options) {
    var templatePath = path.join(__dirname, '..', 'templates', template);
    return new EmailTemplate(templatePath, options);
}

exports.sendTests = function (req, res) {
    var to = req.params.to;
    var tpl = req.params.tpl;
    var body = req.body;
    send(tpl, {
        to: to,
        subject: body.subject,
        locals: body.locals
    }, function (err) {
        if (err) return res.send(err);
        res.send('MAIL SENT SUCCESSFULLY');
    });
};

var send = exports.send = function (tplName, options, cb) {

    if (!options.to) {
        if (cb) return cb('No recipients defined');
        return console.log('No recipients defined');
    }

    options.to = (_.isArray(options.to)) ? options.to : [options.to];

    var helper = require('sts-sendgrid').mail,
        from_email = new helper.Email("support@stacksight.io", "Stacksight"),
        to_email = new helper.Email(options.to[0]),
        subject = options.subject || 'Stacksight',
        content = new helper.Content("text/html", "some text here"),
        mail = new helper.Mail(from_email, subject, to_email, content),
        personalization = new helper.Personalization();

    for (var i = 0; i < options.to.length; i++) {
        var to = new helper.Email(options.to[i]);
        personalization.addTo(to);
    };

    for (var index in options.locals) {
        var sub = {};
        sub['{{' + index + '}}'] = (options.locals[index]) ? options.locals[index].toString() : options.locals[index];
        personalization.addSubstitution(sub);
    }

    mail.addPersonalization(personalization);

    mail.setTemplateId(templates[tplName]);

    var requestBody = mail.toJSON();
    var request = sg.emptyRequest();
    request.method = 'POST';
    request.path = '/v3/mail/send';
    request.body = requestBody;

    sg.API(request, function (response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
        var err = (response.statusCode >= 400) ? ('SendGrid Err ' + response.body) : null;
        if (cb) return cb(err, response);
    });
};

exports.sendHtml = function (tplName, options, cb) {
    if (!options.to) {
        if (cb) return cb('No recipients defined');
        return console.log('No recipients defined');
    }

    options.to = (_.isArray(options.to)) ? options.to : [options.to];




    var tpl = TemplateRenderer(tplName);

    tpl.render(options.locals, function (err, results) {

        var helper = require('sts-sendgrid').mail,
            from_email = new helper.Email("support@stacksight.io", "Stacksight"),
            to_email = new helper.Email(options.to[0]),
            subject = options.subject || 'Stacksight',
            content = new helper.Content("text/html", results.html),
            mail = new helper.Mail(from_email, subject, to_email, content),
            personalization = new helper.Personalization();

        for (var i = 0; i < options.to.length; i++) {
            var to = new helper.Email(options.to[i]);
            personalization.addTo(to);
        };

        mail.addPersonalization(personalization);


        var requestBody = mail.toJSON();
        var request = sg.emptyRequest();
        request.method = 'POST';
        request.path = '/v3/mail/send';
        request.body = requestBody;

        sg.API(request, function (response) {
            console.log(response.statusCode);
            console.log(response.body);
            console.log(response.headers);
            var err = (response.statusCode >= 400) ? ('SendGrid Err ' + response.body) : null;
            if (cb) return cb(err, response);
        });
    });
};