const express = require('express');
const jwt = require('jsonwebtoken');
const { create, verifyEmail,resendEmailVerificationToken,forgetPassword, sendResetPasswordTokenStatus,resetPassword, signIn } = require('../controllers/user');
const { userValidator, validate,validatePassword,signInValidator} = require('../middlewares/validators');
const { isValidPassResetToken } = require('../middlewares/user');
const { sendError } = require('../utils/helper');
const User = require('../models/user');
const { isAuth } = require('../middlewares/auth');

const router = express.Router();
router.get('/is-auth',isAuth, (req, res)=> {
  const {user} = req;
 res.json({user: {id:user._id,name:user.name, email: user.email, token:user.password }})

})
router.post('/create',userValidator, validate, create); 
router.post('/sign-in',signInValidator, validate, signIn); 
router.post('/verify-email',verifyEmail); 
router.post('/resend-email-verification-token',resendEmailVerificationToken);
router.post('/forget-password',forgetPassword)
router.post('/verify-pass-reset-token',isValidPassResetToken,sendResetPasswordTokenStatus);
router.post('/reset-password',validatePassword, validate, isValidPassResetToken,resetPassword);
//get send to frontend from backedn think from frontend pers
//post getting from frontend to backend

module.exports = router;