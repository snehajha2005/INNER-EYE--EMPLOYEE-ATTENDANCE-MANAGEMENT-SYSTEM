import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AttendanceHistory from './pages/AttendanceHistory';
import EmployeeLeaves from './pages/EmployeeLeaves';
import HRDashboard from './pages/HRDashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import HRLeaves from './pages/HRLeaves';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Common Protected Route (Accessible by both HR and Employee) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Protected Employee Routes */}
          <Route element={<ProtectedRoute allowedRole="employee" />}>
            <Route element={<AppLayout />}>
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/employee/history" element={<AttendanceHistory />} />
              <Route path="/employee/leaves" element={<EmployeeLeaves />} />
            </Route>
          </Route>

          {/* Protected HR Routes */}
          <Route element={<ProtectedRoute allowedRole="hr" />}>
            <Route element={<AppLayout />}>
              <Route path="/hr" element={<HRDashboard />} />
              <Route path="/hr/employees" element={<EmployeeManagement />} />
              <Route path="/hr/attendance" element={<AttendanceManagement />} />
              <Route path="/hr/leaves" element={<HRLeaves />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
