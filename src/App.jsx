import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/Layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboards/Dashboard";
import EmployeeList from "./pages/employees/EmployeeList";
import EmployeeForm from "./pages/employees/EmployeeForm";
import DepartmentList from "./pages/departments/DepartmentList";
import LeaveList from "./pages/leave/LeaveList";
import Reports from "./pages/reports/Reports";
import PerformanceList from "./pages/performance/PerformanceList";
import PerformanceForm from "./pages/performance/PerformanceForm";
import "./App.css";

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
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "hr_officer",
                  "department_head",
                  "finance_officer",
                ]}
              >
                <MainLayout>
                  <EmployeeList filterRole="employee" />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/heads"
            element={
              <ProtectedRoute allowedRoles={["admin", "hr_officer"]}>
                <MainLayout>
                  <EmployeeList filterRole="head" />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "hr_officer"]}>
                <MainLayout>
                  <EmployeeForm userType="employee" />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/heads/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "hr_officer"]}>
                <MainLayout>
                  <EmployeeForm userType="head" />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute allowedRoles={["admin", "hr_officer"]}>
                <MainLayout>
                  <DepartmentList />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/leave-requests"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <LeaveList />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute
                allowedRoles={["admin", "hr_officer", "finance_officer"]}
              >
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/performance"
            element={
              <ProtectedRoute allowedRoles={["admin", "head", "employee"]}>
                <MainLayout>
                  <PerformanceList />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/performance/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "head"]}>
                <MainLayout>
                  <PerformanceForm />
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
