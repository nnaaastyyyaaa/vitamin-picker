'use strict';

const path = require('path');
const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('@fastify/cors');
const fStatic = require('@fastify/static');

const usersRouts = require('./routs/usersRouts');
const catalogueRouts = require('./routs/catalogueRouts');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<db_password>', process.env.PASSWORD);
mongoose.connect(DB).then(() => {
  console.log('DB connection succesful');
});

fastify.register(fStatic, {
  root: path.join(__dirname, 'users'),
});

fastify.register(cors);
fastify.register(usersRouts, { prefix: '/api' });
fastify.register(catalogueRouts, { prefix: '/catalogue' });

const port = process.env.PORT || 3000;
fastify.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
  }
  console.log(`Listening requests at ${address}`);
});
