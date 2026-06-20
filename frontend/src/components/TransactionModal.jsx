import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';

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

const TransactionModal = ({ isOpen, onClose, onSubmit, transaction = null }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});

  // Reset/populate form when modal opens or transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description || '',
        date: new Date(transaction.date).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [transaction, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.category) {
      newErrors.category = 'Category selection is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert amount to numeric type
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/40 backdrop-blur-sm animate-fade-in">
      {/* Modal Dialog Body */}
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-slide-up">
        {/* Glow corner */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-slate-800 p-1 rounded-lg transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Transaction Type Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`py-3 px-4 rounded-xl text-sm font-semibold tracking-wide border transition-all ${
                formData.type === 'expense'
                  ? 'bg-red-50 border-red-500/30 text-red-600 font-bold'
                  : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100/50'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`py-3 px-4 rounded-xl text-sm font-semibold tracking-wide border transition-all ${
                formData.type === 'income'
                  ? 'bg-emerald-50 border-emerald-500/30 text-emerald-600 font-bold'
                  : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100/50'
              }`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
                Amount (Rs.)
              </label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${
                  errors.amount ? 'border-red-350 focus:border-red-500' : ''
                }`}
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${
                    errors.date ? 'border-red-350 focus:border-red-500' : ''
                  }`}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${
                errors.category ? 'border-red-350 focus:border-red-500' : ''
              }`}
            >
              <option value="" disabled>Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-white text-slate-800">
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Grocery Shopping at Target"
              maxLength="100"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-100 active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 active:scale-[0.98] transition-all"
            >
              {transaction ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
