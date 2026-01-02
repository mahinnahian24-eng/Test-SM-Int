
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Expense } from '../types';
import { Plus, Wallet, TrendingUp, TrendingDown, DollarSign, Calendar, Trash2, BarChart3, Info } from 'lucide-react';
import { Modal } from '../components/Modal';

export const Summary: React.FC = () => {
  const { transactions, expenses, products, addExpense, deleteExpense } = useStore();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'expenses'>('transactions');
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toLocaleDateString('en-CA');
  });
  const [endDate, setEndDate] = useState(() => new Date().toLocaleDateString('en-CA'));

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'Other' as Expense['category'],
  });

  const totalRevenue = useMemo(() => transactions.reduce((sum, t) => sum + t.totalAmount, 0), [transactions]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const currentBalance = totalRevenue - totalExpenses;
  const totalInvestment = useMemo(() => products.reduce((sum, p) => sum + (p.stock * (p.costPrice || 0)), 0), [products]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date).toLocaleDateString('en-CA');
      return tDate >= startDate && tDate <= endDate;
    });
  }, [transactions, startDate, endDate]);

  const categoryChartData = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      t.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const category = product?.category || 'General';
        stats[category] = (stats[category] || 0) + item.subtotal;
      });
    });
    const sorted = Object.entries(stats).sort(([, a], [, b]) => b - a).slice(0, 8);
    const maxVal = Math.max(...sorted.map(([, v]) => v), 1);
    return { sorted, maxVal };
  }, [filteredTransactions, products]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      date: new Date().toISOString()
    });
    setExpenseForm({ description: '', amount: '', category: 'Other' });
    setIsExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Summary Dashboard</h2>
          <p className="text-slate-500">Business performance metrics and analytics.</p>
        </div>
        <button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm transition-all">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Cash in Hand" value={currentBalance} icon={Wallet} color="blue" />
        <KpiCard title="Net Profit" value={totalRevenue - totalExpenses} icon={TrendingUp} color="green" />
        <KpiCard title="Investment" value={totalInvestment} icon={DollarSign} color="purple" />
        <KpiCard title="Total Expenses" value={totalExpenses} icon={TrendingDown} color="red" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-slate-800">Sales By Category</h3>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 shadow-inner">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-2 py-1 text-xs border-none focus:ring-0 bg-transparent" />
            <span className="text-slate-300">/</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-2 py-1 text-xs border-none focus:ring-0 bg-transparent" />
          </div>
        </div>
        
        <div className="p-8 h-80 flex items-end gap-6 overflow-x-auto">
          {categoryChartData.sorted.length > 0 ? categoryChartData.sorted.map(([cat, val], idx) => (
            <div key={cat} className="flex-1 flex flex-col items-center group relative min-w-[60px]">
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                Tk {val.toLocaleString()}
              </div>
              <div 
                className={`w-full max-w-[42px] bg-gradient-to-t from-primary to-blue-400 rounded-t-lg transition-all duration-700 shadow-md group-hover:brightness-110`}
                style={{ height: `${(val / categoryChartData.maxVal) * 100}%` }}
              ></div>
              <div className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate w-full text-center group-hover:text-slate-900">
                {cat}
              </div>
            </div>
          )) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <BarChart3 className="w-12 h-12 mb-2 opacity-10" />
              <p className="text-sm">No data for selected period.</p>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-slate-800"><Calendar className="w-4 h-4" /> History</div>
           <div className="flex bg-slate-200 p-1 rounded-lg">
             <button onClick={() => setActiveTab('transactions')} className={`px-3 py-1 text-xs font-bold rounded ${activeTab === 'transactions' ? 'bg-white shadow text-primary' : 'text-slate-500'}`}>Sales</button>
             <button onClick={() => setActiveTab('expenses')} className={`px-3 py-1 text-xs font-bold rounded ${activeTab === 'expenses' ? 'bg-white shadow text-primary' : 'text-slate-500'}`}>Expenses</button>
           </div>
        </div>
        <div className="max-h-[400px] overflow-auto divide-y divide-slate-50">
          {(activeTab === 'transactions' ? filteredTransactions : expenses.filter(e => {
            const eDate = new Date(e.date).toLocaleDateString('en-CA');
            return eDate >= startDate && eDate <= endDate;
          })).map((item: any) => (
            <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
              <div>
                <div className="font-bold text-slate-800">{item.customerName || item.description}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{new Date(item.date).toLocaleString()}</div>
              </div>
              <div className={`font-black ${activeTab === 'transactions' ? 'text-green-600' : 'text-red-600'}`}>
                Tk {(item.totalAmount || item.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Add Expense">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div><label className="text-sm font-medium">Description</label><input type="text" required className="w-full border p-2 rounded mt-1" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Amount</label><input type="number" required className="w-full border p-2 rounded mt-1" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} /></div>
            <div><label className="text-sm font-medium">Category</label><select className="w-full border p-2 rounded mt-1" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value as any})}><option value="Salary">Salary</option><option value="Rent">Rent</option><option value="Utilities">Utilities</option><option value="Supply">Supply</option><option value="Other">Other</option></select></div>
          </div>
          <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg font-bold">Save Expense</button>
        </form>
      </Modal>
    </div>
  );
};

const KpiCard: React.FC<{ title: string, value: number, icon: any, color: string }> = ({ title, value, icon: Icon, color }) => {
  const colorMap: any = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', purple: 'bg-purple-50 text-purple-600', red: 'bg-red-50 text-red-600' };
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}><Icon className="w-6 h-6" /></div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</span>
      </div>
      <div className="text-2xl font-black text-slate-800">Tk {value.toLocaleString()}</div>
    </div>
  );
};
