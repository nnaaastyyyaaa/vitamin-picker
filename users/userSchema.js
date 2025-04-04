'use strict';
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Profile must have a username'],
    trim: true,
    unique: true,
  },
  eMail: {
    type: String,
    required: [true, 'Profile must have a login'],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Profile must have a password'],
    trim: true,
  },
  passwordRepeat: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords aren`t the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  resetAttempts: {
    type: Number,
    default: 0,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordRepeat = undefined;

  next();
});

userSchema.methods.checkPassword = async function (inputPassword, dbPassword) {
  return await bcrypt.compare(inputPassword, dbPassword);
};
function* tokenGenerator() {
  yield crypto.randomBytes(32).toString('hex');
}
userSchema.methods.createResetToken = function () {
  if (this.passwordResetExpire && this.passwordResetExpire < Date.now()) {
    this.resetAttempts = 0;
  }
  if (this.resetAttempts >= 3) {
    throw new Error('You have used your attempts.Please, try again later!');
  } else {
    const genToken = tokenGenerator();
    const { value: token } = genToken.next();
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    this.passwordResetExpire = Date.now() + 30 * 60 * 1000;
    this.resetAttempts++;
    return token;
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;
