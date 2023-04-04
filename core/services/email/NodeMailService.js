const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');

const transporter = nodemailer.createTransport({
    host: 'smtppro.zoho.eu',
    port: 465, // For SSL, you can also use 587 for TLS
    secure: true, // Use SSL
    auth: {
        user: 'admin@soccersquadmanager.com',
        pass: process.env.NODE_MAILER_PASSWORD,
    },
});

const sendEmail = async (to, subject, templatePath, templateData) => {
    // Read the email template file
    const template = fs.readFileSync(templatePath, 'utf-8');

    // Render the email template with EJS
    const html = ejs.render(template, templateData);

    // Set up email options
    const mailOptions = {
        from: 'admin@soccersquadmanager.com',
        to: to,
        subject: subject,
        html: html,
    };

    // Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return info;
    } catch (error) {
        console.log('Error:', error);
        throw error;
    }
};

module.exports = sendEmail;
