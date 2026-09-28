import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './MainLayout.css';

const MainLayout = ({ children, userRole }) => {
    const isSidebarOpen = true;

    return (
        <div className="main-layout insta-layout">
            <Sidebar
                userRole={userRole}
                isOpen={isSidebarOpen}
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
