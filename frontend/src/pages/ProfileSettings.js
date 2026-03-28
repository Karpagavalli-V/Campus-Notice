import React, { useState } from 'react';
import api from '../services/apiService';
import Button from '../components/common/Button/Button';
import './ProfileSettings.css';

const ProfileSettings = () => {
    const [profile, setProfile] = useState({
        name: localStorage.getItem('name') || '',
        email: localStorage.getItem('email') || '',
        profilePic: localStorage.getItem('profilePic') || ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(profile.profilePic);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [connections, setConnections] = useState({ following: [], followers: [] });

    React.useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        try {
            const data = await import('../services/authService').then(m => m.getConnections());
            setConnections(data);
        } catch (err) {
            console.error("Error fetching connections:", err);
        }
    };

    const handleUnfollow = async (id) => {
        try {
            await import('../services/authService').then(m => m.toggleFollow(id));
            fetchConnections();
        } catch (err) {
            console.error("Failed to unfollow");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', profile.name);
            formData.append('email', profile.email);
            if (selectedFile) {
                formData.append('profilePic', selectedFile);
            }

            const res = await api.put('/auth/update-profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            localStorage.setItem('name', res.data.user.name);
            localStorage.setItem('profilePic', res.data.user.profilePic);
            setProfile({ ...profile, profilePic: res.data.user.profilePic });
            setStatus({ type: 'success', msg: 'Profile updated successfully!' });
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Update failed' });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setStatus({ type: 'error', msg: 'Passwords do not match' });
        }
        try {
            await api.put('/auth/change-password', passwords);
            setStatus({ type: 'success', msg: 'Password changed successfully!' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Change failed' });
        }
    };

    return (
        <div className="profile-settings-page">
            <header className="dashboard-header">
                <h1 className="page-title">Account Settings</h1>
                <p className="page-subtitle">Manage your personal information and security.</p>
            </header>

            {status.msg && (
                <div className={`status-alert ${status.type}`}>
                    {status.msg}
                </div>
            )}

            <div className="settings-grid">
                <section className="settings-card">
                    <h3>Update Profile</h3>
                    <form onSubmit={handleProfileUpdate} className="settings-form">
                        <div className="profile-pic-editor">
                            <div className="avatar-preview">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl.startsWith('blob:') ? previewUrl : `http://localhost:5000${previewUrl}`}
                                        alt="ProfilePreview"
                                    />
                                ) : (
                                    <div className="avatar-placeholder">{profile.name?.[0]?.toUpperCase()}</div>
                                )}
                            </div>
                            <div className="pic-upload-controls">
                                <label className="custom-file-upload">
                                    <input type="file" onChange={handleFileChange} accept="image/*" />
                                    Choose Photo
                                </label>
                                <p className="help-text">JPG, PNG or GIF. Max 2MB.</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit">Update Information</Button>
                    </form>
                </section>

                <section className="settings-card">
                    <h3>Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="settings-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit">Change Password</Button>
                    </form>
                </section>

                <section className="settings-card connection-card" style={{ gridColumn: '1 / -1' }}>
                    <h3>My Connections</h3>
                    <div className="connections-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                        <div className="following-list">
                            <h4 style={{ marginBottom: '1rem', color: 'var(--brand-primary)' }}>Following ({connections.following.length})</h4>
                            <div className="user-scroll-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {connections.following.map(user => (
                                    <div key={user._id} className="user-connection-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="avatar-placeholder-sm" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--gaming-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>{user.name?.[0]}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</span>
                                                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user.role} • {user.department}</span>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => handleUnfollow(user._id)} style={{ color: 'var(--status-high)', fontSize: '0.75rem' }}>Unfollow</Button>
                                    </div>
                                ))}
                                {connections.following.length === 0 && <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>You are not following anyone yet.</p>}
                            </div>
                        </div>

                        <div className="followers-list">
                            <h4 style={{ marginBottom: '1rem', color: 'var(--brand-primary)' }}>Followers ({connections.followers.length})</h4>
                            <div className="user-scroll-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {connections.followers.map(user => (
                                    <div key={user._id} className="user-connection-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                        <div className="avatar-placeholder-sm" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--gaming-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>{user.name?.[0]}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user.role} • {user.department}</span>
                                        </div>
                                    </div>
                                ))}
                                {connections.followers.length === 0 && <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>No ones follows you yet.</p>}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfileSettings;
