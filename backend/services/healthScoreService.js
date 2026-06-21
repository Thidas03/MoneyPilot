const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

/**
 * Calculates the financial health score for a given user.
 * @param {string} userId - User Object ID string.
 * @returns {Promise<object>} Financial Health Score analysis.
 */
const calculateHealthScore = async (userId) => {
  // 1. Calculate Savings Rate (40%)
  const transactions = await Transaction.find({ userId });
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
    }
  });

  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;
  const savingsRateScore = Math.max(0, Math.min(savingsRate * 100, 100));

  // 2. Calculate Budget Adherence (30%)
  const budgets = await Budget.find({ userId });
  let budgetAdherenceScore = 100; // Default to 100 if user has not set budgets
  const budgetDetails = [];

  if (budgets.length > 0) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const currentMonthExpenses = await Transaction.find({
      userId,
      type: 'expense',
      date: { $gte: startOfMonth },
    });

    const categorySpending = {};
    currentMonthExpenses.forEach((tx) => {
      categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
    });

    let totalAdherence = 0;
    budgets.forEach((budget) => {
      const spending = categorySpending[budget.category] || 0;
      let adherence = 100;

      if (spending > budget.monthlyLimit) {
        adherence = Math.max(
          0,
          100 - ((spending - budget.monthlyLimit) / budget.monthlyLimit) * 100
        );
      }

      totalAdherence += adherence;
      budgetDetails.push({
        category: budget.category,
        monthlyLimit: budget.monthlyLimit,
        spending,
        adherence: Math.round(adherence),
      });
    });

    budgetAdherenceScore = totalAdherence / budgets.length;
  }

  // 3. Calculate Goal Progress (30%)
  const goals = await Goal.find({ userId });
  let goalProgressScore = 100; // Default to 100 if user has no goals
  const goalDetails = [];

  if (goals.length > 0) {
    let totalProgress = 0;
    goals.forEach((goal) => {
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      const progressCapped = Math.max(0, Math.min(progress, 100));
      totalProgress += progressCapped;

      goalDetails.push({
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        progress: Math.round(progressCapped),
      });
    });

    goalProgressScore = totalProgress / goals.length;
  }

  // Final Health Score calculation (Weighted Sum)
  const score = Math.round(
    savingsRateScore * 0.4 + budgetAdherenceScore * 0.3 + goalProgressScore * 0.3
  );

  // Status Labels: Poor (< 50), Fair (50-69), Good (70-84), Excellent (85+)
  let status = 'Poor';
  if (score >= 85) {
    status = 'Excellent';
  } else if (score >= 70) {
    status = 'Good';
  } else if (score >= 50) {
    status = 'Fair';
  }

  return {
    score,
    status,
    breakdown: {
      savingsRate: {
        score: Math.round(savingsRateScore),
        rate: Math.round(savingsRate * 100),
        weight: 0.4,
        totalIncome,
        totalExpense,
      },
      budgetAdherence: {
        score: Math.round(budgetAdherenceScore),
        weight: 0.3,
        budgetsCount: budgets.length,
        details: budgetDetails,
      },
      goalProgress: {
        score: Math.round(goalProgressScore),
        weight: 0.3,
        goalsCount: goals.length,
        details: goalDetails,
      },
    },
  };
};

module.exports = {
  calculateHealthScore,
};
