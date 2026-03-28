import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { getMyNotifications, markAsRead, markAllAsRead } from "../../services/notificationService";
import "./NotificationBell.css";

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Poll for notifications every 60 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getMyNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await markAsRead(notification._id);
                fetchNotifications();
            } catch (error) {
                console.error("Error marking as read:", error);
            }
        }
        setShowDropdown(false);
        if (notification.noticeId) {
            navigate(`/notice/${notification.noticeId}`);
        } else {
            navigate("/notifications");
        }
    };

    const handleMarkAllRead = async (e) => {
        e.stopPropagation();
        try {
            await markAllAsRead();
            fetchNotifications();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <div className="bell-icon-wrapper" onClick={() => setShowDropdown(!showDropdown)}>
                <span className="bell-icon">
                    <Bell size={20} />
                </span>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={handleMarkAllRead}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <p className="no-notifications">No notifications</p>
                        ) : (
                            notifications.slice(0, 5).map(n => (
                                <div
                                    key={n._id}
                                    className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <div className="notification-title">{n.title}</div>
                                    <div className="notification-message">{n.message}</div>
                                    <div className="notification-time">
                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="notification-footer">
                        <Link to="/notifications" onClick={() => setShowDropdown(false)}>
                            View All Notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
