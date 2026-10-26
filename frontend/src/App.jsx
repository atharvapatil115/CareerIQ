
import { Routes, Route, Navigate } from "react-router";

import TempLogin from "./components/TempLogin";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import DiscoverJobs from "./pages/DiscoverJobs";
import LoginLoadingOverlay from "./components/LoginLoadingOverlay";


function App() {
  const { isLoggingIn } = useAuth();
  return (
    <Routes>
      {/* Default route */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Public routes */}
      <Route
        path="/login"
        element={<TempLogin />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Protected routes with shared layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/discover-jobs"
          element={<DiscoverJobs />}
        />
      </Route>
       {isLoggingIn && <LoginLoadingOverlay />}
    </Routes>
    
  );
}

export default App;
