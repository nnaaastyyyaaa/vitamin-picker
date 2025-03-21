'use strict';

const fs = require('fs');
const slugify = require('slugify');
const Fastify = require('fastify');

const fastify = Fastify({ logger: true });
const { MongoClient, ObjectId } = require('mongodb');
const { send } = require('process');

const MONGO_URL =
  'mongodb+srv://dunaevaveronika13:eG9bV0n1I7fN9sI2@clusterv.sfvig.mongodb.net/';
const DB_NAME = 'vitaminsDB';

let db, vitaminsCollection;

//підключення до монгодб
async function connectDB() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(DB_NAME);
  vitaminsCollection = db.collection('vitamins');
  console.log('підключено до mongoDB');
}
connectDB().catch(console.error);

///const replaceTemplate = require('vitamins/replaceTemplate.js');
// const tempCatalogue = fs.readFileSync(`vitamins/catalogue.html`, 'utf-8');
// const tempCard = fs.readFileSync(`vitamins/template-card.html`, 'utf-8');
// const vitamins = JSON.parse(fs.readFileSync(vitamins / vitamins - data.json));

const slugs = vitamins.map((el) => ({
  ...el,
  slug: slugify(el.vitamin, { lower: true }),
}));

//error func
const sendErrorRes = (res, statusCode, message) => {
  return res.status(statusCode).send({ status: 'fail', message });
};

//перевірка при додаванні нового вітаміну(middlewear)
fastify.addHook('preHandler', (req, res, done) => {
  if (req.routerPath === '/vitamins' && req.method === 'POST') {
    if (!req.body.name) {
      return sendErrorRes(res, 400, 'Missing name');
    }
  }
  done();
});

//get all vitamins
fastify.get('/vitamins', async (req, res) => {
  return {
    status: 'success',
    data: { vitamins },
  };
});

//get vitamin by id
fastify.get('/vitamins/:id', async (req, res) => {
  //перевірка id
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return sendErrorRes(res, 400, 'Invalid ID');
  }

  const vitamin = await vitaminsCollection.findOne({ _id: new ObjectId(id) });
  if (!vitamin) {
    return sendErrorRes(res, 404, 'Vitamin not found');
  }

  return { status: 'success', data: { vitamin } };
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
    return { status: 'success', data: { vitamin: result.ops[0] } };
  } catch (error) {
    return sendErrorRes(res, 500, 'Помилка при створенні вітаміну');
  }
});

fastify.delete('/vitamins', async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return sendErrorRes(res, 400, 'Invalid id');
    }

    const result = await vitaminsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deleteCount === 0) {
      return sendErrorRes(res, 404, 'Vitamin not found');
    }

    return { status: 'success', data: null };
  } catch (error) {
    return sendErrorRes(res, 500, 'Помилка видалення вітаміну');
  }
});
