const Goal = require('../models/Goal');

/**
 * @desc    Get all savings goals for user
 * @route   GET /api/goals
 * @access  Private
 */
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ targetDate: 1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new savings goal
 * @route   POST /api/goals
 * @access  Private
 */
const createGoal = async (req, res, next) => {
  const { title, targetAmount, targetDate, currentAmount } = req.body;

  if (!title) {
    res.status(400);
    return next(new Error('Title is required'));
  }
  if (!targetAmount || targetAmount <= 0) {
    res.status(400);
    return next(new Error('Target amount must be greater than 0'));
  }
  if (!targetDate) {
    res.status(400);
    return next(new Error('Target date is required'));
  }

  try {
    const initialCurrent = currentAmount !== undefined ? currentAmount : 0;
    const status = initialCurrent >= targetAmount ? 'completed' : 'active';

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      targetAmount,
      currentAmount: initialCurrent,
      targetDate,
      status
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update savings goal details or progress
 * @route   PUT /api/goals/:id
 * @access  Private
 */
const updateGoal = async (req, res, next) => {
  const { title, targetAmount, targetDate, currentAmount, status } = req.body;

  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      return next(new Error('Goal not found'));
    }

    // Check goal owner
    if (goal.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized to access this goal'));
    }

    // Apply updates
    if (title) goal.title = title;
    if (targetAmount !== undefined) {
      if (targetAmount <= 0) {
        res.status(400);
        return next(new Error('Target amount must be greater than 0'));
      }
      goal.targetAmount = targetAmount;
    }
    if (targetDate) goal.targetDate = targetDate;
    
    if (currentAmount !== undefined) {
      if (currentAmount < 0) {
        res.status(400);
        return next(new Error('Current saved amount cannot be negative'));
      }
      goal.currentAmount = currentAmount;
    }

    // Determine status
    if (status) {
      goal.status = status;
    } else if (currentAmount !== undefined || targetAmount !== undefined) {
      goal.status = goal.currentAmount >= goal.targetAmount ? 'completed' : 'active';
    }

    const updatedGoal = await goal.save();

    res.status(200).json({
      success: true,
      data: updatedGoal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a savings goal
 * @route   DELETE /api/goals/:id
 * @access  Private
 */
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      return next(new Error('Goal not found'));
    }

    // Check goal owner
    if (goal.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Not authorized to access this goal'));
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Goal successfully removed',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
};
