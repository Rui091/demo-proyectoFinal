import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Requests from './pages/Requests';
import AuditLog from './pages/AuditLog';
import SecuritySettings from './pages/SecuritySettings';
import ProtectedLayout from './components/ProtectedLayout';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/security" element={<SecuritySettings />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* Add other protected routes here */}
          </Route>
        </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
