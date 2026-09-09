{
  /* MARKER-MAKE-KIT-INVOKED */
}
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Sidebar } from "./components/Sidebar";

// Auth pages
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

// Admin pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AuditsPage } from "./pages/admin/AuditsPage";
import { CreateAudit } from "./pages/admin/CreateAudit";
import { AssignAuditor } from "./pages/admin/AssignAuditor";
import { AuditDetails } from "./pages/admin/AuditDetails";
import { ReportsPage } from "./pages/admin/ReportsPage";
import { ReportDetail } from "./pages/admin/ReportDetail";

// Auditor pages
import { AuditorDashboard } from "./pages/auditor/AuditorDashboard";
import { MyAudits } from "./pages/auditor/MyAudits";
import { AuditWork } from "./pages/auditor/AuditWork";
import { FindingsPage } from "./pages/auditor/FindingsPage";
import { SubmitAudit } from "./pages/auditor/SubmitAudit";
import { EditFindingPage } from "./pages/auditor/EditFindingPage";

// Common pages
import { ProfilePage } from "./pages/ProfilePage";
import { NotFound } from "./pages/NotFound";
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "ADMIN" | "AUDITOR";
}) {
  const { currentUser, loading } = useAuth();
  const token = localStorage.getItem("token");

  if (loading) return null;
  if (!currentUser || !token) return <Navigate to="/login" replace />;

  const userRole = (currentUser.role || "").toUpperCase();

  if (role && userRole !== role) {
    return (
      <Navigate
        to={
          userRole === "ADMIN"
            ? "/admin/dashboard"
            : "/auditor/dashboard"
        }
        replace
      />
    );
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser, loading } = useAuth();
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(currentUser && token);
  const userRole = (currentUser?.role || "").toUpperCase();

  if (loading) return null;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Login />
          ) : (
            <Navigate
              to={
                userRole === "ADMIN"
                  ? "/admin/dashboard"
                  : "/auditor/dashboard"
              }
              replace
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          !isAuthenticated ? (
            <Register />
          ) : (
            <Navigate
              to={
                userRole === "ADMIN"
                  ? "/admin/dashboard"
                  : "/auditor/dashboard"
              }
              replace
            />
          )
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate
              to={
                userRole === "ADMIN"
                  ? "/admin/dashboard"
                  : "/auditor/dashboard"
              }
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="ADMIN">
            <Sidebar />
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audits"
        element={
          <ProtectedRoute role="ADMIN">
            <Sidebar />
            <AuditsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audits/create"
        element={
          <ProtectedRoute role="ADMIN">
            <Sidebar />
            <CreateAudit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audits/:id"
        element={
          <ProtectedRoute role="ADMIN">
            <Sidebar />
            <AuditDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audits/:id/assign"
        element={
          <ProtectedRoute role="ADMIN">
            <Sidebar />
            <AssignAuditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute role="ADMIN">
            <Sidebar />
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
  path="/admin/reports/:id"
  element={
    <ProtectedRoute role="ADMIN">
      <Sidebar />
      <ReportDetail />
    </ProtectedRoute>
  }
/>
      {/* <Route
        path="/admin/profile"
        element={
          <ProtectedRoute role="ADMIN">
            <Sidebar />
            <ProfilePage />
          </ProtectedRoute>
        }
      /> */}

      <Route
        path="/auditor/dashboard"
        element={
          <ProtectedRoute role="AUDITOR">
            <Sidebar />
            <AuditorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditor/my-audits"
        element={
          <ProtectedRoute role="AUDITOR">
            <Sidebar />
            <MyAudits />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditor/audit-work/:id"
        element={
          <ProtectedRoute role="AUDITOR">
            <Sidebar />
            <AuditWork />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditor/findings"
        element={
          <ProtectedRoute role="AUDITOR">
            <Sidebar />
            <FindingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditor/submit/:id"
        element={
          <ProtectedRoute role="AUDITOR">
            <Sidebar />
            <SubmitAudit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditor/profile"
        element={
          <ProtectedRoute role="AUDITOR">
            <Sidebar />
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/findings/edit/:id"
        element={
          <ProtectedRoute role="AUDITOR">
            <Sidebar />
            <EditFindingPage />
          </ProtectedRoute>
        }
      />

      <Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Sidebar />
      <SettingsPage />
    </ProtectedRoute>
  }
/>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
