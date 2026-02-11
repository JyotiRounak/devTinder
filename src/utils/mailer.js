const nodeMailer = require("nodemailer");

const transporter = nodeMailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 465,
    secure: true,
    auth: {
        user: "apikey",
        pass: process.env.EMAIL_PASS,
    },
});


async function sendEmail(to, subject, text, html){
    if (!to) throw new Error("Recipient email required");
    console.log("to", to)
   try{
    const mailOptions= {
        from :`"DevTinder" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
    }
    const emailInfo = await transporter.sendMail(mailOptions);
    console.log("FROM:", process.env.EMAIL_USER);
    return emailInfo;

   }
   catch(error){
    console.error("❌ Error sending email:", error.message);
        throw new Error("Failed to send email: " + error.message);
   }

}

module.exports = { sendEmail};