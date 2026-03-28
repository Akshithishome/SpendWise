/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { Plus, LayoutDashboard, ArrowLeft, Trash2, Wallet, Calendar, Tag, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense, Category } from './types';

const CATEGORIES: Category[] = ['Food', 'Transport', 'Shopping', 'Bills', 'Other'];

export default function App() {
  const [view, setView] = useState<'dashboard' | 'add'>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ amount?: string; category?: string; date?: string }>({});

  // Load expenses from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('spendwise_expenses');
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse expenses', e);
      }
    }
  }, []);

  // Save expenses to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('spendwise_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const validateForm = (amount: number, category: string, date: string) => {
    const errors: { amount?: string; category?: string; date?: string } = {};
    const today = new Date().toISOString().split('T')[0];

    if (isNaN(amount) || amount <= 0) {
      errors.amount = 'Please enter a valid amount greater than zero.';
    }
    if (!category || category === 'placeholder') {
      errors.category = 'Please select a category.';
    }
    if (!date) {
      errors.date = 'Please select a date.';
    } else if (date > today) {
      errors.date = 'Date cannot be in the future.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddExpense = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));
    const category = formData.get('category') as string;
    const date = formData.get('date') as string;

    if (validateForm(amount, category, date)) {
      const newExpense = {
        id: crypto.randomUUID(),
        amount,
        category: category as Category,
        date,
      };
      setExpenses([newExpense, ...expenses]);
      setView('dashboard');
      setFormErrors({});
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = () => {
    if (deleteConfirmId) {
      setExpenses(expenses.filter(e => e.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const totalToday = expenses
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalMonth = expenses
    .filter(e => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = CATEGORIES.map(cat => ({
    category: cat,
    amount: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(ct => ct.amount > 0);

  const maxCategoryAmount = Math.max(...categoryTotals.map(ct => ct.amount), 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">SpendWise</h1>
          </div>
          {view === 'dashboard' ? (
            <button
              onClick={() => setView('add')}
              className="bg-accent hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
              id="add-expense-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          ) : (
            <button
              onClick={() => setView('dashboard')}
              className="text-slate-600 hover:text-slate-900 px-4 py-2 flex items-center gap-2 transition-colors"
              id="back-to-dashboard-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-10"
            >
              {/* Premium Summary Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-accent to-blue-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-200/50 relative overflow-hidden group">
                  <div className="relative z-10 space-y-6">
                    <div>
                      <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Monthly Spending</p>
                      <h2 className="text-5xl font-extrabold tracking-tight">₹{totalMonth.toLocaleString('en-IN')}</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                      <div>
                        <p className="text-blue-200 text-[10px] uppercase font-black tracking-widest mb-1">Today</p>
                        <p className="text-xl font-bold">₹{totalToday.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-200 text-[10px] uppercase font-black tracking-widest mb-1">Total</p>
                        <p className="text-xl font-bold opacity-90">₹{totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute -left-6 -top-6 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />
                </div>

                {/* Category Breakdown Chart */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Category Insights</h3>
                    {categoryTotals.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-slate-300 space-y-2">
                        <LayoutDashboard className="w-8 h-8 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No data available</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {categoryTotals.map(ct => (
                          <div key={ct.category} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider">
                              <span className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${getCategoryBarColor(ct.category)}`} />
                                {ct.category}
                              </span>
                              <span className="text-slate-900">₹{ct.amount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(ct.amount / maxCategoryAmount) * 100}%` }}
                                transition={{ duration: 1, ease: "circOut" }}
                                className={`h-full rounded-full ${getCategoryBarColor(ct.category)}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expense List Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Activity</h3>
                  <div className="bg-slate-100 px-3 py-1 rounded-full">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{expenses.length} Transactions</span>
                  </div>
                </div>

                {expenses.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center"
                  >
                    <div className="relative mb-6">
                      <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-slate-200 flex items-center justify-center relative z-10">
                        <Wallet className="w-10 h-10 text-slate-200" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shadow-sm">
                        <Plus className="w-4 h-4 text-accent" />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Your wallet is quiet</h4>
                    <p className="text-slate-400 text-sm max-w-[240px] mx-auto leading-relaxed">
                      Time to start tracking! Add your first expense to see your spending insights.
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid gap-4">
                    {expenses.map((expense, index) => (
                      <motion.div
                        layout
                        key={expense.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="group bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between hover:border-accent/30 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300"
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${getCategoryColor(expense.category)}`}>
                            {getCategoryIcon(expense.category)}
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 text-lg">{expense.category}</h4>
                            <div className="flex items-center gap-3">
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" />
                                {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-black text-slate-900">₹{expense.amount.toLocaleString('en-IN')}</span>
                          <button
                            onClick={() => confirmDelete(expense.id)}
                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 active:scale-90"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete Confirmation Modal */}
              <AnimatePresence>
                {deleteConfirmId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl space-y-6"
                    >
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Delete Expense?</h3>
                        <p className="text-slate-500 text-sm">This action cannot be undone. Are you sure you want to remove this transaction?</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={executeDelete}
                          className="py-4 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-100 transition-all active:scale-95"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-md mx-auto"
            >
              <div className="mb-10 space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">New Expense</h2>
                <p className="text-slate-400 font-medium">Track your spending to stay on budget.</p>
              </div>

              <form
                onSubmit={handleAddExpense}
                className="space-y-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50"
              >
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                    <IndianRupee className="w-3 h-3 text-accent" />
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      name="amount"
                      placeholder="0.00"
                      step="0.01"
                      className={`w-full px-6 py-4 bg-slate-50/50 border ${formErrors.amount ? 'border-red-200 focus:ring-red-100 focus:border-red-400' : 'border-slate-100 focus:ring-accent/10 focus:border-accent'} rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all text-2xl font-black placeholder:text-slate-200`}
                    />
                    {formErrors.amount && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 px-1">{formErrors.amount}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                    <Tag className="w-3 h-3 text-accent" />
                    Category
                  </label>
                  <div className="relative">
                    <select
                      required
                      name="category"
                      defaultValue="placeholder"
                      className={`w-full px-6 py-4 bg-slate-50/50 border ${formErrors.category ? 'border-red-200 focus:ring-red-100 focus:border-red-400' : 'border-slate-100 focus:ring-accent/10 focus:border-accent'} rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all appearance-none font-bold text-slate-700`}
                    >
                      <option value="placeholder" disabled>Select Category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Plus className="w-4 h-4 rotate-45" />
                    </div>
                    {formErrors.category && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 px-1">{formErrors.category}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                    <Calendar className="w-3 h-3 text-accent" />
                    Transaction Date
                  </label>
                  <input
                    required
                    type="date"
                    name="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className={`w-full px-6 py-4 bg-slate-50/50 border ${formErrors.date ? 'border-red-200 focus:ring-red-100 focus:border-red-400' : 'border-slate-100 focus:ring-accent/10 focus:border-accent'} rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all font-bold text-slate-700`}
                  />
                  {formErrors.date && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 px-1">{formErrors.date}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-[0.97] mt-4 flex items-center justify-center gap-2"
                >
                  <span>Confirm Expense</span>
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function getCategoryIcon(category: Category) {
  switch (category) {
    case 'Food': return <span className="text-xl">🍔</span>;
    case 'Transport': return <span className="text-xl">🚗</span>;
    case 'Shopping': return <span className="text-xl">🛍️</span>;
    case 'Bills': return <span className="text-xl">📄</span>;
    case 'Other': return <span className="text-xl">✨</span>;
  }
}

function getCategoryBarColor(category: Category) {
  switch (category) {
    case 'Food': return 'bg-orange-500';
    case 'Transport': return 'bg-blue-500';
    case 'Shopping': return 'bg-purple-500';
    case 'Bills': return 'bg-red-500';
    case 'Other': return 'bg-slate-500';
  }
}

function getCategoryColor(category: Category) {
  switch (category) {
    case 'Food': return 'bg-orange-50 text-orange-600';
    case 'Transport': return 'bg-blue-50 text-blue-600';
    case 'Shopping': return 'bg-purple-50 text-purple-600';
    case 'Bills': return 'bg-red-50 text-red-600';
    case 'Other': return 'bg-slate-50 text-slate-600';
  }
}
