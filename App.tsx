import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Inventory } from './pages/Inventory';
import { Customers } from './pages/Customers';
import { POS } from './pages/POS';
import { Summary } from './pages/Summary';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentPath, setCurrentPath] = useState('/');

  if (!user) {
    return <Login />;
  }

  // Permission Logic
  const canAccess = (path: string): boolean => {
    if (path === '/') return true; // POS accessible to all
    
    if (user.role === 'admin') return true; // Admin accesses everything
    
    if (user.role === 'manager') {
       // Manager: Everything except Settings
       return ['/summary', '/inventory', '/customers'].includes(path);
    }
    
    // Staff: Only POS (which is handled by path === '/')
    return false;
  };

  const navigate = (path: string) => {
    if (canAccess(path)) {
      setCurrentPath(path);
    }
  };

  // Guard: If current path is somehow not allowed (e.g. role changed), default to POS
  const activePath = canAccess(currentPath) ? currentPath : '/';

  let content;
  switch (activePath) {
    case '/summary':
      content = <Summary />;
      break;
    case '/inventory':
      content = <Inventory />;
      break;
    case '/customers':
      content = <Customers />;
      break;
    case '/settings':
      content = <Settings />;
      break;
    case '/':
    default:
      content = <POS />;
      break;
  }

  return (
    <StoreProvider>
      <Layout currentPath={activePath} onNavigate={navigate}>
        {content}
      </Layout>
    </StoreProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;