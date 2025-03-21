const express = require('express');
const router = express.Router();
const catalogueController = require('../controllers/catalogueController');

router.param('id', catalogueController.checkID);

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
