import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './MainLayout.css';

const MainLayout = ({ children, userRole }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        <div className="main-layout insta-layout">
            <Sidebar
                userRole={userRole}
                isOpen={isSidebarOpen}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
            />
            <div className="layout-body">
                <main className="content-area">
                    <div className="content-container">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
