const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');

/**
 * @desc    Get all transactions for the logged in user
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  try {
    // Find transactions belonging to logged-in user, sort by date desc
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Check transaction owner
    if (transaction.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this transaction');
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { type, amount, category, description, date } = req.body;

  try {
    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount,
      category,
      description,
      date: date || undefined, // falls back to schema default (Date.now) if empty
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { type, amount, category, description, date } = req.body;

  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Check transaction owner
    if (transaction.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to modify this transaction');
    }

    // Perform updates
    transaction.type = type || transaction.type;
    transaction.amount = amount !== undefined ? amount : transaction.amount;
    transaction.category = category || transaction.category;
    transaction.description = description !== undefined ? description : transaction.description;
    transaction.date = date || transaction.date;

    const updatedTransaction = await transaction.save();

    res.status(200).json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Check transaction owner
    if (transaction.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this transaction');
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction successfully removed',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get transaction aggregations/statistics
 * @route   GET /api/transactions/stats
 * @access  Private
 */
const getTransactionStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Core aggregates (Total Income, Total Expense)
    const summaryPromise = Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
        },
      },
    ]);

    // 2. Category spending breakdown (Expenses only, sorted desc)
    const categorySpendingPromise = Transaction.aggregate([
      { $match: { userId, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
        },
      },
      { $project: { category: '$_id', amount: 1, _id: 0 } },
      { $sort: { amount: -1 } },
    ]);

    // 3. Monthly Trend (Income vs Expense grouped by month)
    const monthlyTrendPromise = Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 4. Fetch recent transactions (limit 5)
    const recentTransactionsPromise = Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    // Run aggregations in parallel
    const [summary, categorySpending, monthlyTrend, recentTransactions] = await Promise.all([
      summaryPromise,
      categorySpendingPromise,
      monthlyTrendPromise,
      recentTransactionsPromise,
    ]);

    const totalIncome = summary.length > 0 ? summary[0].totalIncome : 0;
    const totalExpenses = summary.length > 0 ? summary[0].totalExpenses : 0;
    const totalSavings = totalIncome - totalExpenses;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrend = monthlyTrend.map((item) => {
      const monthIdx = item._id.month - 1;
      const yearShort = item._id.year.toString().slice(-2);
      return {
        name: `${monthNames[monthIdx]} '${yearShort}`,
        income: item.income,
        expense: item.expense,
        savings: item.income - item.expense,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          totalSavings,
        },
        categorySpending,
        monthlyTrend: formattedTrend,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
};
