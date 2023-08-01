const handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const { APP_URL } = require("../config/app");
const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_DRIVER,
  MAIL_USERNAME,
  MAIL_PASSWORD,
  MAIL_FROM_NAME,
  MAIL_FROM_ADDRESS,
} = require("../config/mail");
const { getHTMLFromUrl } = require("./getHTMLFromUrl");

const sendEmail = async (options) => {
  const promise = new Promise(async (resolve, reject) => {
    var config = {
      host: MAIL_HOST,
      port: MAIL_PORT,
      service: MAIL_DRIVER,
      secure: false,
      auth: {
        user: MAIL_USERNAME,
        pass: MAIL_PASSWORD,
      },
    };
    const transporter = nodemailer.createTransport(config);

    let mailOptions = {
      from: MAIL_FROM_ADDRESS,
      to: options.email,
      cc: options.cc,
      subject: options.subject,
      attachments: options.attachments ? options.attachments : [],
    };

    // transporter.sendMail(
    //   {
    //     from: "demo.noreplay@yopmail.com",
    //     to: "demo.noreplay@yopmail.com",
    //     subject: "Message",
    //     text: "I hope this message gets sent!",
    //   },
    //   (err, info) => {
    //     if (err) console.log("Error: ", err);
    //     resolve();
    //     console.log(info);
    //   }
    // );

    const emailRequest = async (mailOptions) => {
      try {
        //  console.log("mailOptions", mailOptions);
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) console.log("Error: ", err);
          resolve();
          console.log("Email sent successfully!");
          //console.log(info);
        });
      } catch (err) {
        reject();
        console.log("Error in sending email", err);
      }
    };

    if (options.template) {
      // console.log(options.template);
      ejs.renderFile(
        path.join(__dirname, `../emails/templates/${options.template}.html`),
        (err, html) => {
          if (err) {
            console.log(err);
          } else {
            const template = handlebars.compile(html);
            const htmlToSend = template(options.replacements);
            mailOptions.html = htmlToSend;
            emailRequest(mailOptions);
          }
        }
      );
    } else {
      mailOptions.html = options.message;
      emailRequest(mailOptions);
    }
  });
  return promise;
};

module.exports = sendEmail;
