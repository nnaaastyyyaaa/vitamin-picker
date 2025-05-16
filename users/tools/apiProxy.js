'use strict';
require('dotenv').config();
const axios = require('axios');

class MailgunProxy {
  constructor(key, domain) {
    this.key = key;
    this.domain = domain;
  }

  async send({ to, subject, html }) {
    const authHeader = 'Basic ' + Buffer.from(`api:${this.key}`).toString('base64');
      const response = await axios.post(
        `https://api.mailgun.net/v3/${this.domain}/messages`,
        new URLSearchParams({
          from: `Anastasia <postmaster@${this.domain}>`,
          to,
          subject,
          html
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: authHeader,
          },
        }
      );
      return response;
  }
}
const mailgun = new MailgunProxy(process.env.MAILGUN_KEY, process.env.MAILGUN_DOMAIN);
exports.sendEmail = ({ to, subject, html }) => mailgun.send({ to, subject, html });