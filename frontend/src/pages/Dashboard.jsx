import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TransactionModal from '../components/TransactionModal';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  User, 
  Mail, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp
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

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const res = await api.get('/transactions');
      if (res.data && res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setErrorMsg('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
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
          setTransactions(
            transactions.map((tx) => (tx._id === editingTransaction._id ? res.data.data : tx))
          );
          setSuccessMsg('Transaction updated successfully!');
        }
      } else {
        // Add flow
        const res = await api.post('/transactions', formData);
        if (res.data && res.data.success) {
          setTransactions([res.data.data, ...transactions]);
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
        setTransactions(transactions.filter((tx) => tx._id !== id));
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

  // Perform dynamic financial analytics based on real transaction data
  const calculateAnalytics = () => {
    let totalIncome = 0;
    let totalExpense = 0;
    let currentMonthExpense = 0;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    transactions.forEach((tx) => {
      const amount = tx.amount;
      const txDate = new Date(tx.date);

      if (tx.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
        
        // Match current month for Monthly Expenses stat
        if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
          currentMonthExpense += amount;
        }
      }
    });

    const netWorth = totalIncome - totalExpense;

    return {
      netWorth,
      totalIncome,
      totalExpense,
      currentMonthExpense,
    };
  };

  const { netWorth, totalIncome, totalExpense, currentMonthExpense } = calculateAnalytics();

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 animate-fade-in">
      {/* Welcome Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-brand-500/30 flex items-center justify-center bg-brand-500/10 text-brand-400 shadow-lg shrink-0">
            <User className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Welcome aboard, {user.name}!
            </h1>
            <p className="text-dark-400 text-sm md:text-base mt-1">
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
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Global Notifications Panel */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-brand-500/20 rounded-2xl p-4 flex items-start gap-3 text-emerald-200 text-sm animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
          <span className="font-semibold text-white">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-200 text-sm animate-slide-up">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span className="font-semibold text-white">{errorMsg}</span>
        </div>
      )}

      {/* Grid containing Financial Metrics and Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Stats & Interactive Transaction Logs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Dynamic Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Balance Card */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all duration-300"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-dark-400 uppercase tracking-wider">Total Net Worth</p>
                  <h3 className={`text-3xl font-extrabold mt-2 tracking-tight ${netWorth >= 0 ? 'text-white' : 'text-red-400'}`}>
                    {netWorth < 0 ? '-' : ''}Rs. {Math.abs(netWorth).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-brand-400">
                <TrendingUp className="w-4 h-4" />
                <span>Computed from active accounts</span>
              </div>
            </div>

            {/* Expenses Card */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all duration-300"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-dark-400 uppercase tracking-wider">Monthly Expenses</p>
                  <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                    Rs. {currentMonthExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl">
                  <ArrowDownRight className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-dark-400">
                <ArrowDownRight className="w-4 h-4 text-red-400" />
                <span>Spent during this calendar month</span>
              </div>
            </div>
          </div>

          {/* Search, Filter controls, and Transaction Log */}
          <div className="glass-panel rounded-3xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Transaction Log</h3>
              
              {/* Search & Filter Options Row */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative max-w-xs w-full sm:w-auto">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-500">
                    <Search className="w-4 h-4 text-dark-400" />
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
                  className="px-3 py-2 rounded-xl glass-input text-xs bg-dark-900"
                >
                  <option value="all">All Types</option>
                  <option value="income">Incomes</option>
                  <option value="expense">Expenses</option>
                </select>

                {/* Filter Category */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl glass-input text-xs bg-dark-900 max-w-[120px]"
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
            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <RefreshCw className="w-8 h-8 text-brand-400 animate-spin" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-dark-400 text-sm">No transactions match your search filters.</p>
                {transactions.length === 0 && (
                  <button
                    onClick={() => {
                      setEditingTransaction(null);
                      setIsModalOpen(true);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500/10 text-brand-400 text-xs font-semibold hover:bg-brand-500/20"
                  >
                    <Plus className="w-4 h-4" /> Create your first log
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-dark-400 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-dark-200">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-dark-400">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white border border-white/10">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 max-w-[200px] truncate font-medium text-white">
                          {tx.description || <span className="text-dark-500 italic">No description</span>}
                        </td>
                        <td className={`px-4 py-3.5 whitespace-nowrap text-right font-bold ${
                          tx.type === 'income' ? 'text-brand-400' : 'text-white'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}Rs. {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => handleEditTrigger(tx)}
                              className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTrigger(tx._id)}
                              className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none"
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

        </div>

        {/* Right Sidebar: Profile details */}
        <div className="space-y-6">
          <div className="glass-panel glass-panel-hover rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 pb-3 border-b border-white/5">
              <User className="w-5 h-5 text-brand-400" />
              Pilot Profile
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-center py-2">
                <div className="w-24 h-24 rounded-full border-2 border-brand-500/20 flex items-center justify-center bg-brand-500/5 text-brand-400 shadow-inner">
                  <User className="w-10 h-10" />
                </div>
              </div>

              {/* Display fields */}
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-dark-400 uppercase tracking-wider block">Pilot ID</span>
                  <span className="font-mono text-xs text-dark-200 font-semibold">{user._id}</span>
                </div>
                <div>
                  <span className="text-xs text-dark-400 uppercase tracking-wider block">Full Name</span>
                  <span className="text-white font-medium">{user.name}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-dark-400 shrink-0" />
                  <div>
                    <span className="text-xs text-dark-400 uppercase tracking-wider block">Email Address</span>
                    <span className="text-white font-medium">{user.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-dark-400 shrink-0" />
                  <div>
                    <span className="text-xs text-dark-400 uppercase tracking-wider block">Registered At</span>
                    <span className="text-white font-medium">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
