'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'profile must have a username'],
    trim: true,
  },
  eMail: {
    type: String,
    required: [true, 'profile must have a login'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'profile must have a password'],
    trim: true,
  },
});
const User = mongoose.model('User', userSchema);
module.exports = User;
