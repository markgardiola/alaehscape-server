/**
 * Owner "booking cancelled" email (HTML) -- sent to the resort owner when
 * a booking they were previously notified about (i.e. it had reached
 * Confirmed) is later cancelled, so they don't expect a guest who isn't
 * coming.
 * @param {Object} data
 * @param {string} data.owner_name
 * @param {string} data.resort
 * @param {string} data.guest_name
 * @param {string} data.checkIn
 * @param {string} data.checkOut
 * @returns {string}
 */
module.exports = ({ owner_name, resort, guest_name, checkIn, checkOut }) => `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.6">
    <h2 style="color:#c0392b;margin-bottom:0.5em">
      Hi ${owner_name},
    </h2>

    <p style="margin:0 0 1em">
      A booking at <strong>${resort}</strong> that you were previously
      notified about has been <b>cancelled</b>.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:1.5em">
      <tbody>
        <tr>
          <td style="padding:6px 0"><b>Guest:</b></td>
          <td style="padding:6px 0">${guest_name}</td>
        </tr>
        <tr>
          <td style="padding:6px 0"><b>Check‑in:</b></td>
          <td style="padding:6px 0">${checkIn}</td>
        </tr>
        <tr>
          <td style="padding:6px 0"><b>Check‑out:</b></td>
          <td style="padding:6px 0">${checkOut}</td>
        </tr>
      </tbody>
    </table>

    <p style="margin:0 0 2em">
      No action is needed from you -- you no longer need to hold this room
      for this guest.
    </p>

    <p style="margin:0">
      Best,<br/>
      Team <strong>ALAI-eh</strong>
    </p>
  </div>
`;
