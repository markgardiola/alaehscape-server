const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  require('dotenv').config();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'alaehscape@gmail.com',
      pass: process.env.sendMailPass,
    },
  });

  const mailOptions = {
    from: '"Ala-Eh-scape" <alaehscape@gmail.com>',
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
