'use strict';

const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');
const Symptom = require('../test/symptomSchema');
const Vitamin = require('../vitamins/vitamin-schema');

const sendErrorRes = (res, message) =>
  res.status(404).send({ status: 'fail', message });

const getAllSymptoms = async (model) => {
  const symptoms = await model.find();
  return symptoms.length ? symptoms : null;
};

const renderSymptomList = (symptoms) => {
  const listItems = symptoms
    .map(
      (symptom) =>
        `<li><input type="checkbox" name="symptoms" value="${symptom._id}"> ${symptom.name}</li>`,
    )
    .join('');

  return tempOverview.replace('{%SYMPTOM_LIST%}', listItems);
};

async function testRoutes(fastify, options) {
  const db = options.db;
  const symptomSchema = symptom(db);
  const VitaminSchema = Vitamin(db);

  fastify.get('/symptoms', async (req, res) => {
    const symptoms = await getAllSymptoms(symptomSchema);
    return symptoms
      ? res.status(200).send({ status: 'success', data: { symptoms } })
      : sendErrorRes(res, 'No syptoms found');
  });

  fastify.get('/symptoms/html', async (req, res) => {
    const symptoms = await getAllSymptoms(symptomSchema);
    return symptoms
      ? res
          .header('Content-type', 'text/html')
          .send(renderSymptomList(symptoms))
      : sendErrorRes(res, 'No syptoms found');
  });

  fastify.post('/analyze', async (req, res) => {
    const { symptoms } = req.body;

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return sendErrorRes(res, 'No symptoms provided');
    }

    const foundSymptoms = await symptomSchema.find({ _id: { $in: symptoms } });

    if (!foundSymptoms.length) {
      return sendErrorRes(res, 'Symptoms not found in database');
    }

    const vitaminIds = [
      ...new Set(
        foundSymptoms.flatMap((sym) =>
          sym.related_vitamins.map((id) => id.toString()),
        ),
      ),
    ];

    if (!vitaminIds.length) {
      return res.status(200).send({
        status: 'success',
        message: 'No vitamins found for the given symptoms',
        data: [],
      });
    }
  });

  const vitamins = await VitaminSchema.find({ _id: { $in: vitaminIds } });

  return res.status(200).send({
    status: 'success',
    message: 'Recomended vitamins',
    data: vitamins,
  });
}

module.exports = testRoutes;
