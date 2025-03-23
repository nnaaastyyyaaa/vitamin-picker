'use strict';

const path = require('path');
const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('@fastify/cors');
const fStatic = require('@fastify/static');

const usersRouts = require('./routs/usersRouts');
const catalogueRouts = require('./routs/catalogueRouts');

require('./errorHandler')(fastify);
dotenv.config({ path: './.env' });

const DB1 = process.env.DATABASE1.replace(
  '<db_password>',
  process.env.PASSWORD1,
);
mongoose.connect(DB1).then(() => {
  console.log('DB1 connection succesful');
});

const DB2 = process.env.DATABASE2.replace(
  '<db_password>',
  process.env.PASSWORD2,
);
const db2 = mongoose.createConnection(DB2, { dbName: 'vitamins' });
db2.on('connected', () => console.log('DB2 connection succesful'));

fastify.register(fStatic, {
  root: path.join(__dirname, 'users'),
});

fastify.register(cors);
fastify.register(usersRouts, { prefix: '/api' });
fastify.register(catalogueRouts, { prefix: '/catalogue', db: db2 });

const port = process.env.PORT || 3000;
fastify.listen({ port, host: '127.0.0.1' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
  }
  console.log(`Listening requests at ${address}`);
});
