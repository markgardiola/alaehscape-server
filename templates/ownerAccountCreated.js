/**
 * Sent once, the first time a resort owner's account is auto-created
 * (i.e. the first time a resort is listed under their email).
 * @param {Object} data
 * @param {string} data.owner_name
 * @param {string} data.resort
 * @param {string} data.email
 * @param {string} data.tempPassword
 * @param {string} data.loginUrl
 * @returns {string}
 */
module.exports = ({ owner_name, resort, email, tempPassword, loginUrl }) => `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.6">
    <h2 style="color:#0c6f3c;margin-bottom:0.5em">
      Welcome to ALAI-eh, ${owner_name}! 🎉
    </h2>

    <p style="margin:0 0 1em">
      Your resort, <strong>${resort}</strong>, is now listed on ALAI-eh, and
      we've created you an Owner Portal account so you can see your live
      bookings, guest reviews, and revenue reports.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:1.5em">
      <tbody>
        <tr>
          <td style="padding:6px 0"><b>Email:</b></td>
          <td style="padding:6px 0">${email}</td>
        </tr>
        <tr>
          <td style="padding:6px 0"><b>Temporary password:</b></td>
          <td style="padding:6px 0"><code>${tempPassword}</code></td>
        </tr>
      </tbody>
    </table>

    <p style="margin:0 0 1.5em">
      <a href="${loginUrl}" style="background:#3e9c93;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block">
        Log in to your Owner Portal
      </a>
    </p>

    <p style="margin:0 0 2em">
      For your security, please log in and change this password as soon as
      you can.
    </p>

    <p style="margin:0">
      Best,<br/>
      Team <strong>ALAI-eh</strong>
    </p>
  </div>
`;
