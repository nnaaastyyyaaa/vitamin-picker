const axios = require('axios');
const User = require('./userSchema');
const { throwError } = require('../throwError');

exports.authProxy = (requiredRole = null) => {
  return async function (req, res) {
    if (!req.session.userId) {
      throwError(403, 'You aren`t authorised!');
    }
    const user = await User.findById(req.session.userId);
    if (!user) {
      throwError(401, 'Any user found');
    }
    if (requiredRole && user.role !== requiredRole) {
      throwError(403, 'You aren`t allowed to do this request!');
    }
    req.user = user;
  };
};

exports.apiProxy = async (body) => {
  const authHeader =
    'Basic ' + Buffer.from(`api:${process.env.MAILGUN_KEY}`).toString('base64');
  const response = await axios.post(
    `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
    new URLSearchParams(body),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: authHeader,
      },
    },
  );
  return response;
};
