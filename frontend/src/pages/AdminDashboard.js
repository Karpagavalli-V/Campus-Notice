import { useState, useEffect } from "react";
import { TrendingUp, Users, FileText } from "lucide-react";
import { getAdminStats, createNewUser } from "../services/adminService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button/Button";
import "../styles/Dashboard.css";
import "../styles/Form.css";

function AdminDashboard() {
  const { showToast } = useToast();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "faculty",
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createNewUser(user);
      showToast("User created successfully!", "success");
      setUser({ name: "", email: "", password: "", role: "faculty" });
      fetchStats();
    } catch (err) {
      showToast("Error creating user. Please try again.", "error");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading overview...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1 className="page-title">Admin Overview</h1>
        <p className="page-subtitle">Manage campus users and system performance.</p>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{stats.totalUsers}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Notices</span>
          <span className="stat-value">{stats.totalNotices}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Groups</span>
          <span className="stat-value">4</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">System Health</span>
          <span className="stat-value">100%</span>
        </div>
      </section>

      <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
        <Button variant="outline" onClick={() => (window.location.href = "/admin/analytics")} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          View Detailed Analytics <TrendingUp size={16} />
        </Button>
      </div>

      <div className="content-grid-two-cols">
        <section className="admin-action-section">
          <div className="section-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="action-card-form">
            <h4>Register New User</h4>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  className="form-input"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={user.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  className="form-input"
                  name="email"
                  type="email"
                  placeholder="e.g. john@university.edu"
                  value={user.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Default Password</label>
                <input
                  className="form-input"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={user.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Assign Role</label>
                <select
                  className="form-select"
                  name="role"
                  value={user.role}
                  onChange={handleChange}
                >
                  <option value="faculty">Faculty</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <Button type="submit" className="w-full">
                Create User Account
              </Button>
            </form>
          </div>
        </section>

        <section className="system-logs-section">
          <div className="section-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">
                <Users size={18} />
              </span>
              <div className="activity-details">
                <p>New faculty member registered</p>
                <small>2 minutes ago</small>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">
                <FileText size={18} />
              </span>
              <div className="activity-details">
                <p>Physics Dept. posted a new notice</p>
                <small>1 hour ago</small>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
export default AdminDashboard;
