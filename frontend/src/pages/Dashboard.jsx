import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TransactionModal from '../components/TransactionModal';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Mail,
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Target,
  Activity
} from 'lucide-react';

const CATEGORIES = [
  'Salary',
  'Investments',
  'Rent/Mortgage',
  'Groceries',
  'Utilities',
  'Dining Out',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Health/Medical',
  'Education',
  'Misc'
];

const COLORS = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#84cc16', // Lime
  '#0ea5e9', // Sky
];

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Load user transactions from database
  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      if (res.data && res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setErrorMsg('Failed to load transaction history.');
    }
  };

  // Load dashboard aggregated stats from aggregation API
  const fetchStats = async () => {
    try {
      const res = await api.get('/transactions/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  // Load financial health score from health API
  const fetchHealthScore = async () => {
    try {
      const res = await api.get('/health-score');
      if (res.data && res.data.success) {
        setHealthScore(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching health score:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setStatsLoading(true);
    setHealthLoading(true);
    try {
      await Promise.all([fetchTransactions(), fetchStats(), fetchHealthScore()]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setStatsLoading(false);
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // CRUD actions handlers
  const handleModalSubmit = async (formData) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (editingTransaction) {
        // Edit flow
        const res = await api.put(`/transactions/${editingTransaction._id}`, formData);
        if (res.data && res.data.success) {
          await Promise.all([fetchTransactions(), fetchStats(), fetchHealthScore()]);
          setSuccessMsg('Transaction updated successfully!');
        }
      } else {
        // Add flow
        const res = await api.post('/transactions', formData);
        if (res.data && res.data.success) {
          await Promise.all([fetchTransactions(), fetchStats(), fetchHealthScore()]);
          setSuccessMsg('Transaction added successfully!');
        }
      }
      setIsModalOpen(false);
      setEditingTransaction(null);
    } catch (err) {
      console.error('Error saving transaction:', err);
      setErrorMsg(err.response?.data?.message || 'Error occurred while saving transaction.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTrigger = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTrigger = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this transaction?')) {
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.delete(`/transactions/${id}`);
      if (res.data && res.data.success) {
        await Promise.all([fetchTransactions(), fetchStats(), fetchHealthScore()]);
        setSuccessMsg('Transaction deleted successfully!');
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to remove transaction.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Apply filters and searches to current transactions list
  const getFilteredTransactions = () => {
    return transactions.filter((tx) => {
      // 1. Filter by description search
      const matchesSearch =
        tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Filter by transaction type
      const matchesType = filterType === 'all' || tx.type === filterType;

      // 3. Filter by category
      const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  if (loading || statsLoading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center gap-4 bg-slate-50/50">
        <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
        <span className="font-semibold text-slate-500 text-sm tracking-wide">Loading FinWise Dashboard...</span>
      </div>
    );
  }

  // Calculate savings rate
  const totalIncomeVal = stats?.summary?.totalIncome || 0;
  const totalExpensesVal = stats?.summary?.totalExpenses || 0;
  const totalSavingsVal = stats?.summary?.totalSavings || 0;
  const savingsRate = totalIncomeVal > 0 ? (totalSavingsVal / totalIncomeVal) * 100 : 0;

  // Prepare comparison data for income vs expense chart
  const comparisonData = [
    {
      name: 'Aggregates',
      Income: totalIncomeVal,
      Expense: totalExpensesVal,
    },
  ];

  // Custom tooltips for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 border border-slate-100 rounded-2xl shadow-xl">
          <p className="text-xs font-bold text-slate-400 mb-2">{label}</p>
          {payload.map((pld) => (
            <div key={pld.name} className="flex items-center gap-6 justify-between text-sm py-0.5">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pld.color || pld.fill }}></span>
                {pld.name}
              </span>
              <span className="font-bold text-slate-900">
                Rs. {pld.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CategoryTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 border border-slate-100 rounded-2xl shadow-xl">
          <p className="text-xs font-bold text-slate-400 mb-1">Expense Category</p>
          <p className="text-sm font-bold text-slate-800 mb-2">{data.category}</p>
          <div className="flex items-center justify-between gap-6 text-sm">
            <span className="text-slate-500 font-medium">Spent:</span>
            <span className="font-bold text-slate-900">
              Rs. {data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 animate-fade-in">
      
      {/* Welcome Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-brand-500/25 flex items-center justify-center bg-brand-500/5 text-brand-600 shadow-sm shrink-0">
            <User className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome aboard, {user.name}!
            </h1>
            <p className="text-slate-550 text-slate-500 text-sm md:text-base mt-1">
              Your flight path looks smooth. Manage your investments and track finances below.
            </p>
          </div>
        </div>
        
        <div>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md hover:shadow-brand-500/10 transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Global Notifications Panel */}
      {successMsg && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-emerald-800 text-sm animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-800 text-sm animate-slide-up">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Core Aggregated Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Income Card */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Income</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                Rs. {totalIncomeVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>All-time recorded earnings</span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                Rs. {totalExpensesVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-2xl">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-rose-600">
            <AlertCircle className="w-4 h-4" />
            <span>All-time recorded spending</span>
          </div>
        </div>

        {/* Total Savings Card */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Savings</p>
              <h3 className={`text-3xl font-extrabold mt-2 tracking-tight ${totalSavingsVal >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                {totalSavingsVal < 0 ? '-' : ''}Rs. {Math.abs(totalSavingsVal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          {/* Savings rate progress bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Savings Rate</span>
              <span className="text-indigo-650 text-indigo-600">{savingsRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts Group (Monthly Trend + Category spending) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Monthly Trend Area Chart (2/3 width) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Monthly Trend</h3>
            <p className="text-xs text-slate-400 mt-1">Income vs Expense flow over time</p>
          </div>
          
          <div className="h-72 mt-6">
            {!stats || !stats.monthlyTrend || stats.monthlyTrend.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                No trends available. Log transactions to view history.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" tick={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} name="Income" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} name="Expense" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Spending Donut Chart (1/3 width) */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Category Spending</h3>
            <p className="text-xs text-slate-400 mt-1">Expense distribution by category</p>
          </div>

          <div className="h-72 mt-6 flex items-center justify-center relative">
            {!stats || !stats.categorySpending || stats.categorySpending.length === 0 ? (
              <div className="text-slate-400 text-sm text-center">
                No expense category records. Log some expenses to generate analytics.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categorySpending}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {stats.categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CategoryTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Centered Donut label */}
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-extrabold text-slate-800">
                    Rs. {stats.categorySpending.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Income vs Expense comparison (Bar) + Recent Transactions + Pilot Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Income vs Expense Total Bar Chart */}
        <div className="glass-panel rounded-3xl p-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Income vs Expense</h3>
            <p className="text-xs text-slate-400 mt-1">Comparison of overall totals</p>
          </div>
          
          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`Rs. ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, '']}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}
                />
                <Legend tick={{ fontSize: 11 }} />
                <Bar dataKey="Income" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="glass-panel rounded-3xl p-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activity</h3>
            <p className="text-xs text-slate-400 mt-1">Last 5 logs in your account</p>
          </div>

          <div className="mt-4">
            {!stats || !stats.recentTransactions || stats.recentTransactions.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No recent transactions.</p>
            ) : (
              <div className="space-y-4">
                {stats.recentTransactions.map((tx) => (
                  <div key={tx._id} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-800 text-sm truncate">
                        {tx.description || <span className="text-slate-400 italic">No description</span>}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {tx.category} • {formatDate(tx.date)}
                      </span>
                    </div>
                    <span className={`font-bold text-sm shrink-0 ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {tx.type === 'income' ? '+' : '-'}Rs. {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Financial Health Score Widget */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all duration-300"></div>
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-600 animate-pulse" />
              Financial Health
            </h3>
            {healthScore && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${
                healthScore.status === 'Excellent'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : healthScore.status === 'Good'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : healthScore.status === 'Fair'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {healthScore.status}
              </span>
            )}
          </div>

          {healthLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 text-brand-500 animate-spin" />
            </div>
          ) : healthScore ? (
            <div className="space-y-6 mt-4">
              {/* Gauge and Message */}
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      className="stroke-slate-100"
                      strokeWidth="5.5"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      className={`${
                        healthScore.status === 'Excellent'
                          ? 'stroke-emerald-500'
                          : healthScore.status === 'Good'
                          ? 'stroke-indigo-500'
                          : healthScore.status === 'Fair'
                          ? 'stroke-amber-500'
                          : 'stroke-rose-500'
                      } transition-all duration-1000 ease-out`}
                      strokeWidth="5.5"
                      fill="transparent"
                      strokeDasharray={201}
                      strokeDashoffset={201 - (healthScore.score / 100) * 201}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold text-slate-800">{healthScore.score}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Score</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 leading-relaxed font-medium">
                  {healthScore.status === 'Excellent' && "Outstanding money management! You're saving well, adhering to budgets, and smashing goals."}
                  {healthScore.status === 'Good' && "Great work! You have solid control over your finances, with just minor room for tuning budgets or goals."}
                  {healthScore.status === 'Fair' && "Fair health. Consider lowering monthly expenditures or setting up small goals to build active momentum."}
                  {healthScore.status === 'Poor' && "Watch out! Your financial health is under pressure. Try to increase savings and curb category budget overruns."}
                </div>
              </div>

              {/* Metric breakdown */}
              <div className="space-y-3.5 pt-2 border-t border-slate-50">
                {/* Savings Rate */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      Savings Rate (40%)
                    </span>
                    <span className="text-slate-700 font-bold">{healthScore.breakdown.savingsRate.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${healthScore.breakdown.savingsRate.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Budget Adherence */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
                      <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
                      Budget Adherence (30%)
                    </span>
                    <span className="text-slate-700 font-bold">{healthScore.breakdown.budgetAdherence.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${healthScore.breakdown.budgetAdherence.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Goal Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
                      <Target className="w-3.5 h-3.5 text-slate-400" />
                      Goal Progress (30%)
                    </span>
                    <span className="text-slate-700 font-bold">{healthScore.breakdown.goalProgress.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${healthScore.breakdown.goalProgress.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-6 text-center">
              No health metrics data.
            </div>
          )}
        </div>
        
      </div>

      {/* Row 4: Main Interactive Log Table */}
      <div className="glass-panel rounded-3xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Interactive Ledger</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
              {filteredTransactions.length} logs
            </span>
          </div>
          
          {/* Search & Filter Options Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative max-w-xs w-full sm:w-auto">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search desc/category..."
                className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            {/* Filter Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input text-xs bg-slate-50"
            >
              <option value="all">All Types</option>
              <option value="income">Incomes</option>
              <option value="expense">Expenses</option>
            </select>

            {/* Filter Category */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input text-xs bg-slate-50 max-w-[140px]"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List Body */}
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 text-sm">No transactions match your search filters.</p>
            {transactions.length === 0 && (
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setIsModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500/10 text-brand-600 text-xs font-semibold hover:bg-brand-500/20"
              >
                <Plus className="w-4 h-4" /> Create your first log
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-[200px] truncate font-medium text-slate-800">
                      {tx.description || <span className="text-slate-400 italic">No description</span>}
                    </td>
                    <td className={`px-4 py-3.5 whitespace-nowrap text-right font-bold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-700'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}Rs. {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleEditTrigger(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrigger(tx._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-650 hover:text-red-650 hover:bg-red-50 transition-colors focus:outline-none"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pop-up Overlay Creator/Editor Form */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleModalSubmit}
        transaction={editingTransaction}
      />
    </div>
  );
};

export default Dashboard;
