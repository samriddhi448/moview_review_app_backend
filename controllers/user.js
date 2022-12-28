const User = require('../models/user')
const EmailVerificationToken = require('../models/emailVerificationToken')
const jwt = require('jsonwebtoken');
const { isValidObjectId } = require('mongoose');
const passwordresettokens = require('../models/passwordResetToken');
const { generateRandomByte , sendError} = require('../utils/helper');
const { generateOTP, generateMailTransporter } = require('../utils/mail');
const passwordResetToken = require('../models/passwordResetToken');


exports.create = async (req, res) => {
  const {name,email,password} = req.body;
  const oldUser = await User.findOne({ email });
  if(oldUser) return sendError(res, 'This email is already present');
  const newUser = User({name,email,password});
  await newUser.save();

  //generate 6 digit OTP 
  let OTP = generateOTP();
  //store in db
  const newEmailVerificationToken = new EmailVerificationToken({owner: newUser._id, token: OTP});
  console.log('newEmailVerificationToken',newEmailVerificationToken)
  await newEmailVerificationToken.save();
  // send to user
  var transport = generateMailTransporter();
  transport.sendMail({
    from: 'samriddhij06@gmail.com',
    to: newUser.email,
    subject: 'Email Verification',
    html:
    `<p>Your Verification OTP</p>
    <h1>${OTP}</h1>`
  })
  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email
    }
  })
};

exports.verifyEmail = async(req,res) => {
  const {userId, OTP} = req.body;
  try {
  if(!isValidObjectId(userId)) return res.json({error: 'Invalid User!'});
  const user = await User.findById(userId);
  if(!user) return sendError(res,'User not found!',404);
  if(user.isVerified) return sendError(res,'User is already verified');
  const token = await EmailVerificationToken.findOne({owner: userId});
  console.log('token',token,userId)
  if(!token) return sendError(res,'Token not found!');
  const isMatched = await token.compareToken(OTP);
  if(!isMatched) return sendError(res,'Please submit a valid OTP!');

  user.isVerified = true;
  await user.save();
  await EmailVerificationToken.findByIdAndDelete(token._id);
  var transport = generateMailTransporter();
  transport.sendMail({
    from: 'samriddhij06@gmail.com',
    to: user.email,
    subject: 'Welcome Email!',
    html:
    `<p>Welcome to MRP. Thanks for choosing us!</p>`
  })
  const jwtToken = jwt.sign({userId: user._id}, process.env.JWT_SECRET);
  res.json({
    user: { id: user._id, name: user.name , email: user.email, token: jwtToken},
    message: 'Email is verified'});
} catch(error) {
  return sendError(res, 'some error');
}

};

exports.resendEmailVerificationToken = async(req,res) => {
  const {userId} = req.body;
  const user = await User.findById(userId);
  if(!user) return sendError(res,'User not found!',404);
  if(user.isVerified) return sendError(res,'User is already verified');
  const alreadyHasToken = await EmailVerificationToken.findOne({owner: userId});
  if(alreadyHasToken) return res.json({error: 'Only after one hour you can request for another token!'})
  //generate 6 digit OTP 
  let OTP = generateOTP();
  //store in db
  const newEmailVerificationToken = new EmailVerificationToken({owner: user._id, token: OTP});
  await newEmailVerificationToken.save();
  // send to user
  const transport = generateMailTransporter();
  transport.sendMail({
    from: 'samriddhij06@gmail.com',
    to: user.email,
    subject: 'Email Verification',
    html:
    `<p>Your Verification OTP</p>
    <h1>${OTP}</h1>`
  })
  res.status(201).json({message: 'New OTP sent to your email!'})
};

exports.forgetPassword = async(req,res) => {
  const { email } =req.body;
  if(!email) return sendError(res,'Email is missing!');
  const user = await User.findOne({email})
  if(!user) return sendError(res,'User not found!',404);
  const alreadyHasToken = await passwordresettokens.findOne({owner: user._id})
  if(alreadyHasToken) return res.json({error: 'Only after one hour you can request for another token!'})
  const token = await generateRandomByte();
  const newPasswordToken = await passwordresettokens({owner: user._id, token});
  await newPasswordToken.save();
  const resetPasswordToken = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;
  const transport = generateMailTransporter();
  transport.sendMail({
    from: 'security@reviewapp.com',
    to: user.email,
    subject: 'Reset Password Link',
    html:
    `<p>Click here to reset password</p>
    <a href='${resetPasswordToken}'>Change Password</a>`
  })
  res.status(201).json({message: 'Reset Link sent to your email!'})

};

exports.sendResetPasswordTokenStatus = (req, res)=> {
  res.json({ valid: true })
};

exports.resetPassword = async(req, res) => {
    const { newPassword, userId } = req.body;
    const user = await User.findById(userId);
    const matched = await user.comparePassword(newPassword);
    if(matched) return sendError(res, 'The new password must be different from the old password');
    user.password = newPassword;
    await user.save();

    await passwordResetToken.findByIdAndDelete(req.resetToken._id)

    const transport = generateMailTransporter();
    transport.sendMail({
      from: 'security@reviewapp.com',
      to: user.email,
      subject: 'Password Reset Successful',
      html:
      `<h1>Password Reset Successful</h1>
      <p>Now you can use new password</p>`
    })
  res.status(201).json({message: 'Password Reset Successful!'})


};

exports.signIn = async(req, res, next) =>{
  const { email, password} = req.body;
 const user = await User.findOne({email});
 if(!user) return sendError(res, 'Email/Password mismatch');
 const matched = await user.comparePassword(password)
 console.log(matched)
 if(!matched) return sendError(res, 'Email/Password mismatch');
 const { _id, name } = user;
 const jwtToken = jwt.sign({userId: _id}, process.env.JWT_SECRET);
 res.json({user:{id:_id,name, email, token:jwtToken }})
 next(error.message)

}



