import React, { useEffect, useState } from "react";
import { BellOff, X } from "lucide-react";
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

    if (loading) return <div className="dashboard-loading"><div className="loader"></div><p>Loading notifications...</p></div>;

    return (
        <div className="notifications-page">
            <header className="dashboard-header">
                <div>
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-subtitle">Stay updated with your latest campus alerts.</p>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <Button onClick={handleMarkAllRead}>Mark All as Read</Button>
                )}
            </header>

            <div className="notifications-list-container">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon-wrapper">
                            <BellOff size={48} />
                        </div>
                        <h3>No Notifications</h3>
                        <p>You're all caught up!</p>
                    </div>
                ) : (
                    <div className="all-notifications-list">
                        {notifications.map(n => (
                            <div
                                key={n._id}
                                className={`notification-card ${!n.isRead ? 'unread' : ''}`}
                                onClick={() => handleRead(n._id, n.isRead)}
                            >
                                <div className="notif-content">
                                    <div className="notif-header">
                                        <h4>{n.title}</h4>
                                        <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p>{n.message}</p>
                                    {n.noticeId && (
                                        <a href={`/notice/${n.noticeId}`} className="view-link">View Related Notice</a>
                                    )}
                                </div>
                                <button className="delete-btn" onClick={(e) => handleDelete(e, n._id)} title="Delete">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
        </div>
    );
};

export default NotificationsPage;

