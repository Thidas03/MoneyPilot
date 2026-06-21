import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
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
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  AlertCircle,
  PiggyBank,
  Percent
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logoImg from '../assets/logo.png';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
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

const Reports = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Filters state
  const [filterPeriod, setFilterPeriod] = useState('monthly');
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState(currentMonth);

  // Data state
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {
        period: filterPeriod,
        year: filterYear,
        month: filterPeriod === 'monthly' ? filterMonth : undefined
      };
      
      const res = await api.get('/reports', { params });
      if (res.data && res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setErrorMsg('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filterPeriod, filterYear, filterMonth]);

  const getMonthName = (mVal) => {
    const found = MONTHS.find(m => m.value === parseInt(mVal));
    return found ? found.label : 'N/A';
  };

  // PDF Exporter
  const handleExportPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();

    const logo = new Image();
    logo.src = logoImg;
    logo.onload = () => {
      // Document header branding
      doc.addImage(logo, 'PNG', 14, 15, 12, 12);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("MoneyPilot Financial Report", 30, 24);

      // Metadata details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      const periodString = filterPeriod === 'monthly' 
        ? `${getMonthName(filterMonth)} ${filterYear}`
        : `Year ${filterYear}`;
      doc.text(`Report Period: ${periodString}`, 30, 30);
      doc.text(`Generated At: ${new Date().toLocaleString()}`, 30, 36);

      // Section 1: Executive Summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("Executive Summary", 14, 46);

      autoTable(doc, {
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
          ['Total Income', `Rs. ${reportData.summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
          ['Total Expenses', `Rs. ${reportData.summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
          ['Net Savings', `Rs. ${reportData.summary.totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
          ['Savings Rate', `${reportData.summary.savingsRate}%`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] }, // Emerald header
        columnStyles: {
          0: { fontStyle: 'bold' }
        }
      });

      let currentY = doc.lastAutoTable.finalY + 12;

      // Section 2: Expense Category Breakdown
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text("Category Breakdown (Expenses)", 14, currentY);

      const expenseCategoriesBody = reportData.categoryAnalysis.expense.map(c => [
        c.category,
        `Rs. ${c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        `${reportData.summary.totalExpenses > 0 ? ((c.amount / reportData.summary.totalExpenses) * 100).toFixed(1) : 0}%`
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Category', 'Amount Spent', 'Percentage']],
        body: expenseCategoriesBody.length > 0 ? expenseCategoriesBody : [['No expenses recorded', '-', '-']],
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] } // Indigo header
      });

      currentY = doc.lastAutoTable.finalY + 12;

      // Section 3: Ledger Transactions list
      // Check if we need to add a page to print the table clean
      if (currentY > 220) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("Transaction Ledger", 14, currentY);

      const txBody = reportData.transactions.map(tx => [
        new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        tx.type.toUpperCase(),
        tx.category,
        tx.description || '-',
        `Rs. ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
        body: txBody.length > 0 ? txBody : [['No transactions matching date criteria', '-', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [100, 116, 139] } // Slate header
      });

      doc.save(`MoneyPilot_Report_${filterPeriod}_${filterYear}_${filterMonth}.pdf`);
    };
  };

  // Excel Exporter
  const handleExportExcel = () => {
    if (!reportData) return;
    const wb = XLSX.utils.book_new();

    const periodString = filterPeriod === 'monthly' 
      ? `${getMonthName(filterMonth)} ${filterYear}`
      : `Year ${filterYear}`;

    // 1. Prepare Summary Sheet data
    const summaryRows = [
      ['MoneyPilot Financial Report Summary'],
      ['Period', periodString],
      ['Generated At', new Date().toLocaleString()],
      [],
      ['Metric', 'Value'],
      ['Total Income', reportData.summary.totalIncome],
      ['Total Expenses', reportData.summary.totalExpenses],
      ['Net Savings', reportData.summary.totalSavings],
      ['Savings Rate (%)', reportData.summary.savingsRate],
      [],
      ['Category Breakdown (Expenses)'],
      ['Category', 'Amount Spent']
    ];

    reportData.categoryAnalysis.expense.forEach(c => {
      summaryRows.push([c.category, c.amount]);
    });

    if (reportData.categoryAnalysis.income.length > 0) {
      summaryRows.push([], ['Category Breakdown (Incomes)'], ['Category', 'Amount Earned']);
      reportData.categoryAnalysis.income.forEach(c => {
        summaryRows.push([c.category, c.amount]);
      });
    }

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // 2. Prepare Ledger Sheet data
    const ledgerHeaders = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const ledgerRows = reportData.transactions.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.type,
      tx.category,
      tx.description || '',
      tx.amount
    ]);

    const wsLedger = XLSX.utils.aoa_to_sheet([ledgerHeaders, ...ledgerRows]);
    XLSX.utils.book_append_sheet(wb, wsLedger, 'Transaction Ledger');

    // Write file
    XLSX.writeFile(wb, `MoneyPilot_Report_${filterPeriod}_${filterYear}_${filterMonth}.xlsx`);
  };

  // Custom tooltips for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 border border-slate-100 rounded-2xl shadow-xl">
          <p className="text-xs font-bold text-slate-400 mb-1">Category Details</p>
          <p className="text-sm font-bold text-slate-800 mb-2">{data.category}</p>
          <div className="flex items-center justify-between gap-6 text-sm">
            <span className="text-slate-500 font-medium">Total Amount:</span>
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
      
      {/* Upper Title and Filtering Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -z-10"></div>
        
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-brand-600 shrink-0" />
            Financial Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Aggregate transactions, visualize categories, and export detailed sheets.
          </p>
        </div>

        {/* Filter Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector */}
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold bg-white"
          >
            <option value="monthly">Monthly Report</option>
            <option value="yearly">Yearly Report</option>
          </select>

          {/* Month Selector (Monthly Period Only) */}
          {filterPeriod === 'monthly' && (
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(parseInt(e.target.value))}
              className="px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold bg-white"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          )}

          {/* Year Selector */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
            className="px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold bg-white"
          >
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>

          {/* Manual Refresh Action */}
          <button
            onClick={fetchReport}
            className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors text-slate-550 active:scale-95"
            title="Refresh Report Data"
          >
            <RefreshCw className="w-4 h-4 text-slate-550" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-800 text-sm animate-slide-up">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
          <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
          <span className="font-semibold text-slate-500 text-sm">Aggregating Report Data...</span>
        </div>
      ) : reportData ? (
        <>
          {/* Executive Stats Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Income */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Income</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                    Rs. {reportData.summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Expenses</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                    Rs. {reportData.summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Net Savings */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Savings</p>
                  <h3 className={`text-2xl font-extrabold mt-2 tracking-tight ${reportData.summary.totalSavings >= 0 ? 'text-slate-900' : 'text-rose-650 text-rose-600'}`}>
                    {reportData.summary.totalSavings < 0 ? '-' : ''}Rs. {Math.abs(reportData.summary.totalSavings).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl">
                  <PiggyBank className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Savings Rate */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Savings Rate</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                    {reportData.summary.savingsRate.toFixed(1)}%
                  </h3>
                </div>
                <div className="p-2.5 bg-sky-500/10 text-sky-600 rounded-xl">
                  <Percent className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-3.5">
                <div
                  className="bg-sky-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(reportData.summary.savingsRate, 0), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Charts Visual Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Expenses Breakdown */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Category Spend Analysis</h3>
                <p className="text-xs text-slate-400 mt-1">Detailed allocation of expense categories</p>
              </div>

              <div className="h-72 mt-6 flex items-center justify-center relative">
                {reportData.categoryAnalysis.expense.length === 0 ? (
                  <div className="text-slate-400 text-sm text-center">
                    No expense data recorded in this period.
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.categoryAnalysis.expense}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={4}
                        >
                          {reportData.categoryAnalysis.expense.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Middle Donut text */}
                    <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-extrabold text-slate-800">
                        Rs. {reportData.summary.totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Expense</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Category Incomes Breakdown */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Category Income Analysis</h3>
                <p className="text-xs text-slate-400 mt-1">Distribution of active income categories</p>
              </div>

              <div className="h-72 mt-6 flex items-center justify-center relative">
                {reportData.categoryAnalysis.income.length === 0 ? (
                  <div className="text-slate-400 text-sm text-center">
                    No income data recorded in this period.
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.categoryAnalysis.income}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={4}
                        >
                          {reportData.categoryAnalysis.income.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Middle Donut text */}
                    <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-extrabold text-slate-800">
                        Rs. {reportData.summary.totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Income</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Transactions Ledger and Exporters */}
          <div className="glass-panel rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Report Ledger Logs</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                  {reportData.transactions.length} records
                </span>
              </div>

              {/* PDF & Excel Export triggers */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all active:scale-[0.98]"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Excel Sheet
                </button>
                
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all active:scale-[0.98] shadow-md shadow-emerald-500/10"
                >
                  <FileText className="w-4 h-4" />
                  PDF Document
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            {reportData.transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm font-medium">
                No transactions matched this period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-750 text-slate-700">
                    {reportData.transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                          {new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${
                            tx.type === 'income' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-rose-50 text-rose-750 text-rose-700 border-rose-100'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 max-w-[240px] truncate font-medium text-slate-800">
                          {tx.description || <span className="text-slate-400 italic">No description</span>}
                        </td>
                        <td className={`px-4 py-3.5 whitespace-nowrap text-right font-bold ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-slate-700'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}Rs. {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-slate-400 text-sm font-medium">
          No data available. Filter custom months or years to view details.
        </div>
      )}
    </div>
  );
};

export default Reports;
