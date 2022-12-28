const { isValidObjectId } = require('mongoose');
const passwordresettokens = require('../models/passwordResetToken');
const { sendError } = require('../utils/helper');
exports.isValidPassResetToken = async(req, res,next) => {
  const {token, userId} = req.body;
  if(!token.trim() || !isValidObjectId(userId)) return sendError(res, 'Invalid Request!') 
  const resetToken = await passwordresettokens.findOne({owner: userId});
  if(!resetToken) return sendError(res, 'Unauthorized access, Invalid Request!')
  const matched = await resetToken.compareToken(token)
  if(!matched) return sendError(res, 'Unauthorized access, Invalid Request!');
  req.resetToken = resetToken;
  next()

};