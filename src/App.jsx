import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InventoryList from './pages/InventoryList';
import BorrowingManagement from './pages/BorrowingManagement';
import TransactionLogs from './pages/TransactionLogs';
import IncomingForm from './pages/IncomingForm';
import WithdrawalForm from './pages/WithdrawalForm';
import BorrowForm from './pages/BorrowForm';
import AccountManagement from './pages/AccountManagement';
import Settings from './pages/Settings';
import Help from './pages/Help';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <ToastProvider>
          <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/inventory" element={<InventoryList />} />
                <Route path="/borrowing" element={<BorrowingManagement />} />
                <Route path="/borrow-form" element={<BorrowForm />} />
                <Route path="/withdrawal" element={<WithdrawalForm />} />
                <Route path="/help" element={<Help />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route
                element={
                  <AdminRoute>
                    <Layout />
                  </AdminRoute>
                }
              >
                <Route path="/transactions" element={<TransactionLogs />} />
                <Route path="/incoming" element={<IncomingForm />} />
                <Route path="/accounts" element={<AccountManagement />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </InventoryProvider>
    </AuthProvider>
  );
}
