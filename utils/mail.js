const nodemailer = require('nodemailer');

exports.generateOTP = (otp_length = 7) => {
//generate 6 digit otp 
let otp = '';
for(let i = 1; i< otp_length ; i++){
  const randomVal  = Math.round(Math.random()* 9)
  otp += randomVal;
}
return otp;
};

exports.generateMailTransporter = () => 
  nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAIL_TRAP_USER,
      pass: process.env.MAIL_TRAP_PASS,
    }
  });