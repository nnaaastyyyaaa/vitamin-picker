const mongoose = require('mongoose');

module.exports = (db) => {
  const SymptomSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      description: String,
      related_vitamins: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Vitamin' },
      ],
    },
    { collection: 'symptoms' },
  );

  return db.model('Symptom', SymptomSchema);
};
