import React, { useEffect, useState } from "react";
import { BellOff, X, Bell, CheckCircle2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getMyNotifications, markAllAsRead, markAsRead, deleteNotification } from "../services/notificationService";
import Button from "../components/common/Button/Button";
import ConfirmDialog from "../components/common/ConfirmDialog/ConfirmDialog";
import "../styles/Dashboard.css";
import "./NotificationsPage.css";

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, notifId: null });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getMyNotifications();
            setNotifications(data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            fetchNotifications();
        } catch (err) {
            console.error("Error marking all as read", err);
        }
    };

    const handleRead = async (id, isRead) => {
        if (!isRead) {
            try {
                await markAsRead(id);
                fetchNotifications();
            } catch (err) {
                console.error("Error marking read", err);
            }
        }
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        setConfirmDialog({ isOpen: true, notifId: id });
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteNotification(confirmDialog.notifId);
            fetchNotifications();
        } catch (err) {
            console.error("Error deleting notification", err);
        } finally {
            setConfirmDialog({ isOpen: false, notifId: null });
        }
    };

    const handleCancelDelete = () => {
        setConfirmDialog({ isOpen: false, notifId: null });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    if (loading) return (
        <div className="dashboard-loading">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="loader" 
            />
            <p>Loading notifications...</p>
        </div>
    );

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="notifications-page"
        >
            <motion.header variants={itemVariants} className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Bell size={28} style={{ color: 'var(--brand-primary)' }} /> Notifications
                    </h1>
                    <p className="page-subtitle">Stay updated with your latest campus alerts.</p>
                </div>
                <AnimatePresence>
                    {notifications.some(n => !n.isRead) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Button onClick={handleMarkAllRead} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={16} /> Mark All as Read
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            <div className="notifications-list-container">
                <AnimatePresence mode="popLayout">
                    {notifications.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="empty-state"
                            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '4rem 2rem' }}
                        >
                            <div className="empty-icon-wrapper" style={{ marginBottom: '1.5rem', background: 'rgba(var(--brand-primary-rgb), 0.1)', color: 'var(--brand-primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <BellOff size={40} />
                            </div>
                            <h3>No Notifications</h3>
                            <p style={{ opacity: 0.7 }}>You're all caught up!</p>
                        </motion.div>
                    ) : (
                        <motion.div key="list" className="all-notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {notifications.map((n, idx) => (
                                <motion.div
                                    key={n._id}
                                    variants={itemVariants}
                                    layout
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, scale: 0.95, x: 20 }}
                                    className={`notification-card ${!n.isRead ? 'unread' : ''}`}
                                    onClick={() => handleRead(n._id, n.isRead)}
                                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(var(--brand-primary-rgb), 0.05)' }}
                                    style={{ 
                                        cursor: 'pointer', 
                                        position: 'relative', 
                                        padding: '1.25rem', 
                                        borderRadius: '16px', 
                                        background: n.isRead ? 'var(--card-bg)' : 'rgba(var(--brand-primary-rgb), 0.03)',
                                        border: n.isRead ? '1px solid var(--border-color)' : '1px solid var(--brand-primary)',
                                        boxShadow: n.isRead ? 'none' : '0 4px 12px rgba(var(--brand-primary-rgb), 0.1)'
                                    }}
                                >
                                    <div className="notif-content">
                                        <div className="notif-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{n.title}</h4>
                                            <span className="notif-time" style={{ fontSize: '0.75rem', opacity: 0.6 }}>{new Date(n.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p style={{ margin: '0.5rem 0', opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5 }}>{n.message}</p>
                                        {n.noticeId && (
                                            <a 
                                                href={`/notice/${n.noticeId}`} 
                                                className="view-link" 
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', fontWeight: '600', textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}
                                            >
                                                View Related Notice →
                                            </a>
                                        )}
                                    </div>
                                    <motion.button 
                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                                        whileTap={{ scale: 0.9 }}
                                        className="delete-btn" 
                                        onClick={(e) => handleDelete(e, n._id)} 
                                        title="Delete"
                                        style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', padding: '6px', borderRadius: '8px', opacity: 0.5, transition: 'opacity 0.2s', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={16} />
                                    </motion.button>
                                    {!n.isRead && (
                                        <div className="unread-dot" style={{ position: 'absolute', left: '-4px', top: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-primary)' }} />
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Delete Notification"
                message="Are you sure you want to delete this notification?"
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </motion.div>
    );
};

export default NotificationsPage;
