'use strict';

const mongoose = require('mongoose');

module.exports = function (fastify, options, done) {
  const db = fastify.db2;

  const VitaminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    slug: { type: String, unique: true },
  });

  const Vitamin = db.model('Vitamin', VitaminSchema);
  done();
};
