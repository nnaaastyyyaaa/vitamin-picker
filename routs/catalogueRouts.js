'use strict';

const { ObjectId } = require('mongodb');
const slugify = require('slugify');

module.exports = function (fastify, options, done) {
  const db = fastify.mongo.db;
  const vitaminsCollection = db.collection('vitamins');

  //error func
  const sendErrorRes = (res, statusCode, message) => {
    return res.status(statusCode).send({ status: 'fail', message });
  };

  //перевірка при додаванні нового вітаміну(middlewear)
  fastify.addHook('preHandler', (req, res, done) => {
    if (req.url === '/vitamins' && req.method === 'POST') {
      if (!req.body.name) {
        return sendErrorRes(res, 400, 'Missing name');
      }
    }
    done();
  });

  //get all vitamins
  fastify.get('/vitamins', async (req, res) => {
    try {
      const vitamins = await vitaminsCollection.find().toArray();

      return {
        status: 'success',
        data: { vitamins },
      };
    } catch {
      return sendErrorRes(res, 500, 'Помилка отримання вітамінів');
    }
  });

  //get vitamin by id
  fastify.get('/vitamins/:id', async (req, res) => {
    try {
      //перевірка id
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return sendErrorRes(res, 400, 'Invalid ID');
      }

      const vitamin = await vitaminsCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!vitamin) {
        return sendErrorRes(res, 404, 'Vitamin not found');
      }

      return { status: 'success', data: { vitamin } };
    } catch {
      return sendErrorRes(res, 500, 'Помилка при отриманні вітаміну');
    }
  });

  //створити новий вітамін
  fastify.post('/vitamins', async (req, res) => {
    try {
      const newVitamin = {
        name: req.body.name,
        description: req.body.description || '',
        slug: slugify(req.body.name, { lower: true }),
      };

      const result = await vitaminsCollection.insertOne(newVitamin);
      return {
        status: 'success',
        data: { _id: result.insertedId, newVitamin },
      };
    } catch (error) {
      return sendErrorRes(res, 500, 'Помилка при створенні вітаміну');
    }
  });

  fastify.delete('/vitamins:/id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return sendErrorRes(res, 400, 'Invalid id');
      }

      const result = await vitaminsCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        return sendErrorRes(res, 404, 'Vitamin not found');
      }

      return { status: 'success', data: null };
    } catch (error) {
      return sendErrorRes(res, 500, 'Помилка видалення вітаміну');
    }
  });
  done();
};
