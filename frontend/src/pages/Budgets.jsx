import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  Sliders,
  X,
  Check
} from 'lucide-react';

const CATEGORIES = [
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

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states for creation
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newLimit, setNewLimit] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editLimitVal, setEditLimitVal] = useState('');

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/budgets');
      if (res.data && res.data.success) {
        setBudgets(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setErrorMsg('Failed to load budget tracking information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    if (!newLimit || parseFloat(newLimit) <= 0) {
      setErrorMsg('Please enter a valid monthly limit amount.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/budgets', {
        category: newCategory,
        monthlyLimit: parseFloat(newLimit)
      });

      if (res.data && res.data.success) {
        setSuccessMsg(`Budget for '${newCategory}' set successfully!`);
        setNewLimit('');
        // Re-fetch to get computed currentSpent
        await fetchBudgets();
      }
    } catch (err) {
      console.error('Error creating budget:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create budget.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartEdit = (budget) => {
    setEditingId(budget._id);
    setEditLimitVal(budget.monthlyLimit.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditLimitVal('');
  };

  const handleUpdateLimit = async (id, category) => {
    if (!editLimitVal || parseFloat(editLimitVal) <= 0) {
      setErrorMsg('Please enter a valid monthly limit amount.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put(`/budgets/${id}`, {
        monthlyLimit: parseFloat(editLimitVal)
      });

      if (res.data && res.data.success) {
        setSuccessMsg(`Limit for '${category}' updated successfully!`);
        setEditingId(null);
        setEditLimitVal('');
        await fetchBudgets();
      }
    } catch (err) {
      console.error('Error updating budget:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update budget limit.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBudget = async (id, category) => {
    if (!window.confirm(`Are you sure you want to permanently delete the budget for '${category}'?`)) {
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.delete(`/budgets/${id}`);
      if (res.data && res.data.success) {
        setSuccessMsg(`Budget for '${category}' deleted.`);
        await fetchBudgets();
      }
    } catch (err) {
      console.error('Error deleting budget:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to delete budget.');
    } finally {
      setActionLoading(false);
    }
  };

  // Find remaining budget, progress and alert warnings
  const getBudgetStatus = (budget) => {
    const limit = budget.monthlyLimit;
    const spent = budget.currentSpent;
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    const isExceeded = spent > limit;
    const isWarning = !isExceeded && pct >= 80; // 80% to 100% warning zone

    return {
      pct,
      isExceeded,
      isWarning,
      remaining: limit - spent,
      exceededAmt: spent - limit
    };
  };

  // Filter available categories for budget creation (disable categories that already have budgets)
  const getAvailableCategories = () => {
    const activeCategories = budgets.map((b) => b.category);
    return CATEGORIES.filter((c) => !activeCategories.includes(c));
  };

  const availableCategories = getAvailableCategories();

  // Find overall total budget vs total spent for this month
  const getOverallStats = () => {
    let totalLimit = 0;
    let totalSpent = 0;

    budgets.forEach((b) => {
      totalLimit += b.monthlyLimit;
      totalSpent += b.currentSpent;
    });

    const exceededBudgetsCount = budgets.filter((b) => b.currentSpent > b.monthlyLimit).length;

    return {
      totalLimit,
      totalSpent,
      exceededBudgetsCount
    };
  };

  const { totalLimit, totalSpent, exceededBudgetsCount } = getOverallStats();

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center gap-4 bg-slate-50/50">
        <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
        <span className="font-semibold text-slate-500 text-sm tracking-wide">Loading Budget Tracker...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border border-brand-500/25 flex items-center justify-center bg-brand-500/5 text-brand-600 shadow-sm shrink-0">
            <Sliders className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Budget Planner & Tracker
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1">
              Set monthly spending targets by category and prevent overspending.
            </p>
          </div>
        </div>
      </div>

      {/* Global Alerts panel */}
      {successMsg && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-emerald-850 text-sm animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span className="font-semibold text-emerald-800">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-850 text-sm animate-slide-up">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span className="font-semibold text-red-800">{errorMsg}</span>
        </div>
      )}

      {/* Overall Budget Exceeded Urgent Alert Banner */}
      {exceededBudgetsCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex items-start gap-4 text-rose-800 animate-pulse-subtle">
          <AlertTriangle className="w-6 h-6 text-rose-650 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">Budget Limit Alert</h4>
            <p className="text-sm mt-1 text-slate-650">
              You have exceeded your monthly limit in <span className="font-bold text-rose-600">{exceededBudgetsCount}</span> {exceededBudgetsCount === 1 ? 'category' : 'categories'}. Consider adjusting your limits or slowing down your spending.
            </p>
          </div>
        </div>
      )}

      {/* Core Summary statistics */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Allocated Budget</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Rs. {totalLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold block mt-3">Sum of limits across all categories</span>
          </div>

          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Spent This Month</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Rs. {totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold block mt-3">Total expenditure on budgeted items</span>
          </div>

          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Balance</p>
            <h3 className={`text-3xl font-extrabold mt-2 tracking-tight ${totalLimit - totalSpent >= 0 ? 'text-emerald-600' : 'text-rose-650 text-rose-650 text-rose-600'}`}>
              {totalLimit - totalSpent < 0 ? '-' : ''}Rs. {Math.abs(totalLimit - totalSpent).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold block mt-3">
              {totalLimit - totalSpent >= 0 ? 'Surplus remaining for this month' : 'Deficit across budget limits'}
            </span>
          </div>
        </div>
      )}

      {/* Creation and List Workspaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left column: Create Budget card */}
        <div className="glass-panel rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Create Monthly Budget</h3>
            <p className="text-xs text-slate-400 mt-1">Set spending limit for a category</p>
          </div>

          {availableCategories.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-xs font-semibold text-slate-500">
                You have active budgets for all available spending categories!
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm bg-white"
                  required
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Monthly Limit (Rs.)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm"
                  min="1"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md hover:shadow-brand-500/10 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Set Budget
              </button>
            </form>
          )}
        </div>

        {/* Right column (2/3 width): Budgets list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Active Budgets</h3>
            <span className="text-xs text-slate-400 font-semibold">{budgets.length} Category Budgets</span>
          </div>

          {budgets.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center">
              <Sliders className="w-12 h-12 text-slate-305 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-650 font-bold text-slate-800">No active budgets found</p>
              <p className="text-xs text-slate-400 mt-1">Get started by setting a monthly limit in the left panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgets.map((budget) => {
                const { pct, isExceeded, isWarning, remaining, exceededAmt } = getBudgetStatus(budget);
                const isEditing = editingId === budget._id;

                return (
                  <div
                    key={budget._id}
                    className={`glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 ${
                      isExceeded
                        ? 'border-rose-200/50 shadow-md shadow-rose-500/5'
                        : isWarning
                        ? 'border-amber-200/50 shadow-md shadow-amber-500/5'
                        : 'glass-panel-hover'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {budget.category}
                        </span>
                        {isExceeded && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                            <AlertCircle className="w-3 h-3" /> Exceeded
                          </span>
                        )}
                        {isWarning && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Near Limit
                          </span>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => handleStartEdit(budget)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Edit Budget Limit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBudget(budget._id, budget.category)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-650 hover:bg-rose-50 transition-colors"
                              title="Delete Budget"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleUpdateLimit(budget._id, budget.category)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Save changes"
                              disabled={actionLoading}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Cancel Edit"
                              disabled={actionLoading}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-black text-slate-900">
                          Rs. {budget.currentSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                        
                        {!isEditing ? (
                          <span className="text-xs text-slate-400 font-semibold">
                            of Rs. {budget.monthlyLimit.toLocaleString('en-US', { maximumFractionDigits: 0 })} limit
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 max-w-[120px]">
                            <span className="text-xs text-slate-400 font-semibold shrink-0">of Rs.</span>
                            <input
                              type="number"
                              value={editLimitVal}
                              onChange={(e) => setEditLimitVal(e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:border-brand-500"
                              min="1"
                              required
                            />
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-150 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isExceeded
                              ? 'bg-rose-500'
                              : isWarning
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        ></div>
                      </div>

                      {/* Info and warnings footer text */}
                      <div className="flex justify-between items-center text-xs font-semibold pt-1">
                        <span className="text-slate-400">{pct.toFixed(0)}% Utilized</span>
                        {isExceeded ? (
                          <span className="text-rose-600">Exceeded by Rs. {exceededAmt.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        ) : (
                          <span className="text-slate-500">Rs. {remaining.toLocaleString('en-US', { maximumFractionDigits: 0 })} remaining</span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Budgets;
