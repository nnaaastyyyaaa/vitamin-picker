const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  related_vitamins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vitamin' }],
});

module.exports = mongoose.model('Symptom', symptomSchema);
