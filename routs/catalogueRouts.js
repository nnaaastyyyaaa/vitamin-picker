const express = require('express');
const router = express.Router();
const catalogueController = require(`controllers/catalogueController.js`);

router.param('id', catalogueController.checkId);

router
  .route('/')
  .get(catalogueController.getAllVitamins)
  .post(catalogueController.createVitamin);

router
  .route(':id')
  .get(catalogueController.getVitamin)
  .patch(catalogueController.updateVitamin)
  .delete(catalogueController.deleteVitamin);

module.exports = router;
