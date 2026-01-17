const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const soldeController = require('../controllers/solde.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

router.use(authMiddleware);

router.get('/', soldeController.getSolde);

router.put(
  '/initial',
  [
    body('initial_balance')
      .isFloat()
      .withMessage('Initial balance must be a number')
  ],
  validate,
  soldeController.updateInitialBalance
);

router.post('/recalculate', soldeController.recalculateBalance);

module.exports = router;
