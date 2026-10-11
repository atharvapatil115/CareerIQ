import {Routes,Route} from "react-router";
import TempLogin from "./components/TempLogin";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout  from "./components/AppLayout";

function App()
{
   return (
    <Routes>

      <Route
        path="/login"
        element={<TempLogin />}
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