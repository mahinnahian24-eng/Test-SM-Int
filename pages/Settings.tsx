
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Save, UserPlus, Trash2, Shield, User as UserIcon, Check, Edit2, Download, Upload, Database, Cloud, RefreshCw, Lock, BadgeCheck, BookOpen, Calendar, DollarSign, XCircle } from 'lucide-react';
import { Modal } from '../components/Modal';
import { User, Transaction, Expense } from '../types';
import { StorageService } from '../services/storage';

type Tab = 'general' | 'daybook' | 'users' | 'backup';

export const Settings: React.FC = () => {
  const { settings, updateSettings, triggerManualBackup, isCloudSyncing, transactions, expenses, updateTransaction, deleteTransaction, updateExpense, deleteExpense } = useStore();
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [form, setForm] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);
  
  // Day Book Security Logic
  const [dayBookDate, setDayBookDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [pendingAction, setPendingAction] = useState<{ type: string, id: string, payload?: any } | null>(null);

  const [editTransModalOpen, setEditTransModalOpen] = useState(false);
  const [editTransForm, setEditTransForm] = useState<Partial<Transaction>>({});
  
  const [editExpModalOpen, setEditExpModalOpen] = useState(false);
  const [editExpForm, setEditExpForm] = useState<Partial<Expense>>({});

  useEffect(() => { setForm(settings); }, [settings]);

  const initiateAction = (action: any) => {
    setPendingAction(action);
    setAuthPassword('');
    setAuthError('');
    setPasswordModalOpen(true);
  };

  const handleSecurityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPassword === currentUser?.password) {
      if (pendingAction) {
        if (pendingAction.type === 'delete_trans') deleteTransaction(pendingAction.id);
        else if (pendingAction.type === 'delete_exp') deleteExpense(pendingAction.id);
        else if (pendingAction.type === 'edit_trans') { setEditTransForm(pendingAction.payload); setEditTransModalOpen(true); }
        else if (pendingAction.type === 'edit_exp') { setEditExpForm(pendingAction.payload); setEditExpModalOpen(true); }
      }
      setPasswordModalOpen(false);
      setPendingAction(null);
    } else {
      setAuthError('Access denied: Invalid password.');
    }
  };

  const filteredDayBook = useMemo(() => {
    const d = new Date(dayBookDate).toDateString();
    return {
      sales: transactions.filter(t => new Date(t.date).toDateString() === d),
      exp: expenses.filter(e => new Date(e.date).toDateString() === d)
    };
  }, [dayBookDate, transactions, expenses]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Settings</h2>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {[{id:'general', label:'General', icon:Save}, {id:'daybook', label:'Day Book', icon:BookOpen}, {id:'users', label:'Users', icon:UserIcon}, {id:'backup', label:'Backup', icon:Database}].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === t.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'general' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
          <form onSubmit={(e) => { e.preventDefault(); updateSettings(form); setIsSaved(true); setTimeout(() => setIsSaved(false), 2000); }} className="space-y-4">
            <div><label className="text-sm font-bold text-slate-600">Store Name</label><input className="w-full border p-2 rounded mt-1" value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} /></div>
            <div><label className="text-sm font-bold text-slate-600">Address</label><textarea rows={3} className="w-full border p-2 rounded mt-1" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-bold text-slate-600">Phone</label><input className="w-full border p-2 rounded mt-1" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div><label className="text-sm font-bold text-slate-600">Email</label><input className="w-full border p-2 rounded mt-1" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Update Settings</button>
              {isSaved && <span className="text-green-600 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Saved Successfully</span>}
            </div>
          </form>
        </div>
      )}

      {activeTab === 'daybook' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
               <h3 className="font-black text-slate-800 uppercase tracking-tighter">Daily Ledger</h3>
             </div>
             <input type="date" value={dayBookDate} onChange={e => setDayBookDate(e.target.value)} className="border p-2 rounded-lg font-bold text-slate-700" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <DayBookSection title="Sales Transactions" data={filteredDayBook.sales} icon={BadgeCheck} color="green" onEdit={(t) => initiateAction({type:'edit_trans', id:t.id, payload:t})} onDelete={(id) => initiateAction({type:'delete_trans', id})} />
             <DayBookSection title="Expenses" data={filteredDayBook.exp} icon={DollarSign} color="red" onEdit={(e) => initiateAction({type:'edit_exp', id:e.id, payload:e})} onDelete={(id) => initiateAction({type:'delete_exp', id})} />
          </div>
        </div>
      )}

      {/* Password Verification Modal */}
      <Modal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Security Authorization">
        <form onSubmit={handleSecurityCheck} className="space-y-4">
          <div className="bg-amber-50 text-amber-800 p-4 rounded-lg flex gap-3 text-sm">
            <Lock className="w-5 h-5 flex-shrink-0" />
            <p><strong>Action Protected:</strong> This operation requires administrator authorization. Enter your current password.</p>
          </div>
          <input type="password" autoFocus placeholder="Enter Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full border p-3 rounded-lg focus:ring-2 ring-primary" />
          {authError && <p className="text-red-600 text-xs font-bold">{authError}</p>}
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg">Verify & Proceed</button>
        </form>
      </Modal>

      {/* Actual Data Editing Modals */}
      <Modal isOpen={editTransModalOpen} onClose={() => setEditTransModalOpen(false)} title="Modify Sale">
         <form onSubmit={(e) => { e.preventDefault(); updateTransaction(editTransForm.id!, editTransForm); setEditTransModalOpen(false); }} className="space-y-4">
           <div><label className="text-xs font-bold uppercase text-slate-400">Customer</label><input className="w-full border p-2 rounded mt-1" value={editTransForm.customerName || ''} onChange={ev => setEditTransForm({...editTransForm, customerName: ev.target.value})} /></div>
           <div><label className="text-xs font-bold uppercase text-slate-400">Total (Tk)</label><input type="number" className="w-full border p-2 rounded mt-1" value={editTransForm.totalAmount || ''} onChange={ev => setEditTransForm({...editTransForm, totalAmount: parseFloat(ev.target.value)})} /></div>
           <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold">Update Ledger Entry</button>
         </form>
      </Modal>
    </div>
  );
};

