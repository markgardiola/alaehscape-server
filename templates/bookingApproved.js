/**
 * Booking‑approved email (HTML)
 * @param {Object} data
 * @param {string} data.full_name
 * @param {string} data.resort
 * @param {string} data.checkIn
 * @param {string} data.checkOut
 * @param {number} data.adults
 * @param {number} data.children
 * @returns {string}
 */
module.exports = ({ full_name, resort, checkIn, checkOut, adults, children }) => `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.6">
    <h2 style="color:#0c6f3c;margin-bottom:0.5em">
      Hi ${full_name}, your booking is confirmed! 🎉
    </h2>

    <p style="margin:0 0 1em">
      Thank you for choosing <strong>${resort}</strong>. Below are your stay
      details:
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:1.5em">
      <tbody>
        <tr>
          <td style="padding:6px 0"><b>Check‑in:</b></td>
          <td style="padding:6px 0">${checkIn}</td>
        </tr>
        <tr>
          <td style="padding:6px 0"><b>Check‑out:</b></td>
          <td style="padding:6px 0">${checkOut}</td>
        </tr>
        <tr>
          <td style="padding:6px 0"><b>adults:</b></td>
          <td style="padding:6px 0">${adults}</td>
        </tr>
        <tr>
          <td style="padding:6px 0"><b>children:</b></td>
          <td style="padding:6px 0">${children}</td>
        </tr>
      </tbody>
    </table>

    <p style="margin:0 0 1em">
      If you have any questions or special requests, simply reply to this email.
    </p>

    <p style="margin:0 0 2em">
      We look forward to your stay!
    </p>

    <p style="margin:0">
      Warm regards,<br/>
      Team <strong>Ala‑Eh‑scape</strong>
    </p>
  </div>
`;
