import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Customer, Transaction } from '../types';
import { Search, UserPlus, Phone, Mail, Clock, ShoppingBag, Upload, FileText } from 'lucide-react';
import { Modal } from '../components/Modal';

export const Customers: React.FC = () => {
  const { customers, transactions, addCustomer, addCustomers } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const customerTransactions = selectedCustomer 
    ? transactions.filter(t => t.customerId === selectedCustomer.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer({
      name: formData.name,
      phone: formData.phone,
      email: formData.email
    });
    setFormData({ name: '', phone: '', email: '' });
    setIsAddModalOpen(false);
  };

  const handleImportClick = () => {
    document.getElementById('csvCustomerInput')?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      if (lines.length < 2) {
        alert("File seems empty or missing data rows.");
        return;
      }

      // Simple header detection to find column indices
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('customer'));
      const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile'));
      const emailIdx = headers.findIndex(h => h.includes('email'));

      const newCustomers: Omit<Customer, 'id' | 'totalSpent'>[] = [];
      let successCount = 0;
      let failCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Split by comma, handling quotes roughly
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
        
        // Use detected indices or fallback to 0=Name, 1=Phone, 2=Email
        const name = values[nameIdx > -1 ? nameIdx : 0];
        const phone = values[phoneIdx > -1 ? phoneIdx : 1];
        const email = values[emailIdx > -1 ? emailIdx : 2] || '';
        
        if (name && phone) {
           newCustomers.push({
             name,
             phone,
             email
           });
           successCount++;
        } else {
           failCount++;
        }
      }

      if (newCustomers.length > 0) {
        addCustomers(newCustomers);
        alert(`Imported ${successCount} customers successfully.${failCount > 0 ? ` Failed to import ${failCount} rows (missing name or phone).` : ''}`);
      } else {
        alert("No valid customers found to import. Please ensure your CSV has 'Name' and 'Phone' columns.");
      }
      
      // Reset input
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Customer List */}
      <div className={`flex-1 flex flex-col space-y-4 ${selectedCustomer ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Customers</h2>
          <div className="flex gap-2">
            <input 
              type="file" 
              id="csvCustomerInput" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            <button 
              onClick={handleImportClick}
              className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              title="Import from Excel/Google Sheets (CSV)"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">New Customer</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <UserPlus className="w-6 h-6 text-slate-300" />
                </div>
                <div className="text-slate-500 font-medium">No customers found</div>
                <p className="text-sm text-slate-400 mt-1 max-w-xs">
                  Add a new customer manually or import a list from Excel/Google Sheets (Save as CSV first).
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredCustomers.map(customer => (
                  <div 
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${selectedCustomer?.id === customer.id ? 'bg-blue-50 border-l-4 border-primary' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-800">{customer.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-xs text-slate-500 uppercase font-semibold">Total Spent</div>
                         <div className="text-primary font-bold">Tk {customer.totalSpent.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction History Panel */}
      {selectedCustomer ? (
        <div className="w-full lg:w-[480px] bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
             <div>
               <h3 className="text-xl font-bold text-slate-800">{selectedCustomer.name}</h3>
               <div className="flex flex-col gap-1 mt-2 text-sm text-slate-600">
                 <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> {selectedCustomer.phone}</span>
                 {selectedCustomer.email && <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> {selectedCustomer.email}</span>}
               </div>
             </div>
             <button 
               onClick={() => setSelectedCustomer(null)}
               className="lg:hidden text-sm text-primary font-medium"
             >
               Close
             </button>
           </div>
           
           <div className="flex-1 overflow-auto p-6">
             <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
               <Clock className="w-4 h-4" /> Purchase History
             </h4>
             
             {customerTransactions.length === 0 ? (
               <div className="text-center text-slate-400 py-10">No recent transactions.</div>
             ) : (
               <div className="space-y-6">
                 {customerTransactions.map(t => (
                   <div key={t.id} className="border border-slate-200 rounded-lg p-4 relative">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {new Date(t.date).toLocaleDateString()} &bull; {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span className="font-bold text-slate-800">Tk {t.totalAmount.toFixed(2)}</span>
                     </div>
                     <div className="space-y-2">
                       {t.items.map((item, idx) => (
                         <div key={idx} className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              <span className="font-medium text-slate-800">{item.quantity}x</span> {item.productName}
                            </span>
                            <span className="text-slate-500">Tk {item.subtotal.toFixed(2)}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      ) : (
        <div className="hidden lg:flex w-[480px] items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <div className="text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>Select a customer to view details</p>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-700"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};