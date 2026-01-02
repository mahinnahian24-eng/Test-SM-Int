export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number; // Added for profit calculation
  stock: number;
  category?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalSpent: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtSale: number;
  costAtSale: number; // To track profit history accurately
  subtotal: number;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  items: TransactionItem[];
  totalAmount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'Salary' | 'Rent' | 'Utilities' | 'Supply' | 'Other';
  date: string;
}

export interface StoreSettings {
  storeName: string;
  address: string;
  phone: string;
  email: string;
  footerMessage: string;
  // Backup Settings
  autoBackup: boolean;
  googleDriveConnected: boolean;
  lastBackupTime?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string; // In a real backend, this would be hashed
  role: 'admin' | 'manager' | 'staff';
}

export interface StoreContextType {
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  expenses: Expense[];
  settings: StoreSettings;
  isCloudSyncing: boolean; // UI state for auto backup
  addProduct: (product: Omit<Product, 'id'>) => void;
  addProducts: (products: Omit<Product, 'id'>[]) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalSpent'>) => Customer; // Returns the new customer
  addCustomers: (customers: Omit<Customer, 'id' | 'totalSpent'>[]) => void; // Bulk add
  processSale: (customerId: string | null, items: CartItem[]) => Transaction; // Returns the transaction
  
  // Transaction Management
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Expense Management
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  updateSettings: (settings: StoreSettings) => void;
  triggerManualBackup: () => Promise<void>;
}