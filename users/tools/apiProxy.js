'use strict';
const axios = require('axios');

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
