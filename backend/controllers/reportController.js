const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

/**
 * @desc    Get aggregated financial report
 * @route   GET /api/reports
 * @access  Private
 */
const getReport = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const period = req.query.period || 'monthly';
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    let start, end;

    if (period === 'monthly') {
      const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      // yearly
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31, 23, 59, 59, 999);
    }

    // 1. Calculate Summary (Total Income, Total Expenses)
    const summaryData = await Transaction.aggregate([
      { 
        $match: { 
          userId, 
          date: { $gte: start, $lte: end } 
        } 
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
        }
      }
    ]);

    const totalIncome = summaryData.length > 0 ? summaryData[0].totalIncome : 0;
    const totalExpenses = summaryData.length > 0 ? summaryData[0].totalExpenses : 0;
    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

    // 2. Category Analysis (aggregated sums by category & type)
    const categoryAnalysis = await Transaction.aggregate([
      { 
        $match: { 
          userId, 
          date: { $gte: start, $lte: end } 
        } 
      },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          amount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          category: '$_id.category',
          type: '$_id.type',
          amount: 1,
          _id: 0
        }
      },
      { $sort: { amount: -1 } }
    ]);

    const incomeCategories = categoryAnalysis.filter(c => c.type === 'income');
    const expenseCategories = categoryAnalysis.filter(c => c.type === 'expense');

    // 3. Fetch detailed transaction list matching range
    const transactions = await Transaction.find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          totalSavings,
          savingsRate: Math.round(savingsRate * 100) / 100
        },
        categoryAnalysis: {
          income: incomeCategories,
          expense: expenseCategories
        },
        transactions
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReport
};
