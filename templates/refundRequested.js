/**
 * Refund/cancellation request notice, sent to the admin inbox.
 * @param {Object} data
 * @param {number} data.bookingId
 * @param {string} data.full_name
 * @param {string} data.resort
 * @param {string} data.reason
 * @returns {string}
 */
module.exports = ({ bookingId, full_name, resort, reason }) => `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.6">
    <h2 style="color:#b23b2e;margin-bottom:0.5em">
      Cancel/refund request -- Booking #${bookingId}
    </h2>

    <p style="margin:0 0 1em">
      <strong>${full_name}</strong> has requested to cancel their booking at
      <strong>${resort}</strong> and receive a refund.
    </p>

    ${
      reason
        ? `
    <p style="margin:0 0 1em">
      <b>Reason given:</b><br/>
      ${reason}
    </p>`
        : ""
    }

    <p style="margin:0 0 1em">
      Please review this request in the admin dashboard under Booking Requests.
    </p>

    <p style="margin:0">
      &mdash; Ala&#8209;Eh&#8209;scape system
    </p>
  </div>
`;
