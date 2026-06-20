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
  Calendar,
  Check,
  X,
  Target,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Creation form states
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');

  // Add savings amount state (per goal)
  const [addFundsId, setAddFundsId] = useState(null);
  const [fundsVal, setFundsVal] = useState('');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/goals');
      if (res.data && res.data.success) {
        setGoals(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
      setErrorMsg('Failed to load savings goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a goal title.');
      return;
    }
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      setErrorMsg('Target amount must be greater than 0.');
      return;
    }
    if (!targetDate) {
      setErrorMsg('Please select a target completion date.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/goals', {
        title: title.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        targetDate
      });

      if (res.data && res.data.success) {
        setSuccessMsg(`Goal '${title}' created successfully!`);
        setTitle('');
        setTargetAmount('');
        setCurrentAmount('');
        setTargetDate('');
        await fetchGoals();
      }
    } catch (err) {
      console.error('Error creating goal:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create savings goal.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartEdit = (goal) => {
    setEditingId(goal._id);
    setEditTitle(goal.title);
    setEditTargetAmount(goal.targetAmount.toString());
    setEditTargetDate(goal.targetDate.split('T')[0]);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditTargetAmount('');
    setEditTargetDate('');
  };

  const handleUpdateGoalDetails = async (id) => {
    if (!editTitle.trim()) {
      setErrorMsg('Please enter a goal title.');
      return;
    }
    if (!editTargetAmount || parseFloat(editTargetAmount) <= 0) {
      setErrorMsg('Target amount must be greater than 0.');
      return;
    }
    if (!editTargetDate) {
      setErrorMsg('Please select a target completion date.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put(`/goals/${id}`, {
        title: editTitle.trim(),
        targetAmount: parseFloat(editTargetAmount),
        targetDate: editTargetDate
      });

      if (res.data && res.data.success) {
        setSuccessMsg('Goal details updated successfully!');
        setEditingId(null);
        await fetchGoals();
      }
    } catch (err) {
      console.error('Error updating goal:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update goal details.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddFunds = async (goal) => {
    if (!fundsVal || parseFloat(fundsVal) <= 0) {
      setErrorMsg('Please enter a valid savings contribution.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const newAmount = goal.currentAmount + parseFloat(fundsVal);

    try {
      const res = await api.put(`/goals/${goal._id}`, {
        currentAmount: newAmount
      });

      if (res.data && res.data.success) {
        setSuccessMsg(`Added Rs. ${parseFloat(fundsVal).toLocaleString()} to '${goal.title}'!`);
        setAddFundsId(null);
        setFundsVal('');
        await fetchGoals();
      }
    } catch (err) {
      console.error('Error contributing funds:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update savings progress.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (goal) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const newStatus = goal.status === 'completed' ? 'active' : 'completed';
    // If marking active but current saved >= target, reset current saved to trigger progress bar properly, or keep it. Let's just toggle status.
    // If marking completed, update currentAmount to match targetAmount if it's currently lower
    const updates = { status: newStatus };
    if (newStatus === 'completed' && goal.currentAmount < goal.targetAmount) {
      updates.currentAmount = goal.targetAmount;
    }

    try {
      const res = await api.put(`/goals/${goal._id}`, updates);

      if (res.data && res.data.success) {
        setSuccessMsg(`Goal '${goal.title}' marked as ${newStatus}!`);
        await fetchGoals();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setErrorMsg('Failed to update goal completion status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGoal = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete the goal '${title}'?`)) {
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.delete(`/goals/${id}`);
      if (res.data && res.data.success) {
        setSuccessMsg(`Goal '${title}' removed successfully.`);
        await fetchGoals();
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
      setErrorMsg('Failed to remove savings goal.');
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

  const getDaysRemaining = (targetDateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateString);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Aggregated analytics
  const getGoalsMetrics = () => {
    let totalTarget = 0;
    let totalSaved = 0;
    let completedCount = 0;

    goals.forEach((g) => {
      totalTarget += g.targetAmount;
      totalSaved += g.currentAmount;
      if (g.status === 'completed') {
        completedCount++;
      }
    });

    const completionRate = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
      totalTarget,
      totalSaved,
      completedCount,
      completionRate
    };
  };

  const { totalTarget, totalSaved, completedCount, completionRate } = getGoalsMetrics();

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center gap-4 bg-slate-50/50">
        <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
        <span className="font-semibold text-slate-500 text-sm tracking-wide">Loading Savings Goals...</span>
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
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Financial Goals & Savings Targets
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1">
              Visualize, define, and conquer your savings milestones.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Aggregate Overview Metrics Card */}
      {goals.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Targets Value</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                Rs. {totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Amount Saved</span>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">
                Rs. {totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Goals Achieved</span>
              <h3 className="text-3xl font-extrabold text-indigo-600 mt-1">
                {completedCount} / {goals.length}
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-650">
              <span className="text-slate-500 font-semibold">Cumulative Progress</span>
              <span className="text-brand-600">{completionRate.toFixed(1)}% Achieved</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-brand-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Action modules Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Create Form */}
        <div className="glass-panel rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Create Savings Goal</h3>
            <p className="text-xs text-slate-400 mt-1">Configure target and deadline</p>
          </div>

          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Goal Title</label>
              <input
                type="text"
                placeholder="e.g. Dream Vacation Fund"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm"
                required
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Amount (Rs.)</label>
              <input
                type="number"
                placeholder="e.g. 100000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm"
                min="0.01"
                required
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Initial Savings (Rs.)</label>
              <input
                type="number"
                placeholder="e.g. 5000 (Optional)"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm"
                min="0"
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl glass-input text-sm bg-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md hover:shadow-brand-500/10 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Goal
            </button>
          </form>
        </div>

        {/* Right Column (2/3 width): Goals list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Active & Completed Goals</h3>
            <span className="text-xs text-slate-400 font-semibold">{goals.length} Registered Goals</span>
          </div>

          {goals.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-800 font-bold">No savings goals yet</p>
              <p className="text-xs text-slate-400 mt-1">Get started by defining your first target in the left panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => {
                const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 105 : 0;
                const progressPct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                const isCompleted = goal.status === 'completed';
                const daysLeft = getDaysRemaining(goal.targetDate);
                const isEditing = editingId === goal._id;
                const isContributing = addFundsId === goal._id;

                return (
                  <div
                    key={goal._id}
                    className={`glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 ${
                      isCompleted
                        ? 'border-emerald-250 bg-emerald-50/20 border-emerald-200/50 shadow-md shadow-emerald-500/5'
                        : 'glass-panel-hover'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="px-2 py-1 border border-slate-200 rounded-lg text-sm font-bold w-full focus:outline-none"
                            required
                          />
                        ) : (
                          <h4 className="font-extrabold text-slate-900 truncate text-base leading-tight">
                            {goal.title}
                          </h4>
                        )}
                        
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>
                            {isCompleted ? 'Completed' : 'Active'}
                          </span>

                          {!isCompleted && daysLeft >= 0 && (
                            <span className="text-[10px] font-bold text-slate-400">
                              {daysLeft} days remaining
                            </span>
                          )}

                          {!isCompleted && daysLeft < 0 && (
                            <span className="text-[10px] font-bold text-rose-500 animate-pulse">
                              Past due by {Math.abs(daysLeft)} days
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Top Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => handleToggleStatus(goal)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isCompleted
                                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border-slate-100'
                              }`}
                              title={isCompleted ? "Re-open Goal" : "Mark Goal Completed"}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStartEdit(goal)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Edit Goal"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteGoal(goal._id, goal.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-650 hover:bg-rose-50 transition-colors"
                              title="Delete Goal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleUpdateGoalDetails(goal._id)}
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

                    {/* Progress parameters */}
                    <div className="mt-5 space-y-3.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-black text-slate-800">
                          Rs. {goal.currentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                        
                        {!isEditing ? (
                          <span className="text-xs text-slate-400 font-semibold">
                            of Rs. {goal.targetAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 max-w-[120px]">
                            <span className="text-xs text-slate-400 font-semibold shrink-0">of Rs.</span>
                            <input
                              type="number"
                              value={editTargetAmount}
                              onChange={(e) => setEditTargetAmount(e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:border-brand-500"
                              min="0.01"
                              required
                            />
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-brand-500'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-xs font-semibold text-slate-400 pt-0.5">
                        <span>{progressPct.toFixed(0)}% Saved</span>
                        
                        {isCompleted ? (
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            <Sparkles className="w-3.5 h-3.5" /> Goal Achieved!
                          </span>
                        ) : (
                          <span>Rs. {(goal.targetAmount - goal.currentAmount).toLocaleString('en-US', { maximumFractionDigits: 0 })} left</span>
                        )}
                      </div>

                      {/* Date display & Edit Date inline */}
                      <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-slate-400 border-t border-slate-50">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Target: {isEditing ? (
                            <input
                              type="date"
                              value={editTargetDate}
                              onChange={(e) => setEditTargetDate(e.target.value)}
                              className="px-1 py-0.5 border border-slate-200 rounded text-[10px] focus:outline-none"
                              required
                            />
                          ) : (
                            formatDate(goal.targetDate)
                          )}
                        </span>
                      </div>

                      {/* Contribute / Add savings progress panel */}
                      {!isCompleted && (
                        <div className="pt-2">
                          {!isContributing ? (
                            <button
                              onClick={() => {
                                setAddFundsId(goal._id);
                                setFundsVal('');
                              }}
                              className="w-full text-center border border-dashed border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-450 hover:border-slate-400 py-1.5 rounded-xl text-xs font-semibold transition-all"
                            >
                              + Add Savings Contribution
                            </button>
                          ) : (
                            <div className="flex gap-2 items-center animate-slide-up">
                              <input
                                type="number"
                                placeholder="Contribution (Rs.)"
                                value={fundsVal}
                                onChange={(e) => setFundsVal(e.target.value)}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
                                min="0.01"
                                autoFocus
                              />
                              <button
                                onClick={() => handleAddFunds(goal)}
                                className="p-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors text-xs font-bold"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setAddFundsId(null)}
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors text-xs font-bold"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

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

export default Goals;
