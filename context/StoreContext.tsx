import React, { createContext, useState, useEffect, useContext, ReactNode, useRef } from 'react';
import { Product, Customer, Transaction, StoreContextType, CartItem, Expense, StoreSettings } from '../types';
import { StorageService } from '../services/storage';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(StorageService.getSettings());
  
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const isInitialMount = useRef(true);

  // Load initial data
  useEffect(() => {
    // Load and migrate products to ensure costPrice exists
    const loadedProducts = StorageService.getProducts();
    const migratedProducts = loadedProducts.map(p => ({
      ...p,
      costPrice: p.costPrice !== undefined ? p.costPrice : Number((p.price * 0.75).toFixed(2))
    }));
    
    setProducts(migratedProducts);
    setCustomers(StorageService.getCustomers());
    setTransactions(StorageService.getTransactions());
    setExpenses(StorageService.getExpenses());
    // Settings loaded in initial state
  }, []);

  // Persist data whenever it changes
  useEffect(() => {
    if (products.length > 0) StorageService.saveProducts(products);
  }, [products]);

  useEffect(() => {
    if (customers.length > 0) StorageService.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    if (transactions.length > 0) StorageService.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    StorageService.saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  // --- AUTOMATIC BACKUP LOGIC ---
  useEffect(() => {
    // Skip backup on initial load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (settings.autoBackup && settings.googleDriveConnected) {
      const performBackup = async () => {
        setIsCloudSyncing(true);
        console.log("Detecting changes... Starting Auto-Backup...");
        
        // Simulate API call delay for Google Drive upload
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real app, you would upload StorageService.getAllData() here
        const now = new Date().toISOString();
        
        setSettings(prev => ({
          ...prev,
          lastBackupTime: now
        }));
        
        setIsCloudSyncing(false);
      };

      // Debounce the backup: Wait 5 seconds after the last change before uploading
      const timeoutId = setTimeout(() => {
        performBackup();
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [products, customers, transactions, expenses, settings.autoBackup, settings.googleDriveConnected]);

  const triggerManualBackup = async () => {
    if (!settings.googleDriveConnected) return;
    setIsCloudSyncing(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    const now = new Date().toISOString();
    setSettings(prev => ({ ...prev, lastBackupTime: now }));
    setIsCloudSyncing(false);
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const addProducts = (productsData: Omit<Product, 'id'>[]) => {
    const newProducts: Product[] = productsData.map((p, index) => ({
      ...p,
      id: Date.now().toString() + '-' + index + Math.random().toString(36).substr(2, 5),
    }));
    setProducts(prev => [...prev, ...newProducts]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalSpent'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      totalSpent: 0,
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const addCustomers = (customersData: Omit<Customer, 'id' | 'totalSpent'>[]) => {
    const newCustomers: Customer[] = customersData.map((c, index) => ({
      ...c,
      id: Date.now().toString() + '-' + index + Math.random().toString(36).substr(2, 5),
      totalSpent: 0,
    }));
    setCustomers(prev => [...prev, ...newCustomers]);
  };

  const processSale = (customerId: string | null, cartItems: CartItem[]): Transaction => {
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const date = new Date().toISOString();
    
    let customerName = 'Walk-in Customer';
    let finalCustomerId = 'GUEST';

    // Update Customer
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        customerName = customer.name;
        finalCustomerId = customer.id;
        setCustomers(prev => prev.map(c => 
          c.id === customerId ? { ...c, totalSpent: c.totalSpent + totalAmount } : c
        ));
      }
    }

    // Update Stock
    setProducts(prev => prev.map(p => {
      const cartItem = cartItems.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    }));

    // Create Transaction
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      customerId: finalCustomerId,
      customerName,
      date,
      totalAmount,
      items: cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        priceAtSale: item.price,
        costAtSale: item.costPrice || (item.price * 0.75), // Fallback if costPrice missing
        subtotal: item.price * item.quantity
      }))
    };

    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
  };

  return (
    <StoreContext.Provider value={{
      products,
      customers,
      transactions,
      expenses,
      settings,
      isCloudSyncing,
      addProduct,
      addProducts,
      updateProduct,
      deleteProduct,
      addCustomer,
      addCustomers,
      processSale,
      updateTransaction,
      deleteTransaction,
      addExpense,
      updateExpense,
      deleteExpense,
      updateSettings,
      triggerManualBackup
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};