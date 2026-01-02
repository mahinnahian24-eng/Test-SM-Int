import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { CartItem, Customer, Product, Transaction } from '../types';
import { Search, Plus, Minus, Trash2, User, CheckCircle, ShoppingCart, UserPlus, ArrowRight, Printer, RotateCcw, FileText, ScrollText } from 'lucide-react';
import { Modal } from '../components/Modal';

export const POS: React.FC = () => {
  const { products, customers, processSale, addCustomer, settings } = useStore();
  
  // State for workflow steps: 'customer' -> 'products' -> 'receipt'
  const [step, setStep] = useState<'customer' | 'products'>('customer');
  
  // Step 1: Customer Selection State
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', email: '' });

  // Step 2: Product & Cart State
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Step 3: Receipt / Success State
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [printFormat, setPrintFormat] = useState<'a5' | 'thermal'>('a5');

  // --- Step 1 Logic (Customer) ---
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    return customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.phone.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  const selectCustomer = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setStep('products');
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer = addCustomer({
      name: newCustomerForm.name,
      phone: newCustomerForm.phone,
      email: newCustomerForm.email
    });
    setNewCustomerForm({ name: '', phone: '', email: '' });
    setIsNewCustomerModalOpen(false);
    selectCustomer(newCustomer);
  };

  // --- Step 2 Logic (Product) ---
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
      p.id.includes(productSearch)
    );
  }, [products, productSearch]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        const product = products.find(p => p.id === productId);
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const transaction = processSale(selectedCustomer?.id || null, cart);
    setCompletedTransaction(transaction);
    setCart([]);
    setIsReceiptOpen(true);
  };

  const handleNewSale = () => {
    setIsReceiptOpen(false);
    setCompletedTransaction(null);
    setSelectedCustomer(null);
    setCustomerSearch('');
    setProductSearch('');
    setStep('customer');
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Step 1 View: Customer Selection ---
  if (step === 'customer') {
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 text-center border-b border-slate-100 bg-slate-50">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">New Sale</h2>
            <p className="text-slate-500">Start by identifying the customer</p>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Search Input */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Name or Phone Number..."
                className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                autoFocus
              />
            </div>

            {/* Results or Actions */}
            <div className="max-w-lg mx-auto min-h-[200px]">
              {customerSearch && filteredCustomers.length > 0 ? (
                <div className="border rounded-xl divide-y divide-slate-100 overflow-hidden shadow-sm">
                  {filteredCustomers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => selectCustomer(c)}
                      className="w-full p-4 text-left hover:bg-blue-50 transition-colors flex justify-between items-center group"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{c.name}</div>
                        <div className="text-sm text-slate-500">{c.phone}</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {customerSearch && (
                    <div className="text-center text-slate-400 py-4">
                      No customer found matching "{customerSearch}"
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button 
                      onClick={() => setIsNewCustomerModalOpen(true)}
                      className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary hover:bg-blue-50 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-primary flex items-center justify-center group-hover:bg-blue-200">
                        <UserPlus className="w-6 h-6" />
                      </div>
                      <span className="font-semibold text-slate-700">Add New Customer</span>
                    </button>

                    <button 
                      onClick={() => selectCustomer(null)}
                      className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 hover:bg-slate-50 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-slate-200">
                        <User className="w-6 h-6" />
                      </div>
                      <span className="font-semibold text-slate-700">Walk-in Customer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Modal
          isOpen={isNewCustomerModalOpen}
          onClose={() => setIsNewCustomerModalOpen(false)}
          title="Add New Customer"
        >
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={newCustomerForm.name}
                onChange={e => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={newCustomerForm.phone}
                onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={newCustomerForm.email}
                onChange={e => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
              />
            </div>
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="flex-1 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-700"
              >
                Create & Select
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // --- Step 2 View: Product Selection (Main POS) ---
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header for POS Step */}
      <div className="mb-4 flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-primary rounded-full">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase font-bold">Billing To</div>
            <div className="font-semibold text-slate-800">
              {selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}
              {selectedCustomer && <span className="text-slate-500 font-normal"> ({selectedCustomer.phone})</span>}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setStep('customer')}
          className="text-sm text-primary hover:underline font-medium"
        >
          Change Customer
        </button>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Left Column: Product Selection */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name or ID..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const inCart = cart.find(i => i.id === product.id);
                const available = product.stock - (inCart?.quantity || 0);
                const isOutOfStock = available <= 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                      isOutOfStock 
                        ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' 
                        : 'bg-white border-slate-200 hover:border-primary hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <span className="font-semibold text-slate-800 line-clamp-2 h-10 leading-snug">{product.name}</span>
                    <div className="flex justify-between items-end mt-2">
                      <span className="text-primary font-bold">Tk {product.price.toFixed(2)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        available < 5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {available} left
                      </span>
                    </div>
                  </button>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-10 text-slate-400">
                  No products found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Cart */}
        <div className="w-96 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Current Bill
            </h3>
            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full font-bold">{cart.length} Items</span>
          </div>

          <div className="flex-1 overflow-auto">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-60 p-8">
                <ShoppingCart className="w-12 h-12" />
                <p>Add products to start billing</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {cart.map(item => (
                  <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-3">
                         <div className="font-medium text-slate-800 text-sm line-clamp-2 leading-snug">{item.name}</div>
                         <div className="text-xs text-slate-500 mt-1">Tk {item.price.toFixed(2)} / unit</div>
                      </div>
                      <div className="text-right">
                         <div className="font-bold text-slate-900 text-sm">
                            Tk {(item.price * item.quantity).toFixed(2)}
                         </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                       <div className="flex items-center border border-slate-200 rounded-lg h-8 bg-white shadow-sm">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-full flex items-center justify-center hover:bg-slate-50 rounded-l-lg border-r border-slate-100 transition-colors text-slate-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium text-slate-700 select-none">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-full flex items-center justify-center hover:bg-slate-50 rounded-r-lg border-l border-slate-100 transition-colors text-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                       </div>
                       
                       <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100"
                          title="Remove Item"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-slate-800">Tk {cartTotal.toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                cart.length === 0 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Complete & Print Bill
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal - Multi-format Design */}
      {isReceiptOpen && completedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static">
          <div className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:w-full print:max-w-none print:rounded-none print:max-h-none ${printFormat === 'a5' ? 'w-full max-w-lg' : 'w-[380px]'}`}>
            
            {/* Screen-only Controls */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 print:hidden flex-shrink-0">
              <div className="flex items-center gap-2">
                 <h3 className="font-semibold text-slate-800">Receipt</h3>
                 <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg ml-2">
                  <button
                    onClick={() => setPrintFormat('a5')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${printFormat === 'a5' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <FileText className="w-3 h-3" /> A5
                  </button>
                  <button
                    onClick={() => setPrintFormat('thermal')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${printFormat === 'thermal' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <ScrollText className="w-3 h-3" /> Thermal
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={handleNewSale}
                  className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  <RotateCcw className="w-4 h-4" /> New Sale
                </button>
              </div>
            </div>

            {/* Receipt Content */}
            <div className="flex-1 overflow-auto bg-white custom-scrollbar">
               <div id="printable-area" className={`${printFormat === 'a5' ? 'p-8' : 'p-4'} bg-white`}>
                   {/* Header */}
                   <div className="text-center mb-6">
                     <h1 className={`${printFormat === 'a5' ? 'text-3xl tracking-wide mb-2' : 'text-xl mb-1'} font-bold uppercase text-slate-900`}>
                       {settings.storeName}
                     </h1>
                     <div className="text-slate-600 text-sm whitespace-pre-line leading-tight">{settings.address}</div>
                     <div className="text-slate-600 text-sm mt-1">
                        {settings.phone}
                     </div>
                   </div>

                   {/* Meta Data */}
                   <div className={`flex justify-between items-end border-b-2 border-slate-800 pb-2 mb-4 ${printFormat === 'thermal' ? 'flex-col items-start gap-2 border-b border-slate-300 border-dashed' : ''}`}>
                     <div className="text-sm">
                       <div className="font-bold text-slate-800">Bill To:</div>
                       <div className="text-slate-700">{completedTransaction.customerName}</div>
                       {selectedCustomer && <div className="text-slate-600">{selectedCustomer.phone}</div>}
                     </div>
                     <div className={`${printFormat === 'a5' ? 'text-right' : 'text-left w-full flex justify-between'} text-sm`}>
                       <div className={`${printFormat === 'a5' ? '' : 'hidden'} font-bold text-lg mb-1`}>INVOICE</div>
                       <div className="text-slate-600"><span className="font-semibold">Inv:</span> {completedTransaction.id.slice(-6).toUpperCase()}</div>
                       <div className="text-slate-600"><span className="font-semibold">Date:</span> {new Date(completedTransaction.date).toLocaleDateString()}</div>
                     </div>
                   </div>

                   {/* Items Table */}
                   <div className="mb-6">
                     <table className="w-full text-sm">
                       <thead>
                         <tr className={`border-b ${printFormat === 'a5' ? 'border-slate-300' : 'border-slate-300 border-dashed'}`}>
                           <th className="text-left py-2 font-bold text-slate-800">Item</th>
                           <th className="text-center py-2 font-bold text-slate-800 w-10">Qty</th>
                           <th className="text-right py-2 font-bold text-slate-800 w-16">Price</th>
                           <th className="text-right py-2 font-bold text-slate-800 w-16">Total</th>
                         </tr>
                       </thead>
                       <tbody className={`divide-y ${printFormat === 'a5' ? 'divide-slate-100' : 'divide-slate-100 border-b border-slate-300 border-dashed'}`}>
                         {completedTransaction.items.map((item, idx) => (
                           <tr key={idx}>
                             <td className="py-2 text-slate-700 align-top">
                               <div className={printFormat === 'thermal' ? 'line-clamp-2 leading-tight' : ''}>{item.productName}</div>
                             </td>
                             <td className="py-2 text-center text-slate-700 align-top">{item.quantity}</td>
                             <td className="py-2 text-right text-slate-700 align-top">{item.priceAtSale.toFixed(0)}</td>
                             <td className="py-2 text-right font-medium text-slate-900 align-top">{item.subtotal.toFixed(0)}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>

                   {/* Summary */}
                   <div className={`flex ${printFormat === 'a5' ? 'justify-end' : 'flex-col' } mb-8`}>
                     <div className={`${printFormat === 'a5' ? 'w-1/2' : 'w-full'} space-y-2`}>
                       <div className={`flex justify-between text-sm pt-2 ${printFormat === 'a5' ? 'border-t-2 border-slate-800' : ''}`}>
                         <span className="font-bold text-slate-800 text-lg">Grand Total</span>
                         <span className="font-bold text-slate-900 text-lg">Tk {completedTransaction.totalAmount.toFixed(2)}</span>
                       </div>
                       <div className="text-xs text-right text-slate-500 italic mt-1">Paid in Cash</div>
                     </div>
                   </div>

                   {/* Footer */}
                   <div className="text-center pt-6 border-t border-slate-200">
                     <p className="text-sm font-medium text-slate-800 mb-1">{settings.footerMessage}</p>
                     <p className="text-xs text-slate-500">Software by SM International</p>
                   </div>
               </div>
            </div>

            {/* Screen-only Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 print:hidden flex flex-col gap-3 flex-shrink-0">
              <button
                onClick={handlePrint}
                className="w-full py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 flex items-center justify-center gap-2 font-medium"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
          
          {/* Print Styles */}
          <style>{`
            @media print {
              @page {
                size: ${printFormat === 'a5' ? 'A5' : '80mm auto'};
                margin: 0;
              }
              body {
                margin: 0;
                background: white;
              }
              body * {
                visibility: hidden;
              }
              .fixed.inset-0 {
                position: static;
                background: white;
                display: block;
                visibility: visible;
                padding: 0;
                width: 100%;
                height: auto;
              }
              .fixed.inset-0 .bg-white {
                box-shadow: none;
                max-width: none;
                width: ${printFormat === 'a5' ? '100%' : '80mm'};
                margin: 0 auto;
                border-radius: 0;
                height: auto;
                overflow: visible;
              }
              #printable-area, #printable-area * {
                visibility: visible;
              }
              #printable-area {
                width: 100%;
                padding: ${printFormat === 'a5' ? '1cm' : '0 2mm'};
              }
              /* Thermal Tweaks */
              ${printFormat === 'thermal' ? `
                #printable-area { font-family: 'Courier New', monospace; font-size: 11px; }
                h1 { font-size: 16px !important; margin-bottom: 4px !important; }
                table { font-size: 11px; }
                td, th { padding: 4px 0 !important; }
                .text-lg { font-size: 14px !important; }
                .text-sm { font-size: 11px !important; }
                .text-xs { font-size: 10px !important; }
                .border-b-2 { border-bottom-width: 1px !important; }
              ` : ''}
            }
          `}</style>
        </div>
      )}
    </div>
  );
};