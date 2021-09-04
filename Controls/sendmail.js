const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport({
    auth: {
        api_key: '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'
    }
});