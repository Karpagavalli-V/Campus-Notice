import { useEffect, useState } from "react";
import { getAllUsers, deleteExistingUser } from "../services/adminService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button/Button";
import Badge from "../components/common/Badge/Badge";
import ConfirmDialog from "../components/common/ConfirmDialog/ConfirmDialog";
import "../styles/Dashboard.css";

function ManageUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, userId: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (id) => {
    setConfirmDialog({ isOpen: true, userId: id });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteExistingUser(confirmDialog.userId);
      showToast("User deleted successfully.", "success");
      fetchUsers();
    } catch (error) {
      showToast("Failed to delete user.", "error");
    } finally {
      setConfirmDialog({ isOpen: false, userId: null });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, userId: null });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="manage-users-page">
      <header className="dashboard-header">
        <h1 className="page-title">Manage Users</h1>
        <p className="page-subtitle">View and moderate campus user accounts.</p>
      </header>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <div className="user-table-avatar">
                    {u.profilePic ? (
                      <img src={`http://localhost:5000${u.profilePic}`} alt="" />
                    ) : (
                      <span>{u.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </td>
                <td className="font-semibold">{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <Badge variant={u.role === 'admin' ? 'secondary' : u.role === 'faculty' ? 'info' : 'success'}>
                    {u.role.toUpperCase()}
                  </Badge>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUser(u._id)}
                    style={{ color: 'var(--status-high)' }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete User"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default ManageUsers;



