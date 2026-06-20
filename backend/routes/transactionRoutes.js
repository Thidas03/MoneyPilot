const express = require('express');
const { check } = require('express-validator');
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection middleware to all transaction routes
router.use(protect);

router.get('/stats', getTransactionStats);

// Validation rules
const transactionValidation = [
  check('type', 'Type must be income or expense').isIn(['income', 'expense']),
  check('amount', 'Amount must be a positive number').isFloat({ min: 0.01 }),
  check('category', 'Category is required').notEmpty().trim(),
  check('date', 'Please enter a valid date').optional({ checkFalsy: true }).isISO8601(),
];

// Routes mapping
router
  .route('/')
  .get(getTransactions)
  .post(transactionValidation, createTransaction);

router
  .route('/:id')
  .get(getTransactionById)
  .put(transactionValidation, updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
