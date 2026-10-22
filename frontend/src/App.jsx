import {Routes,Route,Navigate} from "react-router";
import TempLogin from "./components/TempLogin";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout  from "./components/AppLayout";
import Register from "./components/Register";

function App()
{
   return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={<TempLogin />}
      />
      <Route
        path="/register"
        element={<Register />}
      />

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
      </Route>

    </Routes>
  );
}
export default App;