import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Lock, User, Users, Shield, LogOut } from 'lucide-react';
import api from '../services/apiService';
import Button from '../components/common/Button/Button';
import './ProfileSettings.css';

const ProfileSettings = () => {
    const [profile, setProfile] = useState({
        name: localStorage.getItem('name') || '',
        email: localStorage.getItem('email') || '',
        profilePic: localStorage.getItem('profilePic') || '',
        bio: '',
        officeHours: '',
        specialization: '',
        socialLinks: { linkedin: '', twitter: '', github: '' }
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
        fetchMyProfile();
    }, []);

    const fetchMyProfile = async () => {
        try {
            const currentUserId = localStorage.getItem('id');
            const data = await import('../services/authService').then(m => m.getPublicProfile(currentUserId));
            setProfile(prev => ({
                ...prev,
                bio: data.bio || '',
                officeHours: data.officeHours || '',
                specialization: data.specialization || '',
                socialLinks: data.socialLinks || { linkedin: '', twitter: '', github: '' }
            }));
            setPreviewUrl(data.profilePic || '');
        } catch (err) {
            console.error("Error fetching my profile:", err);
        }
    };

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
            formData.append('bio', profile.bio);
            formData.append('officeHours', profile.officeHours);
            formData.append('specialization', profile.specialization);
            formData.append('socialLinks', JSON.stringify(profile.socialLinks));
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

            // Clear status after 3 seconds
            setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
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

            setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Change failed' });
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="profile-settings-page"
        >
            <motion.header variants={cardVariants} className="dashboard-header">
                <h1 className="page-title">Account Settings</h1>
                <p className="page-subtitle">Manage your personal information and security.</p>
            </motion.header>

            <AnimatePresence>
                {status.msg && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className={`status-alert ${status.type}`}
                        style={{ overflow: 'hidden' }}
                    >
                        {status.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="settings-grid">
                <motion.section variants={cardVariants} className="settings-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={20} style={{ color: 'var(--brand-primary)' }} /> Update Profile
                    </h3>
                    <form onSubmit={handleProfileUpdate} className="settings-form">
                        <div className="profile-pic-editor">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="avatar-preview"
                                style={{ position: 'relative', cursor: 'pointer' }}
                                onClick={() => document.getElementById('pic-upload').click()}
                            >
                                {previewUrl ? (
                                    <img
                                        src={previewUrl.startsWith('blob:') ? previewUrl : `http://localhost:5000${previewUrl}`}
                                        alt="ProfilePreview"
                                    />
                                ) : (
                                    <div className="avatar-placeholder">{profile.name?.[0]?.toUpperCase()}</div>
                                )}
                                <div className="avatar-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', borderRadius: 'inherit' }}>
                                    <Camera color="white" />
                                </div>
                            </motion.div>
                            <div className="pic-upload-controls">
                                <label className="custom-file-upload">
                                    <input id="pic-upload" type="file" onChange={handleFileChange} accept="image/*" />
                                    Choose Photo
                                </label>
                                <p className="help-text">JPG, PNG or GIF. Max 2MB.</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Bio (About Me)</label>
                            <textarea
                                className="form-input"
                                rows="3"
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                placeholder="Write a short introduction..."
                            />
                        </div>

                        {localStorage.getItem('role') === 'faculty' && (
                            <>
                                <div className="form-group">
                                    <label>Office Hours</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={profile.officeHours}
                                        onChange={(e) => setProfile({ ...profile, officeHours: e.target.value })}
                                        placeholder="e.g. Mon-Fri, 10 AM - 12 PM"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Specialization / Department Focus</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={profile.specialization}
                                        onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                                        placeholder="e.g. Artificial Intelligence, VLSI"
                                    />
                                </div>
                            </>
                        )}

                        <div className="social-links-editor">
                            <label>Social Links</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={profile.socialLinks.linkedin}
                                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, linkedin: e.target.value } })}
                                    placeholder="LinkedIn URL"
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    value={profile.socialLinks.twitter}
                                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, twitter: e.target.value } })}
                                    placeholder="Twitter URL"
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    value={profile.socialLinks.github}
                                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, github: e.target.value } })}
                                    placeholder="GitHub URL"
                                />
                            </div>
                        </div>

                        <Button type="submit">Update Information</Button>
                    </form>
                </motion.section>

                <motion.section variants={cardVariants} className="settings-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={20} style={{ color: 'var(--brand-primary)' }} /> Change Password
                    </h3>
                    <form onSubmit={handlePasswordChange} className="settings-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <div className="input-with-icon">
                                <Lock size={16} className="field-icon" />
                                <input
                                    type="password"
                                    className="form-input"
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <div className="input-with-icon">
                                <Lock size={16} className="field-icon" />
                                <input
                                    type="password"
                                    className="form-input"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <div className="input-with-icon">
                                <Lock size={16} className="field-icon" />
                                <input
                                    type="password"
                                    className="form-input"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit">Change Password</Button>
                    </form>
                </motion.section>

                <motion.section variants={cardVariants} className="settings-card connection-card" style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} style={{ color: 'var(--brand-primary)' }} /> My Connections
                    </h3>
                    <div className="connections-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                        <div className="following-list">
                            <h4 style={{ marginBottom: '1.25rem', color: 'var(--brand-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Following ({connections.following.length})</h4>
                            <div className="user-scroll-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <AnimatePresence mode="popLayout">
                                    {connections.following.map(user => (
                                        <motion.div
                                            key={user._id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="user-connection-item"
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div className="avatar-placeholder-sm" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gaming-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{user.name?.[0]}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user.name}</span>
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{user.role} • {user.department}</span>
                                                </div>
                                            </div>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button size="sm" variant="ghost" onClick={() => handleUnfollow(user._id)} style={{ color: 'var(--status-high)', fontSize: '0.75rem', fontWeight: '600' }}>Unfollow</Button>
                                            </motion.div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {connections.following.length === 0 && <p style={{ fontSize: '0.85rem', opacity: 0.6, textAlign: 'center', marginTop: '1rem' }}>You are not following anyone yet.</p>}
                            </div>
                        </div>

                        <div className="followers-list">
                            <h4 style={{ marginBottom: '1.25rem', color: 'var(--brand-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Followers ({connections.followers.length})</h4>
                            <div className="user-scroll-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <AnimatePresence>
                                    {connections.followers.map(user => (
                                        <motion.div
                                            key={user._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="user-connection-item"
                                            style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}
                                        >
                                            <div className="avatar-placeholder-sm" style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gaming-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{user.name?.[0]}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user.name}</span>
                                                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{user.role} • {user.department}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {connections.followers.length === 0 && <p style={{ fontSize: '0.85rem', opacity: 0.6, textAlign: 'center', marginTop: '1rem' }}>No ones follows you yet.</p>}
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </motion.div>
    );
};

export default ProfileSettings;
