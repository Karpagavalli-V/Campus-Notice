import React from 'react';
import { GraduationCap, Sun, Moon, Menu } from 'lucide-react';
import Badge from '../common/Badge/Badge';
import Button from '../common/Button/Button';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = ({ userRole, toggleSidebar }) => {
    const [isDarkMode, setIsDarkMode] = React.useState(localStorage.getItem('theme') === 'dark');

    React.useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/';
    };

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: '1rem', color: 'var(--text-primary)' }}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <NotificationBell />
                <div className="nav-profile-image">
                    {localStorage.getItem('profilePic') ? (
                        <img src={`http://localhost:5000${localStorage.getItem('profilePic')}`} alt="User" />
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
