import React from 'react';
import { LayoutDashboard, ShoppingCart, Users, Package, PieChart, Settings, LogOut, User as UserIcon, RefreshCw, CheckCircle, Cloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPath, onNavigate }) => {
  const { user, logout } = useAuth();
  const { isCloudSyncing, settings } = useStore();

  const navItems = [
    { to: '/', label: 'POS', icon: ShoppingCart, roles: ['admin', 'manager', 'staff'] },
    { to: '/summary', label: 'Summary', icon: PieChart, roles: ['admin', 'manager'] },
    { to: '/inventory', label: 'Inventory', icon: Package, roles: ['admin', 'manager'] },
    { to: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'manager'] },
    { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

  const visibleNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold">SM International</span>
          </div>
          <p className="text-slate-400 text-xs mt-1">Management System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {visibleNavItems.map((item) => {
            const isActive = currentPath === item.to;
            return (
              <a
                key={item.to}
                href={item.to}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.to);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
               <UserIcon className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
               <div className="font-medium text-sm truncate">{user?.name}</div>
               <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors text-sm"
          >
             <LogOut className="w-4 h-4" />
             Sign Out
          </button>
          
          <div className="text-[10px] text-slate-600 text-center mt-4">
            &copy; 2025 SM International
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="bg-surface border-b border-slate-200 h-16 flex items-center px-8 justify-between">
          <h1 className="text-lg font-semibold text-slate-800">
            {visibleNavItems.find(i => i.to === currentPath)?.label || 'Business Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
             {/* Cloud Status Indicator - Visible only to admin/manager or if connected */}
             {(settings.googleDriveConnected && user?.role !== 'staff') && (
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium">
                 {isCloudSyncing ? (
                   <>
                     <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                     <span className="text-blue-600">Syncing...</span>
                   </>
                 ) : (
                   <>
                     <Cloud className="w-3 h-3 text-green-500" />
                     <span className="text-slate-600">Backed up</span>
                   </>
                 )}
               </div>
             )}

             <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
               {user?.name.charAt(0)}
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};