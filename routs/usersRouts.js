'use strict';

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../users/userSchema');

const memoize = (fn) => {
  const ttl = 5 * 60 * 1000;
  const cache = new Map();

  const deleteFromCache = (...args) => {
    const key = args.map((arg) => String(arg)).join('|');
    cache.delete(key);
  };

  setInterval(() => {
    const now = Date.now();
    for (const [key, { timestamp }] of cache) {
      if (timestamp < now) {
        cache.delete(key);
      }
    }
  }, 200000);
  const memoized = async (...args) => {
    const now = Date.now();
    const key = args.map((arg) => String(arg)).join('|');
    const cached = cache.get(key);
    if (cached && cached.timestamp > now) {
      console.log('Hello from cache');
      console.log(cache);
      return cached.value;
    }

    const val = await fn(...args);
    cache.set(key, {
      value: val,
      timestamp: now + ttl,
    });
    return val;
  };
  memoized.deleteFromCache = deleteFromCache;
  return memoized;
};

const memoizedFindUser = memoize((email) => User.findOne({ eMail: email }));
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

  const user = await memoizedFindUser(login);
  const strPassword = String(password);

  if (!user || !(await user.checkPassword(strPassword, user.password))) {
    return sendNotFound(res, 'Invalid login or password!');
  }

  req.session.userId = user._id;
  await req.session.save();
  res.status(200).send({ message: 'Successfuly!' });
};

const getProfile = async (req, res) => {
  if (!req.session.userId) {
    return sendNotFound(res, 'You aren`t authorised!');
  }
  const user = await User.findById(req.session.userId);
  if (!user) {
    return sendNotFound(res, 'Any user found');
  }
  res.status(200).send({ name: user.username });
};

const forgotPassword = async (req, res) => {
  const eMail = req.body.eMail;
  const user = await memoizedFindUser(eMail);
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
  memoizedFindUser.deleteFromCache(user.eMail);
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
  user.resetAttempts = 0;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();
  res.status(200).send({ message: 'Successfuly!' });
};
const logOut = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw new Error('Failed to logout!');
    }
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 1000 * 60 * 60,
    });
    res.send({ message: 'Logged out' });
  });
};

const deleteUser = async (req, res) => {
  const { eMail, password } = req.body;
  if (!eMail || !password) {
    return sendNotFound(res, 'Please fill both fields');
  }
  const strPassword = String(password);
  const user = await memoizedFindUser(login);
  if (
    !user ||
    !(await user.checkPassword(strPassword, user.password)) ||
    String(req.session.userId) !== String(user._id)
  ) {
    return sendNotFound(res, 'Failed to delete');
  }
  await User.findByIdAndDelete(user._id);
};

async function userRoutes(fastify, options) {
  fastify.post('/login', createUser);
  fastify.post('/sign-in', checkUser);
  fastify.get('/profile', getProfile);
  fastify.post('/forget', forgotPassword);
  fastify.patch('/reset/:token', resetPassword);
  fastify.get('/reset/:token', getResetPage);
  fastify.get('/exit', logOut);
  fastify.delete('/delete', deleteUser);
}

module.exports = userRoutes;
