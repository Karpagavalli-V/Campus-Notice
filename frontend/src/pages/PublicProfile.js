import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Building,
    Calendar,
    Clock,
    BookOpen,
    Linkedin,
    Twitter,
    Github,
    ChevronLeft,
    Users,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicProfile, toggleFollow } from '../services/authService';
import Button from '../components/common/Button/Button';
import Badge from '../components/common/Badge/Badge';
import NoticeCard from '../components/common/NoticeCard/NoticeCard';
import '../styles/Dashboard.css';

const PublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const data = await getPublicProfile(id);
            setUser(data);
            setIsFollowing(data.followers?.some(f => f._id === currentUserId));
        } catch (err) {
            console.error("Error fetching profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            await toggleFollow(id);
            setIsFollowing(!isFollowing);
            fetchProfile(); // Refresh follower count
        } catch (err) {
            console.error("Follow action failed");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return <div className="dashboard-loading"><div className="loader"></div><p>Loading profile...</p></div>;
    if (!user) return <div className="empty-state"><h3>User not found</h3><Button onClick={() => navigate(-1)}>Go Back</Button></div>;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="public-profile-page"
            style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}
        >
            <Button variant="ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
                <ChevronLeft size={18} /> Back
            </Button>

            <motion.section variants={itemVariants} className="profile-header-card" style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', border: '1px solid var(--border-color)', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="profile-avatar-large" style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--gaming-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', color: 'white', overflow: 'hidden', border: '4px solid var(--card-bg)', boxShadow: 'var(--shadow-lg)' }}>
                    {user.profilePic ? (
                        <img src={`http://localhost:5000${user.profilePic}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        user.name?.[0].toUpperCase()
                    )}
                </div>

                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <h1 style={{ margin: 0, fontSize: '2rem' }}>{user.name}</h1>
                        <Badge variant={user.role === 'faculty' ? 'info' : 'success'}>{user.role}</Badge>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building size={16} /> {user.department} {user.year ? `• Year ${user.year}` : ''}
                    </p>

                    <div className="profile-stats" style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: '800', fontSize: '1.25rem' }}>{user.followers?.length || 0}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase' }}>Followers</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: '800', fontSize: '1.25rem' }}>{user.following?.length || 0}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase' }}>Following</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: '800', fontSize: '1.25rem' }}>{user.xp || 0}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase' }}>XP Total</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {id !== currentUserId && (
                            <Button onClick={handleFollow} variant={isFollowing ? "secondary" : "primary"}>
                                {isFollowing ? "Unfollow" : "Follow"}
                            </Button>
                        )}
                        <Button variant="ghost" onClick={() => navigate(`/messages?user=${id}&name=${encodeURIComponent(user.name)}`)}>Message</Button>
                    </div>
                </div>
            </motion.section>

            <div className="profile-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <motion.div variants={itemVariants} className="profile-info-section">
                    <div className="settings-card" style={{ height: '100%' }}>
                        <h3>About</h3>
                        <p style={{ lineHeight: '1.6', opacity: 0.8 }}>{user.bio || "No bio added yet."}</p>

                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {user.officeHours && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Clock size={18} color="var(--brand-primary)" />
                                    <div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase' }}>Office Hours</div>
                                        <div style={{ fontWeight: '600' }}>{user.officeHours}</div>
                                    </div>
                                </div>
                            )}
                            {user.specialization && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <BookOpen size={18} color="var(--brand-primary)" />
                                    <div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase' }}>Specialization</div>
                                        <div style={{ fontWeight: '600' }}>{user.specialization}</div>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Mail size={18} color="var(--brand-primary)" />
                                <div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase' }}>Contact</div>
                                    <div style={{ fontWeight: '600' }}>{user.email}</div>
                                </div>
                            </div>
                        </div>

                        {(user.socialLinks?.linkedin || user.socialLinks?.twitter || user.socialLinks?.github) && (
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                {user.socialLinks.linkedin && <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="social-icon-btn"><Linkedin size={20} /></a>}
                                {user.socialLinks.twitter && <a href={user.socialLinks.twitter} target="_blank" rel="noreferrer" className="social-icon-btn"><Twitter size={20} /></a>}
                                {user.socialLinks.github && <a href={user.socialLinks.github} target="_blank" rel="noreferrer" className="social-icon-btn"><Github size={20} /></a>}
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="profile-notices-section">
                    <div className="settings-card" style={{ height: '100%' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} color="var(--brand-primary)" /> Recent Activity
                        </h3>
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {user.recentNotices?.length > 0 ? (
                                user.recentNotices.map(notice => (
                                    <NoticeCard
                                        key={notice._id}
                                        notice={{ ...notice, createdBy: user }}
                                        isSaved={false} // Default for public view
                                        onToggleSave={() => { }} // Could be implemented later
                                        onClick={() => navigate(`/notice/${notice._id}`)}
                                    />
                                ))
                            ) : (
                                <p style={{ opacity: 0.5, textAlign: 'center', padding: '2rem' }}>No recent notices published.</p>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PublicProfile;
