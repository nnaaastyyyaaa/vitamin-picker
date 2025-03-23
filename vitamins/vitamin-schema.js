'use strict';

const mongoose = require('mongoose');

module.exports = (db) => {
  const VitaminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
  });

  return db.model('Vitamin', VitaminSchema);
};
