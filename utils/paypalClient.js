const {
  Client,
  Environment,
  OrdersController,
  PaymentsController,
} = require("@paypal/paypal-server-sdk");

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID,
    oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  },
  environment:
    process.env.PAYPAL_ENV === "production"
      ? Environment.Production
      : Environment.Sandbox,
});

const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);

module.exports = { ordersController, paymentsController };
