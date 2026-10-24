import { NavLink,Outlet,useNavigate } from "react-router";
import { useAuth } from "../Context/AuthContext";

function AppLayout()
{
    const {user,logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
            logout();
            navigate("/login");
    }
     return (
    <div className="app-layout">
      <header className="top-header">
        <h2 className="app-title">Job Intelligence</h2>

        <span className="welcome-text">
          Welcome, {user?.name}
        </span>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <NavLink className="sidebar-link" to="/dashboard">
            Dashboard
          </NavLink>

          <NavLink className="sidebar-link" to="/jobs">
            Jobs
          </NavLink>

          <NavLink className="sidebar-link" to="/profile">
            Profile
          </NavLink>

          <NavLink className="sidebar-link" to="/discover-jobs">
            Discover Jobs
          </NavLink>

          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export default AppLayout;