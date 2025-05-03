'use strict';

const crypto = require('crypto');

const axios = require('axios');
const User = require('../users/userSchema');
const { throwError } = require('../throwError');
const { authProxy } = require('../users/proxies');
const { apiProxy } = require('../users/proxies');

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

const createSession = async (req, user) => {
  req.session.userId = user._id;
  await req.session.save();
};

const deleteSession = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throwError(500, 'Failed to logout!');
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
  const user = req.user;
  res.status(200).send({ name: user.username, role: user.role });
};

const getEmail = async (eMail, message) => {
  const response = apiProxy({
    from: `Anastasia <postmaster@${process.env.MAILGUN_DOMAIN}>`,
    to: eMail,
    subject: 'Your password reset link',
    html: `<p>Forgot a password? Click the link below to reset it:</p>
      <a href="${message}" target="_blank">${message}</a>
      <p>If you didn't request a password reset, please ignore this email.</p>`,
  });
  return response;
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

  const response = await getEmail(eMail, message);
  if (!response.status === 200) {
    throwError(500, response.message);
  }
  sendResponse(res, 'Link has been sent to this email');
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
    req.user !== user
  ) {
    throwError(400, 'Failed to delete');
  }
  deleteSession(req, res);
  await User.findByIdAndDelete(user._id);
  memoizedFindUser.deleteFromCache(user.eMail);
};

const getAllUsers = async (req, res) => {
  res.raw.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:5500',
    'Access-Control-Allow-Credentials': 'true',
  });
  const cursor = User.find({}, 'username eMail createdAt -_id').cursor();

  cursor.on('data', (data) => {
    const dataJson = JSON.stringify(data);
    res.raw.write(dataJson + '\n');
  });

  cursor.on('end', () => {
    res.raw.end();
  });

  cursor.on('error', (err) => {
    throwError(500, 'Error while streaming users');
  });
};

async function userRoutes(fastify, options) {
  fastify.post('/login', createUser);
  fastify.post('/sign-in', checkUser);
  fastify.get('/profile', { preHandler: [authProxy()] }, getProfile);
  fastify.post('/forget', forgotPassword);
  fastify.patch('/reset/:token', resetPassword);
  fastify.get('/reset/:token', getResetPage);
  fastify.get('/exit', { preHandler: [authProxy()] }, logOut);
  fastify.delete('/delete', { preHandler: [authProxy()] }, deleteUser);
  fastify.get(
    '/getAllUsers',
    { preHandler: [authProxy('admin')] },
    getAllUsers,
  );
}

module.exports = userRoutes;
