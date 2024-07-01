const nodemailer = require("nodemailer");
const hdb = require("nodemailer-express-handlebars");
const path = require("path");

const sendEmail = async (
  subject,
  sent_to,
  sent_from,
  reply_to,
  template,
  name,
  link
) => {
  //create mail transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
      user: "nghuydu.99@gmail.com",
      pass: "jvijesdpjfdnoxyv",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  const handleOptions = {
    viewEngine: {
      extName: ".handlebars",
      partialsDir: path.resolve(__dirname, "..", "views"),
      defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, "..", "views"),
    extName: ".handlebars",
  };

  transporter.use("compile", hdb(handleOptions));
  const options = {
    from: sent_from,
    to: sent_to,
    replyTo: reply_to,
    subject,
    template,
    context: {
      name,
      link,
    },
  };
  console.log("options", options);
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;
