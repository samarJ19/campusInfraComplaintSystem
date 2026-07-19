import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoutes";
import StudentDashboard from "../pages/student/StudentDashboard";
import CreateComplaintPage from "../pages/complaint/CreateComplaint";

function FacultyDashboard() {
  return <h1>Faculty Dashboard</h1>;
}

function MaintenanceDashboard() {
  return <h1>Maintenance Dashboard</h1>;
}

function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button
        onClick={() => {
          logout();
        }}
      >
        {" "}
        logout{" "}
      </button>
    </div>
  );
}

function Unauthorized() {
  return <h1>Unauthorized</h1>;
}

function HomePage() {
  const { user, logout } = useAuth();
  return (
    <div>
      User : {user?.name} <br />
      Role: {user?.role} <br />
      <button onClick={() => {logout()}}> LogOut </button>
    </div>
  )
}
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/create"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <CreateComplaintPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={["FACULTY"]}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/maintenance"
          element={
            <ProtectedRoute allowedRoles={["MAINTENANCE"]}>
              <MaintenanceDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
