'use strict';

const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');
const Vitamin = require('../vitamins/vitamin-schema.js');

const sendErrorRes = (res, message) => {
  return res.status(404).send({ status: 'fail', message });
};

//get all vitamins
async function catalogueRouts(fastify, options) {
  const db = options.db;
  const vitamin = Vitamin(db);
  fastify.get('/vitamins', async (req, res) => {
    const vitamins = await vitamin.find();
    if (!vitamins) {
      return sendErrorRes(res, 'No vitamins');
    }
    return {
      status: 'success',
      data: { vitamins },
    };
  });

  //get vitamin by id
  fastify.get('/vitamins/:id', async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return sendErrorRes(res, 'Invalid ID');
    }

    const vitamin = await vitamin.findOne({
      _id: new ObjectId(id),
    });
    if (!vitamin) {
      return sendErrorRes(res, 'Vitamin not found');
    }

    return { status: 'success', data: { vitamin } };
  });

  //створити новий вітамін
  fastify.post('/vitamins', async (req, res) => {
    const newVitamin = await vitamin.create({
      name: req.body.name,
      description: req.body.description || '',
    });

    return {
      status: 'success',
      data: { newVitamin },
    };
  });

  fastify.delete('/vitamins:/id', async (req, res) => {
    const { id } = req.params;

    await vitamin.findByIdAndDelete(id);
    return { status: 'success', data: null };
  });
}

module.exports = catalogueRouts;
