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
    for (const [key, { timestamp }] of cache) {
      if (timestamp < now) {
        cache.delete(key);
      }
    }
    return val;
  };
  memoized.deleteFromCache = deleteFromCache;
  return memoized;
};

const memoizedFindUser = memoize((email) => User.findOne({ eMail: email }));

const sendResponse = (res, message, status = 200) => {
  res.status(status).send({ message });
};

const throwError = (status, message) => {
  const error = new Error(message);
  error.statusCode = status;
  throw error;
};

const createSession = async (req, user) => {
  req.session.userId = user._id;
  await req.session.save();
};

const deleteSession = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throwError(null, 'Failed to logout!');
    }
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 1000 * 60 * 60,
    });
  });
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
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
  await createSession(req, newUser);
  sendResponse(res, 'New user succesfully created', 201);
};

const checkUser = async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    throwError(400, 'Please fill both fields');
  }

  const user = await memoizedFindUser(login);
  const strPassword = String(password);

  if (!user || !(await user.checkPassword(strPassword, user.password))) {
    throwError(401, 'Invalid login or password!');
  }

  await createSession(req, user);
  sendResponse(res, 'Successfuly!');
};

const getProfile = async (req, res) => {
  if (!req.session.userId) {
    throwError(403, 'You aren`t authorised!');
  }
  const user = await User.findById(req.session.userId);
  if (!user) {
    throwError(401, 'Any user found');
  }
  res.status(200).send({ name: user.username, role: user.role });
};

const forgotPassword = async (req, res) => {
  const eMail = req.body.eMail;
  const user = await memoizedFindUser(eMail);
  if (!user) {
    throwError(401, 'Invalid email!');
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
  sendResponse(res, 'Link has been sent to the client!');
};

const getResetPage = async (req, res) => {
  const token = req.params.token;
  const hashedToken = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) {
    return throwError(401, 'Didn`t find user or your token has expired!');
  }
  memoizedFindUser.deleteFromCache(user.eMail);
  res.redirect(
    `/users/user-reset/reset-password.html?token=${req.params.token}`,
  );
};

const resetPassword = async (req, res) => {
  const token = req.params.token;
  const hashedToken = hashToken(token);
  const { password, password1 } = req.body;
  const strPassword = String(password);
  const strPassword1 = String(password1);
  const user = await User.findOne({ passwordResetToken: hashedToken });
  if (!user) {
    throwError(401, 'Any user found ');
  }
  user.password = strPassword;
  user.passwordRepeat = strPassword1;
  user.resetAttempts = 0;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();
  sendResponse(res, 'Successfuly!');
};

const logOut = async (req, res) => {
  deleteSession(req, res);
  sendResponse(res, 'Logged out');
};

const deleteUser = async (req, res) => {
  const { eMail, password } = req.body;
  if (!eMail || !password) {
    throwError(400, 'Please fill both fields');
  }
  const strPassword = String(password);
  const user = await memoizedFindUser(eMail);
  if (
    !user ||
    !(await user.checkPassword(strPassword, user.password)) ||
    String(req.session.userId) !== String(user._id)
  ) {
    throwError(400, 'Failed to delete');
  }
  deleteSession(req, res);
  await User.findByIdAndDelete(user._id);
  memoizedFindUser.deleteFromCache(user.eMail);
};

const getAllUsers = async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user || user.role !== 'admin') {
    return throwError(403, 'You aren`t allowed to do this request!');
  }

  res.raw.writeHead(200, { 'Content-Type': 'application/json' });
  const cursor = User.find({}, 'username eMail createdAt -_id').cursor();

  cursor.on('data', (data) => {
    const dataJson = JSON.stringify(data);
    res.raw.write(dataJson + '\n');
  });

  cursor.on('end', () => {
    res.raw.end();
  });

  cursor.on('error', (err) => {
    throwError(null, 'Error while streaming users');
  });
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
  fastify.get('/getAllUsers', getAllUsers);
}

module.exports = userRoutes;
