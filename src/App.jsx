import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/dashboards/Dashboard';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeForm from './pages/employees/EmployeeForm';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hr_officer', 'department_head']}>
                <MainLayout>
                  <EmployeeList />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/add"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hr_officer']}>
                <MainLayout>
                  <EmployeeForm />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="page-placeholder">
                    <h1>My Profile</h1>
                    <p>Profile management coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hr_officer']}>
                <MainLayout>
                  <div className="page-placeholder">
                    <h1>Departments</h1>
                    <p>Department management coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave-requests"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="page-placeholder">
                    <h1>Leave Requests</h1>
                    <p>Leave request management coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="page-placeholder">
                    <h1>Attendance</h1>
                    <p>Attendance tracking coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/performance"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="page-placeholder">
                    <h1>Performance Reviews</h1>
                    <p>Performance management coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hr_officer', 'finance_officer']}>
                <MainLayout>
                  <div className="page-placeholder">
                    <h1>Reports</h1>
                    <p>Reporting module coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
