/**
 * Booking‑cancelled email (HTML)
 * @param {Object} data
 * @param {string} data.full_name
 * @param {string} data.resort
 * @returns {string}
 */
module.exports = ({ full_name, resort }) => `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.6">
    <h2 style="color:#c0392b;margin-bottom:0.5em">
      Hello ${full_name},
    </h2>

    <p style="margin:0 0 1em">
      We’re sorry to inform you that your booking for
      <strong>${resort}</strong> has been <b>cancelled</b>.
    </p>

    <p style="margin:0 0 1em">
      If this was unexpected or you’d like to reschedule, please reply to this
      email and we’ll be happy to help.
    </p>

    <p style="margin:0 0 2em">
      Thank you for considering us, and we hope to welcome you in the future.
    </p>

    <p style="margin:0">
      Sincerely,<br/>
      <strong>Ala‑Eh‑scape Team</strong>
    </p>
  </div>
`;
