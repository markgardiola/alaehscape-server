/**
 * Wrapper around textbee.dev -- turns a real Android phone into the SMS
 * gateway, using its own SIM instead of a paid commercial API. Same
 * exported shape as semaphoreClient.js (sendOtpSms(phone, code, message))
 * so authController.js didn't need any changes to switch providers --
 * only this file and the one import line in authController.js changed.
 */
const TEXTBEE_SEND_URL = "https://api.textbee.dev/api/v1/gateway/send-sms";

/** "09171234567" -> "+639171234567" -- textbee expects E.164 international format. */
const toE164Philippines = (localPhone) => `+63${localPhone.slice(1)}`;

const sendOtpSms = async (phoneNumber, otpCode, contextMessage) => {
  // Lets you develop/demo the full OTP flow even when your Android phone
  // isn't currently on/connected/running the textbee app. The OTP is still
  // generated, hashed, and stored exactly as normal -- only the actual SMS
  // transmission is skipped, with the code printed to the server logs
  // instead. MUST be unset/false in production; anyone with log access
  // could otherwise read live OTP codes.
  if (process.env.OTP_DEV_MODE === "true") {
    console.log(
      `[OTP_DEV_MODE] SMS not actually sent (no phone/textbee needed). ` +
        `Would have texted ${phoneNumber}: "${contextMessage} Your code is ${otpCode}."`,
    );
    return { devMode: true };
  }

  const body = {
    recipients: [toE164Philippines(phoneNumber)],
    message: `${contextMessage} Your code is ${otpCode}. It expires in 10 minutes.`,
  };

  if (process.env.TEXTBEE_DEVICE_ID) {
    body.deviceId = process.env.TEXTBEE_DEVICE_ID;
  }

  const response = await fetch(TEXTBEE_SEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.TEXTBEE_API_KEY,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      `textbee SMS failed (${response.status}): ${JSON.stringify(data)}`,
    );
  }

  return data;
};

module.exports = { sendOtpSms };
