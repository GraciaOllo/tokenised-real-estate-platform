// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';  // <-- Import ChatProvider here
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

import HomePage from './pages/HomePage';
import Properties from './pages/properties';
import Dashboard from './pages/Dashboard';
import PropertyDetail from './pages/admin/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Notifications from './pages/Notifications';
import Profile from './pages/profile';
import UserManagement from './pages/admin/UserManagement';
import InvestorProperties from './pages/investor/InvestorProperties';
import InvestorTransactions from './pages/investor/InvestorTransactions';
import ManagerProperties from './pages/manager/ManagerProperties';
import AddProperty from './pages/manager/AddProperty';
import PropertyManagement from './pages/admin/PropertyManagement';
import TenantManagement from './pages/admin/TenantManagement';
import ManagerTenantManagement from './pages/manager/ManagerTenantManagement';
import NotFound from './pages/NotFound';
import Chat from './components/Chat';
import OwnerPropertyAnalytics from './pages/manager/PropertyAnalytics';

function App() {
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  return (
    <AuthProvider>
      <ChatProvider> {/* <-- Wrap your app with ChatProvider */}
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/properties"
                element={<Properties />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Notifications />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Profile />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <DashboardLayout>
                      <Routes>
                        <Route path="users" element={<UserManagement />} />
                        <Route path="properties" element={<PropertyManagement/>} />
                        <Route path="properties/propertyDetail" element={<PropertyDetail/>} />
                        <Route path="tenants" element={<TenantManagement/>} />
                        <Route path="analytics" element={<OwnerPropertyAnalytics/>} />
                        <Route path="chat" element = {<Chat isOpen={false} onClose={function (): void {
                          throw new Error('Function not implemented.');
                        } }/>} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/*"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <DashboardLayout>
                      <Routes>
                        <Route path="properties" element={<ManagerProperties />} />
                        <Route path="add-property" element={<AddProperty />} />
                        <Route path="tenants" element={<ManagerTenantManagement />} />
                        <Route path="analytics" element={<OwnerPropertyAnalytics/>} />
                        <Route path="messages" element={<Chat isOpen={false} onClose={function (): void {
                          throw new Error('Function not implemented.');
                        } } />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/investor/*"
                element={
                  <ProtectedRoute allowedRoles={['investor']}>
                    <DashboardLayout>
                      <Routes>
                        <Route path="properties" element={<InvestorProperties />} />
                        <Route path="transactions" element={<InvestorTransactions />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenant/*"
                element={
                  <ProtectedRoute allowedRoles={['tenant']}>
                    <DashboardLayout>
                      <Routes>
                        <Route path="rent" element={<div>Pay Rent</div>} />
                        <Route path="history" element={<div>Payment History</div>} />
                        <Route path="property" element={<div>My Property</div>} />
                        <Route path="chats" element={<Chat isOpen={true} onClose={function (): void {
                          throw new Error('Function not implemented.');
                        } }/>} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Global Chat Component */}
            <Chat
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />

            {/* Chat Toggle Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-4 right-4 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-colors z-40"
              aria-label="Open chat"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#f9fafb',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                },
              }}
            />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
