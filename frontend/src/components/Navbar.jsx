import { Link } from "react-router";


function Navbar({ username }) {
  return (
    <nav>
      <h2>Job Intelligence</h2>

      <div>
        <span>Welcome, {username}</span>

        <Link to="/dashboard">Dashboard</Link>
        <Link to="/jobs">Jobs</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/discover-jobs">Profile</Link>
      </div>
    </nav>
  );
}
export default Navbar;