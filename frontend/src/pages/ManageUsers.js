import React, { useState, useEffect } from "react";
import { getAllUsers, deleteExistingUser, bulkRegisterUsers, toggleUserLock } from "../services/adminService";
import { Upload, Lock, Unlock, Download } from "lucide-react";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button/Button";
import Badge from "../components/common/Badge/Badge";
import ConfirmDialog from "../components/common/ConfirmDialog/ConfirmDialog";
import "../styles/Dashboard.css";

function ManageUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    try {
      const res = await bulkRegisterUsers(formData);
      showToast(res.message, "success");
      fetchUsers();
    } catch (err) {
      showToast("Bulk registration failed.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleLock = async (id) => {
    try {
      const res = await toggleUserLock(id);
      showToast(res.message, "info");
      fetchUsers();
    } catch (err) {
      showToast("Failed to toggle account lock.", "error");
    }
  };

  const downloadTemplate = () => {
    const csvContent = "name,email,role,department,year,rollNumber\nJohn Doe,john@college.edu,student,Computer Science,3,CS101\nProf. Smith,smith@college.edu,faculty,Mathematics,,";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "user_import_template.csv";
    a.click();
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
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="ghost" onClick={downloadTemplate} style={{ fontSize: '0.85rem' }}>
            <Download size={16} /> Sample CSV
          </Button>
          <label className="custom-file-upload" style={{ cursor: 'pointer', background: 'var(--brand-primary)', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <input type="file" onChange={handleBulkUpload} accept=".csv" style={{ display: 'none' }} disabled={isUploading} />
            <Upload size={16} style={{ display: 'inline', marginRight: '6px' }} />
            {isUploading ? "Processing..." : "Bulk Upload Users"}
          </label>
        </div>
      </header>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
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
                <td>
                  <Badge variant={u.isLocked ? 'danger' : 'success'}>
                    {u.isLocked ? 'LOCKED' : 'ACTIVE'}
                  </Badge>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleLock(u._id)}
                    title={u.isLocked ? "Unlock user account" : "Lock user account"}
                  >
                    {u.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                  </Button>
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



