const express = require('express');
const { getReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection middleware to all report routes
router.use(protect);

router.route('/').get(getReport);

module.exports = router;
