import { Product, Customer, Transaction, Expense, StoreSettings, User } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'swiftpos_products',
  CUSTOMERS: 'swiftpos_customers',
  TRANSACTIONS: 'swiftpos_transactions',
  EXPENSES: 'swiftpos_expenses',
  SETTINGS: 'swiftpos_settings',
  USERS: 'swiftpos_users',
  SESSION: 'swiftpos_session',
};

// Added costPrice (approx 70-80% of selling price for demo)
const INITIAL_PRODUCTS: Product[] = [
  { id: 'HH164-3243-0', name: 'FILTER(CARTRIDGE,OIL)', price: 18.50, costPrice: 13.00, stock: 50, category: 'Filters' },
  { id: '1J884-3708-0', name: 'CONNECTOR', price: 5.25, costPrice: 3.50, stock: 100, category: 'Parts' },
  { id: '01754-50875', name: 'BOLT,FLANGE', price: 1.50, costPrice: 0.80, stock: 200, category: 'Hardware' },
  { id: '1J883-7301-0', name: 'THERMOSTAT,ASSY', price: 45.00, costPrice: 32.00, stock: 15, category: 'Engine' },
  { id: '5H400-2675-0', name: 'FILTER', price: 12.00, costPrice: 8.50, stock: 40, category: 'Filters' },
  { id: '5H476-2671-2', name: 'COMP.TANK,FUEL', price: 250.00, costPrice: 190.00, stock: 5, category: 'Fuel System' },
  { id: '5H487-5140-0', name: 'SEPARATOR,WATER', price: 35.00, costPrice: 25.00, stock: 10, category: 'Fuel System' },
  { id: '5T057-2560-0', name: 'ASSY FILTER,FUEL', price: 28.50, costPrice: 20.00, stock: 20, category: 'Fuel System' },
  { id: '5T057-2610-3', name: 'CLEANER,AIR', price: 32.00, costPrice: 22.50, stock: 15, category: 'Filters' },
  { id: '5T051-2621-0', name: 'COVER', price: 25.00, costPrice: 18.00, stock: 10, category: 'Body' },
  { id: '5T051-2622-0', name: 'BODY', price: 150.00, costPrice: 110.00, stock: 4, category: 'Body' },
  { id: '5T051-2625-0', name: 'NUT,KNOB', price: 3.00, costPrice: 1.50, stock: 50, category: 'Hardware' },
  { id: '17111-9701-0', name: 'BELT,V', price: 15.75, costPrice: 10.00, stock: 30, category: 'Engine' },
  { id: '5H669-4250-3', name: 'ASSY ALTERNATOR', price: 185.00, costPrice: 140.00, stock: 3, category: 'Electrical' },
  { id: '17123-6301-6', name: 'ASSY STARTER', price: 195.00, costPrice: 145.00, stock: 3, category: 'Electrical' },
  { id: '5T101-4125-2', name: 'RELAY', price: 12.50, costPrice: 8.00, stock: 40, category: 'Electrical' },
  { id: '5H492-4211-0', name: 'ECU (MAIN)', price: 450.00, costPrice: 350.00, stock: 2, category: 'Electrical' },
  { id: '54352-3136-0', name: 'SWITCH', price: 8.50, costPrice: 5.00, stock: 35, category: 'Electrical' },
  { id: '5T089-7530-0', name: 'SWITCH,ASSY(HAND-OPERAT.)', price: 22.00, costPrice: 15.00, stock: 12, category: 'Electrical' },
  { id: '5H601-7320-2', name: 'ASSY MOTOR', price: 120.00, costPrice: 85.00, stock: 5, category: 'Electrical' },
  { id: '1G171-5966-0', name: 'SENSOR(REVOLUTION)', price: 45.00, costPrice: 30.00, stock: 8, category: 'Sensors' },
  { id: '5T057-4213-2', name: 'SENSOR,GRAIN', price: 55.00, costPrice: 38.00, stock: 6, category: 'Sensors' },
  { id: '52200-9951-0', name: 'SWITCH', price: 9.00, costPrice: 5.50, stock: 30, category: 'Electrical' },
  { id: '5T057-4224-2', name: 'SWITCH,CONB', price: 14.50, costPrice: 9.00, stock: 20, category: 'Electrical' },
  { id: '5H476-4121-0', name: 'ASSY METER', price: 85.00, costPrice: 60.00, stock: 5, category: 'Electrical' },
  { id: '5H484-3138-3', name: 'ASSY LAMP,ELECTRIC', price: 28.00, costPrice: 19.00, stock: 15, category: 'Electrical' },
  { id: '5H484-3139-2', name: 'BULB', price: 2.50, costPrice: 1.00, stock: 100, category: 'Electrical' },
  { id: '5H492-4295-0', name: 'FUSE(MINI,25A)', price: 0.75, costPrice: 0.25, stock: 200, category: 'Electrical' },
  { id: '5H492-4294-0', name: 'FUSE(MINI,20A)', price: 0.75, costPrice: 0.25, stock: 200, category: 'Electrical' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'C1', name: 'John Doe', phone: '555-0123', email: 'john@example.com', totalSpent: 0 },
];

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'SM International',
  address: '123 Business Road, Dhaka, Bangladesh',
  phone: '+880 1700-000000',
  email: 'info@sminternational.com',
  footerMessage: 'Thank you for your business! Please come again.',
  autoBackup: false,
  googleDriveConnected: false,
};

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Owner', username: 'admin', password: 'password', role: 'admin' },
  { id: '2', name: 'Manager', username: 'manager', password: 'password', role: 'manager' },
];

export const StorageService = {
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getCustomers: (): Customer[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
  },
  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },
  saveExpenses: (expenses: Expense[]) => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  getSettings: (): StoreSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    // Merge with default to ensure new keys exist
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  },
  saveSettings: (settings: StoreSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getSession: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  },
  saveSession: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  },

  // Backup & Restore
  getAllData: () => {
    return {
      products: JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]'),
      customers: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]'),
      transactions: JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]'),
      expenses: JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]'),
      settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}'),
      users: JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
      backupDate: new Date().toISOString(),
      version: '1.0'
    };
  },

  restoreData: (data: any): boolean => {
    try {
      if (!data || typeof data !== 'object') return false;
      
      // Basic validation
      if (data.products) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
      if (data.customers) localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data.customers));
      if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
      if (data.expenses) localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      
      return true;
    } catch (e) {
      console.error("Restore failed", e);
      return false;
    }
  }
};