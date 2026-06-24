require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const healthRoutes = require('./routes/healthRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Initialize database connection
connectDB();

const app = express();

// Disable ETags to prevent 304 Not Modified status codes
app.disable('etag');

// Standard middlewares
app.use(cors());
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MoneyPilot API server - Auth Service Active',
    status: 'healthy',
  });
});

// Route mountings helper to support both local development (/api/...) and Vercel prefix-stripped deployments (/...)
const mountRoutes = (routerPath, routeHandler) => {
  app.use(`/api/${routerPath}`, routeHandler);
  app.use(`/${routerPath}`, routeHandler);
};

mountRoutes('auth', authRoutes);
mountRoutes('transactions', transactionRoutes);
mountRoutes('budgets', budgetRoutes);
mountRoutes('goals', goalRoutes);
mountRoutes('health-score', healthRoutes);
mountRoutes('reports', reportRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

let server;

// Only listen if not running in serverless Vercel environment
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
  });
}

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process if server exists
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

module.exports = app;
