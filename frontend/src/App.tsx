import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import Platform from './pages/Platform';
import AccountPage from './pages/AccountPage';
import AdminPanel from './pages/AdminPanel';
import OperatorPanel from './pages/OperatorPanel';
import AccountantPanel from './pages/AccountantPanel';
import SupportPanel from './pages/SupportPanel';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-400 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/platform" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuthContext();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/platform" replace /> : <AuthPage />} 
      />

      {/* Protected Routes - User */}
      <Route 
        path="/platform" 
        element={
          <ProtectedRoute>
            <Platform />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/account" 
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        } 
      />

      {/* Protected Routes - Admin */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        } 
      />

      {/* Protected Routes - Operator */}
      <Route 
        path="/operator" 
        element={
          <ProtectedRoute allowedRoles={['operator', 'admin']}>
            <OperatorPanel />
          </ProtectedRoute>
        } 
      />

      {/* Protected Routes - Accountant */}
      <Route 
        path="/accountant" 
        element={
          <ProtectedRoute allowedRoles={['accountant', 'admin']}>
            <AccountantPanel />
          </ProtectedRoute>
        } 
      />

      {/* Protected Routes - Support */}
      <Route 
        path="/support" 
        element={
          <ProtectedRoute allowedRoles={['support', 'admin']}>
            <SupportPanel />
          </ProtectedRoute>
        } 
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
