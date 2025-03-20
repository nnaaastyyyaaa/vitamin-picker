'use strict';
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./userSchema');

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
  return token;
};

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOp = {
    from: 'Nastya',
    to: options.email,
    subject: options.subject,
    html: `<p>Forgot a password? Click the link below to reset it:</p>
    <a href="${options.message}" target="_blank">${options.message}</a>
    <p>If you didn't request a password reset, please ignore this email.</p>`,
  };

  await transporter.sendMail(mailOp);
};

exports.createUser = async (req, res) => {
  try {
    const { username, eMail, password, passwordRepeat } = req.body;
    const strPassword = String(password);
    const strPasswordRepeat = String(passwordRepeat);
    const newUser = await User.create({
      username,
      eMail,
      password: strPassword,
      passwordRepeat: strPasswordRepeat,
    });
    const token = signToken(newUser._id);
    res.status(201).json({ token, message: 'New user succesfully created' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      const key = Object.keys(err.keyValue);
      const value = Object.values(err.keyValue);
      return res.status(400).json({
        message: `Field "${key}" with value "${value}" already exists. Please use another value`,
      });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((el) => el.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res
      .status(500)
      .json({ message: 'Error creating user', error: err.message });
  }
};

exports.checkUser = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ message: 'Please fill both fields' });
    }

    const user = await User.findOne({ eMail: login });
    const strPassword = String(password);

    if (!user || !(await user.checkPassword(strPassword, user.password))) {
      return res.status(404).json({ message: 'Invalid login or password!' });
    }

    const token = signToken(user._id);
    res.status(200).json({ token, message: 'Successfuly!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.forgotPassword = async (req, res) => {
  const eMail = req.body.eMail;
  console.log(eMail);
  const user = await User.findOne({ eMail: req.body.eMail });
  if (!user) {
    return res.status(400).json({ message: 'Invalid email!' });
  }
  const token = user.createResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get('host')}/api/reset/${token}`;
  const message = `${resetURL}`;
  try {
    await sendEmail({
      email: eMail,
      subject: 'Your password reset link',
      message,
    });
    res.status(200).json({
      message: 'Link has benn sent to the client!',
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      message: 'There has been an error!',
    });
  }
};
exports.getResetPage = async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) {
    return res
      .status(400)
      .json({ message: 'Didn`t find user or your token has expired!' });
  }
  res.sendFile(__dirname + '/user-reset/reset-password.html');
};

exports.resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log(hashedToken);
    const { password, password1 } = req.body;
    const strPassword = String(password);
    const strPassword1 = String(password1);
    const user = await User.findOne({ passwordResetToken: hashedToken });
    if (!user) {
      return res.status(404).json({
        message: 'Any user found ',
      });
    }
    user.password = strPassword;
    user.passwordConfirm = strPassword1;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();
    res.status(200).json({ message: 'Successfuly!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
