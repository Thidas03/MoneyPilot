const express = require('express');
const { getHealthScore } = require('../controllers/healthController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection middleware to all health routes
router.use(protect);

router.route('/').get(getHealthScore);

module.exports = router;
