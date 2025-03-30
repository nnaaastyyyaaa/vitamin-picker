'use strict';

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../users/userSchema');

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

const sendNotFound = (res, message) => {
  return res.status(404).send({ message: message });
};

const createUser = async (req, res) => {
  const { username, eMail, password, passwordRepeat } = req.body;
  const strPassword = String(password);
  const strPasswordRepeat = String(passwordRepeat);
  const newUser = await User.create({
    username,
    eMail,
    password: strPassword,
    passwordRepeat: strPasswordRepeat,
  });

  req.session.userId = newUser._id;
  await req.session.save();
  res.status(201).send({ message: 'New user succesfully created' });
};

const checkUser = async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return sendNotFound(res, 'Please fill both fields');
  }

  const user = await User.findOne({ eMail: login });
  const strPassword = String(password);

  if (!user || !(await user.checkPassword(strPassword, user.password))) {
    return sendNotFound(res, 'Invalid login or password!');
  }

  req.session.userId = user._id;
  await req.session.save();
  res.status(200).send({ message: 'Successfuly!' });
};

const forgotPassword = async (req, res) => {
  const eMail = req.body.eMail;
  const user = await User.findOne({ eMail: req.body.eMail });
  if (!user) {
    return sendNotFound(res, 'Invalid email!');
  }
  const token = user.createResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `http://${req.headers.host}/api/reset/${token}`;
  const message = `${resetURL}`;
  await sendEmail({
    email: eMail,
    subject: 'Your password reset link',
    message,
  });
  res.status(200).send({
    message: 'Link has benn sent to the client!',
  });
};

const getResetPage = async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) {
    return sendNotFound(res, 'Didn`t find user or your token has expired!');
  }
  res.redirect(`/user-reset/reset-password.html?token=${req.params.token}`);
};

const resetPassword = async (req, res) => {
  const token = req.params.token;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  console.log(hashedToken);
  const { password, password1 } = req.body;
  const strPassword = String(password);
  const strPassword1 = String(password1);
  const user = await User.findOne({ passwordResetToken: hashedToken });
  if (!user) {
    return sendNotFound(res, 'Any user found ');
  }
  user.password = strPassword;
  user.passwordRepeat = strPassword1;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();
  res.status(200).send({ message: 'Successfuly!' });
};

async function userRoutes(fastify, options) {
  fastify.post('/login', createUser);
  fastify.post('/sign-in', checkUser);
  fastify.post('/forget', forgotPassword);
  fastify.patch('/reset/:token', resetPassword);
  fastify.get('/reset/:token', getResetPage);
  fastify.get('/active-sessions', (req, res) => {
    if (req.session.userId) {
      res.send({ message: 'Сесія активна', userId: req.session.userId });
    } else {
      res.send({ message: 'Сесія не знайдена' });
    }
  });
}

module.exports = userRoutes;
