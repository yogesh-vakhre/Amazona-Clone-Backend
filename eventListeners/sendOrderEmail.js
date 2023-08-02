const EventEmitter = require("events");
const eventEmitter = new EventEmitter();

const sendEmail = require("../utils/email");

const sendPayOrderEmail = async (order, origin) => {
  const promise = new Promise(async (resolve, reject) => {
    const message = `<h1>Thanks for shopping with us</h1>
                      <p>
                      Hi ${order.user.name},</p>
                      <p>We have finished processing your order.</p>
                      <h2>[Order ${order._id}] (${order.createdAt
      .toString()
      .substring(0, 10)})</h2>
                      <table>
                      <thead>
                      <tr>
                      <td><strong>Product</strong></td>
                      <td><strong>Quantity</strong></td>
                      <td><strong align="right">Price</strong></td>
                      </thead>
                      <tbody>
                      ${order.orderItems
                        .map(
                          (item) => `
                        <tr>
                        <td>${item.name}</td>
                        <td align="center">${item.quantity}</td>
                        <td align="right"> $${item.price.toFixed(2)}</td>
                        </tr>
                      `
                        )
                        .join("\n")}
                      </tbody>
                      <tfoot>
                      <tr>
                      <td colspan="2">Items Price:</td>
                      <td align="right"> $${order.itemsPrice.toFixed(2)}</td>
                      </tr>
                      <tr>
                      <td colspan="2">Shipping Price:</td>
                      <td align="right"> $${order.shippingPrice.toFixed(2)}</td>
                      </tr>
                      <tr>
                      <td colspan="2"><strong>Total Price:</strong></td>
                      <td align="right"><strong> $${order.totalPrice.toFixed(
                        2
                      )}</strong></td>
                      </tr>
                      <tr>
                      <td colspan="2">Payment Method:</td>
                      <td align="right">${order.paymentMethod}</td>
                      </tr>
                      </table>

                      <h2>Shipping address</h2>
                      <p>
                      ${order.shippingAddress.fullName},<br/>
                      ${order.shippingAddress.address},<br/>
                      ${order.shippingAddress.city},<br/>
                      ${order.shippingAddress.country},<br/>
                      ${order.shippingAddress.postalCode}<br/>
                      </p>
                      <hr/>
                      <p>
                      Thanks for shopping with us.
                      </p>
                      `;

    // const message = `Thank you for creating account on AX3. Please verify your email to continue.
    // The verification link  will expire in 30 minutes
    // If its not you, please ignore this email `;
    await sendEmail({
      email: `${order.user.name} <${order.user.email}>`,
      subject: `New order ${order._id}`,
      template: "pay-order-email",
      replacements: {
        title: `New order ${order._id}`,
        message,
      },
    });
    resolve();
  });
  return promise;
};

eventEmitter.on("sendPayOrderEmail", async ({ order, origin }) => {
  await sendPayOrderEmail(order, origin);
});

module.exports = eventEmitter;
