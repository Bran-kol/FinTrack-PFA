const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const transactionValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('category_id')
    .isInt({ min: 1 })
    .withMessage('Category is required'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('description')
    .optional()
    .trim()
];

router.use(authMiddleware);

router.get('/', transactionController.getAllTransactions);
router.get('/:id', transactionController.getTransaction);
router.post('/', transactionValidation, validate, transactionController.createTransaction);
router.put('/:id', transactionValidation, validate, transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
