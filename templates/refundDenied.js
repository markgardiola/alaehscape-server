/**
 * Refund-denied email (HTML)
 * @param {Object} data
 * @param {string} data.full_name
 * @param {string} data.resort
 * @param {string} [data.decisionNote]
 * @returns {string}
 */
module.exports = ({ full_name, resort, decisionNote }) => `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.6">
    <h2 style="color:#333;margin-bottom:0.5em">
      Hi ${full_name},
    </h2>

    <p style="margin:0 0 1em">
      We've reviewed your cancellation/refund request for your booking at
      <strong>${resort}</strong>. Unfortunately, we're unable to approve it, and your
      booking remains <b>confirmed</b>.
    </p>

    ${
      decisionNote
        ? `
    <p style="margin:0 0 1em">
      <b>Reason:</b><br/>
      ${decisionNote}
    </p>`
        : ""
    }

    <p style="margin:0 0 1em">
      If you have questions about this decision, simply reply to this email and we'll
      be happy to help.
    </p>

    <p style="margin:0">
      Sincerely,<br/>
      <strong>ALAI&#8209;eh Team</strong>
    </p>
  </div>
`;
