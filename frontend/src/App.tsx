import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import { Role } from './types';

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Companies = lazy(() => import('./pages/Companies'));
const Users = lazy(() => import('./pages/Users'));
const Categories = lazy(() => import('./pages/Categories'));
const Items = lazy(() => import('./pages/Items'));
const Reports = lazy(() => import('./pages/Reports'));
const ForgotPasswordFlow = lazy(() => import('./pages/ForgotPasswordFlow'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));

// Loading component
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Role-based Route Guard
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: Role[] }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
        
        <Route element={<DashboardLayout />}>
          {/* Dashboard for Managers and Viewers */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute allowedRoles={[Role.SuperAdmin, Role.CompanyAdmin, Role.Manager, Role.Viewer]}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* SuperAdmin Routes */}
          <Route 
            path="/companies" 
            element={
              <ProtectedRoute allowedRoles={[Role.SuperAdmin]}>
                <Companies />
              </ProtectedRoute>
            } 
          />
          
          {/* CompanyAdmin Routes */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={[Role.CompanyAdmin]}>
                <Users />
              </ProtectedRoute>
            } 
          />
          
          {/* Manager & Viewer Routes */}
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute allowedRoles={[Role.Manager, Role.Viewer]}>
                <Categories />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/items" 
            element={
              <ProtectedRoute allowedRoles={[Role.Manager, Role.Viewer]}>
                <Items />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={[Role.CompanyAdmin, Role.Manager, Role.Viewer]}>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute allowedRoles={[Role.SuperAdmin, Role.CompanyAdmin, Role.Manager, Role.Viewer]}>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute allowedRoles={[Role.SuperAdmin, Role.CompanyAdmin, Role.Manager, Role.Viewer]}>
                <Notifications />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
