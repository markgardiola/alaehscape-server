/**
 * Refund-approved email (HTML)
 * @param {Object} data
 * @param {string} data.full_name
 * @param {string} data.resort
 * @param {string} data.paymentMethod  'paypal' | 'gcash'
 * @param {string} [data.decisionNote]
 * @returns {string}
 */
module.exports = ({ full_name, resort, paymentMethod, decisionNote }) => `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#333;line-height:1.6">
    <h2 style="color:#0c6f3c;margin-bottom:0.5em">
      Hi ${full_name}, your refund has been approved
    </h2>

    <p style="margin:0 0 1em">
      Your booking at <strong>${resort}</strong> has been cancelled and your refund
      request approved.
    </p>

    <p style="margin:0 0 1em">
      ${
        paymentMethod === "paypal"
          ? "Your payment has been automatically refunded to your PayPal account. It typically takes 3&ndash;5 business days to appear, depending on your payment method."
          : "Since this booking was paid via GCash, our team will process your refund manually and get in touch with you shortly to confirm the details."
      }
    </p>

    ${
      decisionNote
        ? `
    <p style="margin:0 0 1em">
      <b>Note from our team:</b><br/>
      ${decisionNote}
    </p>`
        : ""
    }

    <p style="margin:0">
      Sincerely,<br/>
      <strong>Ala&#8209;Eh&#8209;scape Team</strong>
    </p>
  </div>
`;
