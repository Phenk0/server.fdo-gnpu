const nodemailer = require("nodemailer");

exports.sendEmail = async (options) => {
  //1) Create a transporter
  const transporter = nodemailer.createTransport({
    // service: "Gmail",
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2) Define the email options
  const mailOptions = {
    from: '"Roman Parkhomenko 👻" <hello@romanstudio.dev>', // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
    html: `<h2><b>${options.message}</b></h2>`, // html body
  };
  //3) Actually send the email
  await transporter.sendMail(mailOptions);
};