const DayBookSection: React.FC<{ title: string, data: any[], icon: any, color: string, onEdit: (item: any) => void, onDelete: (id: string) => void }> = ({ title, data, icon: Icon, color, onEdit, onDelete }) => {
  const isSale = color === 'green';
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[450px] flex flex-col">
       <div className={`p-4 bg-slate-50 border-b flex justify-between items-center`}>
          <h4 className="font-bold text-slate-800 flex items-center gap-2"><Icon className={`w-4 h-4 text-${color}-600`} /> {title}</h4>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-${color}-100 text-${color}-700 rounded-full`}>Total: Tk {data.reduce((s, i) => s + (i.totalAmount || i.amount), 0).toLocaleString()}</span>
       </div>
       <div className="flex-1 overflow-auto">
         {data.length > 0 ? (
           <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-slate-400 sticky top-0"><tr className="text-[10px] uppercase font-bold"><th className="px-4 py-2">Info</th><th className="px-4 py-2 text-right">Amount</th><th className="px-4 py-2 text-center">Action</th></tr></thead>
             <tbody className="divide-y">
               {data.map(item => (
                 <tr key={item.id} className="hover:bg-slate-50">
                   <td className="px-4 py-3">
                     <div className="font-bold text-slate-800">{item.customerName || item.description}</div>
                     <div className="text-[10px] text-slate-400">{new Date(item.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                   </td>
                   <td className={`px-4 py-3 text-right font-black ${isSale ? 'text-slate-900' : 'text-red-600'}`}>Tk {(item.totalAmount || item.amount).toLocaleString()}</td>
                   <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => onEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         ) : <div className="p-10 text-center text-slate-400"><XCircle className="w-10 h-10 mx-auto mb-2 opacity-10" /><p className="text-sm">No activity found.</p></div>}
       </div>
    </div>
  );
};
