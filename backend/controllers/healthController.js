const { calculateHealthScore } = require('../services/healthScoreService');

/**
 * @desc    Get user's financial health score
 * @route   GET /api/health-score
 * @access  Private
 */
const getHealthScore = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const healthData = await calculateHealthScore(userId);

    res.status(200).json({
      success: true,
      data: healthData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealthScore
};
