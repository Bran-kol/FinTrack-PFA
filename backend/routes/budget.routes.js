const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const budgetValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Valid year is required'),
  body('category_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Invalid category')
];

router.use(authMiddleware);

router.get('/', budgetController.getAllBudgets);
router.get('/:id', budgetController.getBudget);
router.post('/', budgetValidation, validate, budgetController.createBudget);
router.put('/:id', budgetValidation, validate, budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
