'use strict';

const Fastify = require('fastify');
const fastify = Fastify({ logger: true });
const { MongoClient, ObjectId } = require('mongodb');
const catalogueRouts = require('../routs/catalogueRouts');

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

fastify.register(catalogueRouts);

///const replaceTemplate = require('vitamins/replaceTemplate.js');
// const tempCatalogue = fs.readFileSync(`vitamins/catalogue.html`, 'utf-8');
// const tempCard = fs.readFileSync(`vitamins/template-card.html`, 'utf-8');
// const vitamins = JSON.parse(fs.readFileSync(vitamins / vitamins - data.json));

// const slugs = vitamins.map((el) => ({
//   ...el,
//   slug: slugify(el.vitamin, { lower: true }),
// }));
