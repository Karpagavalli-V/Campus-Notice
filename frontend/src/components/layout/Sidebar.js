import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    Search,
    Compass,
    MessageCircle,
    Bell,
    PlusSquare,
    User,
    LogOut,
    Menu,
    Calendar,
    Archive,
    BarChart2,
    Sun,
    Moon,
    Users,
    Trophy,
    Download
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ userRole, isOpen, isDarkMode, onToggleTheme }) => {
    const navigate = useNavigate();
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            setDeferredPrompt(null);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const studentLinks = [
        { path: '/student', label: 'Home', icon: <Home size={28} /> },
        { path: '/search', label: 'Search', icon: <Search size={28} /> },
        { path: '/messages', label: 'Messages', icon: <MessageCircle size={28} /> },
        { path: '/groups', label: 'Groups', icon: <Users size={28} /> },
        { path: '/notifications', label: 'Notifications', icon: <Bell size={28} /> },
        { path: '/calendar', label: 'Events', icon: <Calendar size={28} /> },
        { path: '/leaderboard', label: 'Ranks', icon: <Trophy size={28} /> },
        { path: '/profile', label: 'Profile', icon: <User size={28} /> },
    ];

    const facultyLinks = [
        { path: '/faculty', label: 'Home', icon: <Home size={28} /> },
        { path: '/manage-notices', label: 'Create', icon: <PlusSquare size={28} /> },
        { path: '/faculty/analytics', label: 'Analytics', icon: <BarChart2 size={28} /> },
        { path: '/messages', label: 'Messages', icon: <MessageCircle size={28} /> },
        { path: '/groups', label: 'Groups', icon: <Users size={28} /> },
        { path: '/calendar', label: 'Events', icon: <Calendar size={28} /> },
        { path: '/archive', label: 'Archive', icon: <Archive size={28} /> },
        { path: '/leaderboard', label: 'Impact', icon: <Trophy size={28} /> },
        { path: '/profile', label: 'Settings', icon: <User size={28} /> },
    ];

    const adminLinks = [
        { path: '/admin', label: 'Home', icon: <Home size={28} /> },
        { path: '/admin/analytics', label: 'Insights', icon: <BarChart2 size={28} /> },
        { path: '/manage-users', label: 'Users', icon: <PlusSquare size={28} /> },
        { path: '/manage-notices', label: 'Manage', icon: <PlusSquare size={28} /> },
        { path: '/groups', label: 'Communities', icon: <Users size={28} /> },
        { path: '/calendar', label: 'Calendar', icon: <Calendar size={28} /> },
        { path: '/leaderboard', label: 'Badges', icon: <Trophy size={28} /> },
        { path: '/profile', label: 'Settings', icon: <User size={28} /> },
    ];

    const links = userRole === 'admin' ? adminLinks :
        userRole === 'faculty' ? facultyLinks :
            studentLinks;

    return (
        <aside className={`insta-sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-logo">
                <h1 className="logo-text">Campus</h1>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {links.map((link) => (
                        <li key={link.path} className="nav-item">
                            <NavLink
                                to={link.path}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{link.icon}</span>
                                <span className="nav-text">{link.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                {deferredPrompt && (
                    <div className="nav-link theme-btn install-btn" onClick={handleInstallClick} style={{ color: '#06b6d4' }}>
                        <span className="nav-icon"><Download size={28} /></span>
                        <span className="nav-text">Install App</span>
                    </div>
                )}
                <div className="nav-link theme-btn" onClick={onToggleTheme}>
                    <span className="nav-icon">
                        {isDarkMode ? <Sun size={28} /> : <Moon size={28} />}
                    </span>
                    <span className="nav-text">{isDarkMode ? 'Light' : 'Dark'}</span>
                </div>
                <button className="nav-link logout-btn" onClick={handleLogout}>
                    <span className="nav-icon"><LogOut size={28} /></span>
                    <span className="nav-text">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
