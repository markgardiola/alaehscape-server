/**
 * Owner "new booking" email (HTML) -- sent to the resort owner once a
 * booking at their resort is Confirmed, so they're ready to welcome the
 * guest.
 * @param {Object} data
 * @param {string} data.owner_name
 * @param {string} data.resort
 * @param {string} data.guest_name
 * @param {string} data.checkIn
 * @param {string} data.checkOut
 * @param {number} data.adults
 * @param {number} data.children
 * @returns {string}
 */
module.exports = ({
  owner_name,
  resort,
  guest_name,
  stay_type_name,
  checkIn,
  checkOut,
  adults,
  children,
}) => `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.6">
    <h2 style="color:#0c6f3c;margin-bottom:0.5em">
      Hi ${owner_name}, you have a new booking at ${resort}! 🎉
    </h2>

    <p style="margin:0 0 1em">
      A guest just confirmed a stay at your resort through ALAI-eh. Here are
      the details so you're ready to welcome them:
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:1.5em">
      <tbody>
        <tr>
          <td style="padding:6px 0"><b>Guest:</b></td>
          <td style="padding:6px 0">${guest_name}</td>
        </tr>
        ${
          stay_type_name
            ? `<tr>
          <td style="padding:6px 0"><b>Package:</b></td>
          <td style="padding:6px 0">${stay_type_name}</td>
        </tr>`
            : ""
        }
        <tr>
          <td style="padding:6px 0"><b>Check‑in:</b></td>
          <td style="padding:6px 0">${checkIn}</td>
        </tr>
        <tr>
          <td style="padding:6px 0"><b>Check‑out:</b></td>
          <td style="padding:6px 0">${checkOut}</td>
        </tr>
        <tr>
          <td style="padding:6px 0"><b>Adults:</b></td>
          <td style="padding:6px 0">${adults}</td>
        </tr>
        <tr>
          <td style="padding:6px 0"><b>Children:</b></td>
          <td style="padding:6px 0">${children}</td>
        </tr>
      </tbody>
    </table>

    <p style="margin:0 0 2em">
      No action is needed from you -- this is just a heads-up. If anything
      about your listing needs updating, reach out to the ALAI-eh team.
    </p>

    <p style="margin:0">
      Best,<br/>
      Team <strong>ALAI-eh</strong>
    </p>
  </div>
`;
