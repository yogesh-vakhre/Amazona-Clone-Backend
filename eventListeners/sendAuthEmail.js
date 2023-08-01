const EventEmitter = require("events");
const eventEmitter = new EventEmitter();

const sendEmail = require("../utils/email");

const sendVerificationEmail = async (user, origin) => {
  const promise = new Promise(async (resolve, reject) => {
    let verifyToken = user.resetToken;
    const resetURL = `${origin}/verify-email?token=${verifyToken}`;

    const message = `<h3>Thank you for creating account on Domain Name. Please verify your email to continue.</h2>
     <p><a href=${resetURL}>Click here to verify the email</a> <p>
      <p>The verification link  will expire in 30 minutes</p>
      <p>If its not you, please ignore this email</p>
      `;

    // const message = `Thank you for creating account on AX3. Please verify your email to continue.
    // The verification link  will expire in 30 minutes
    // If its not you, please ignore this email `;
    await sendEmail({
      email: user.email,
      subject: "Verify your email (Token will expire in 30 minutes)",
      template: "email-verification",
      replacements: {
        title: "Verify your email (Token will expire in 30 minutes) ",
        message,
        resetURL,
      },
    });
    resolve();
  });
  return promise;
};

const sendPasswordResetEmail = async (user, origin) => {
  // await sendEmail(options);
  const promise = new Promise(async (resolve, reject) => {
    let resetToken = user.resetToken;
    // console.log("resetToken", user.resetToken);
    const resetURL = `${origin}/reset-password?token=${resetToken}`;
    const message = `<h3>Forgot your Password?</h3> 
    <a href=${resetURL}>Click on this link to reset your password</a> 
    <p>If you do not forget your password, please ignore this email</p>`;

    await sendEmail({
      email: user.email,
      subject: "DOMAIN - Reset Your Password",
      template: "email-reset-password",
      replacements: {
        title: "DOMAIN - Reset Your Password",
        message,
        resetURL,
      },
    });
    resolve();
  });
  return promise;
};

eventEmitter.on("sendPasswordResetEmail", async ({ user, origin }) => {
  await sendPasswordResetEmail(user, origin);
});

eventEmitter.on("sendVerificationEmail", async ({ user, origin }) => {
  await sendVerificationEmail(user, origin);
});

module.exports = eventEmitter;
