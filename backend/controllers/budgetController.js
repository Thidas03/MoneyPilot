const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

/**
 * @desc    Get all budgets for user with computed currentSpent
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get user's budgets
    const budgets = await Budget.find({ userId }).lean();

    // Query and aggregate transaction expenses for this month grouped by category
    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    // Map total spent to category lookup dictionary
    const spentMap = {};
    expenses.forEach(exp => {
      spentMap[exp._id] = exp.totalSpent;
    });

    // Attach currentSpent to each budget object
    const budgetsWithSpent = budgets.map(budget => ({
      ...budget,
      currentSpent: spentMap[budget.category] || 0
    }));

    res.status(200).json({
      success: true,
      count: budgetsWithSpent.length,
      data: budgetsWithSpent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new budget
 * @route   POST /api/budgets
 * @access  Private
 */
const createBudget = async (req, res, next) => {
  const { category, monthlyLimit } = req.body;

  if (!category) {
    res.status(400);
    return next(new Error('Category is required'));
  }
  if (!monthlyLimit || monthlyLimit <= 0) {
    res.status(400);
    return next(new Error('Monthly limit must be greater than 0'));
  }

  try {
    // Check if budget for category already exists for user
    const existingBudget = await Budget.findOne({ userId: req.user._id, category });
    if (existingBudget) {
      res.status(400);
      return next(new Error(`A budget for category '${category}' already exists.`));
    }

    const budget = await Budget.create({
      userId: req.user._id,
      category,
      monthlyLimit
    });

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
const updateBudget = async (req, res, next) => {
  const { category, monthlyLimit } = req.body;

  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      return next(new Error('Budget not found'));
    }

    // Check budget owner
    if (budget.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized to access this budget'));
    }

    // Validate limit if provided
    if (monthlyLimit !== undefined && monthlyLimit <= 0) {
      res.status(400);
      return next(new Error('Monthly limit must be greater than 0'));
    }

    // Check unique category duplicate if changing category name
    if (category && category !== budget.category) {
      const duplicate = await Budget.findOne({ userId: req.user._id, category });
      if (duplicate) {
        res.status(400);
        return next(new Error(`A budget for category '${category}' already exists.`));
      }
      budget.category = category;
    }

    if (monthlyLimit !== undefined) {
      budget.monthlyLimit = monthlyLimit;
    }

    const updatedBudget = await budget.save();

    res.status(200).json({
      success: true,
      data: updatedBudget
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      return next(new Error('Budget not found'));
    }

    // Check budget owner
    if (budget.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized to access this budget'));
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget successfully removed',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
