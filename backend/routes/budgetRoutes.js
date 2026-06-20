const express = require('express');
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection middleware to all budget routes
router.use(protect);

router
  .route('/')
  .get(getBudgets)
  .post(createBudget);

router
  .route('/:id')
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;
