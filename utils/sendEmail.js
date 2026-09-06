const { BrevoClient } = require("@getbrevo/brevo");

/**
 * Render's free tier blocks outbound SMTP (ports 25, 465, 587), which is
 * what nodemailer + Gmail relied on -- every send would hang until
 * ETIMEDOUT, working fine locally but never in production. Brevo's API
 * sends over plain HTTPS (port 443), which isn't blocked.
 *
 * Signature is unchanged (to, subject, html) so bookingController.js
 * doesn't need to change at all.
 */
const sendEmail = async (to, subject, html) => {
  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  return brevo.transactionalEmails.sendTransacEmail({
    subject,
    htmlContent: html,
    sender: { name: "Ala-Eh-scape", email: "alaehscape@gmail.com" },
    to: [{ email: to }],
  });
};

module.exports = sendEmail;
