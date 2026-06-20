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

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
