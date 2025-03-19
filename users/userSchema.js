'use strict';

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

const User = mongoose.model('User', userSchema);
module.exports = User;
