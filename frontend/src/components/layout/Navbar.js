import React from 'react';
import { GraduationCap, Sun, Moon, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../config/env';
import Badge from '../common/Badge/Badge';
import Button from '../common/Button/Button';
import NotificationBell from './NotificationBell';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = ({ userRole, toggleSidebar }) => {
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/';
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <Menu size={20} />
                </button>
                <div className="navbar-brand">
                    <span className="brand-icon">
                        <GraduationCap size={24} />
                    </span>
                    <span className="brand-text">CampusHub</span>
                </div>
            </div>

            <div className="navbar-right">
                <motion.button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: '1rem', color: 'var(--text-primary)' }}
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </motion.button>
                <NotificationBell />
                <div className="nav-profile-image">
                    {localStorage.getItem('profilePic') ? (
                        <img src={`${API_BASE_URL}${localStorage.getItem('profilePic')}`} alt="User" />
                    ) : (
                        <Badge variant="secondary" className="role-badge">
                            {userRole}
                        </Badge>
                    )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="logout-btn">
                    Logout
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;
