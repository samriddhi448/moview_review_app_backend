const { check, validationResult } = require('express-validator');


exports.userValidator = [
  check('name').trim().not().isEmpty().withMessage('Name is Missing'),
  check('email').normalizeEmail().isEmail().withMessage('Email is Invalid'),
  check('password').trim().not().isEmpty().withMessage('Password is Missing').isLength({min: 8, max: 20}).withMessage('Password must be 8 to 20 characters long!')];
exports.validatePassword = [
  check('newPassword').trim().not().isEmpty().withMessage('Password is Missing').isLength({min: 8, max: 20}).withMessage('Password must be 8 to 20 characters long!')];
exports.signInValidator = [
  check('email').normalizeEmail().isEmail().withMessage('Email is Invalid'),
  check('password').trim().not().isEmpty().withMessage('Password is Missing')];
exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if(error.length) {
    return res.json({error: error[0].msg });
  }
  next();
}