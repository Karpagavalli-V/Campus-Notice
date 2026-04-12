import React from 'react';
import '../../styles/ModernNoticeGraphic.css';

const ModernNoticeGraphic = () => {
    return (
        <div className="modern-graphic-container">
            <div className="mockup-main-card">
                
                {/* Window Header */}
                <div className="mockup-header">
                    <div className="window-dots">
                        <div className="dot red"></div>
                        <div className="dot yellow"></div>
                        <div className="dot green"></div>
                    </div>
                    <div className="header-title">NOTICE FEED</div>
                </div>

                {/* Items */}
                <div className="mockup-item">
                    <div className="mockup-pill pill-urgent">
                        <span>📢</span> URGENT
                    </div>
                    <h4>Internal Assessment Schedule Released</h4>
                    <p>CSE Dept • 2 min ago</p>
                </div>

                <div className="mockup-item">
                    <div className="mockup-pill pill-event">
                        <span>🎉</span> EVENT
                    </div>
                    <h4>Tech Symposium 2026 - Register Now!</h4>
                    <p>IT Dept • 15 min ago</p>
                </div>

                <div className="mockup-item">
                    <div className="mockup-pill pill-sports">
                        <span>🏆</span> SPORTS
                    </div>
                    <h4>Inter-College Cricket League Selections</h4>
                    <p>Sports Club • 1 hr ago</p>
                </div>
            </div>

            {/* Floating Badges */}
            <div className="floating-badge badge-top">
                <div className="badge-icon">🔔</div>
                <div className="badge-text">3 new notices</div>
            </div>

            <div className="floating-badge badge-bottom">
                <div className="badge-icon">⚡</div>
                <div className="badge-text live">Live</div>
            </div>
        </div>
    );
};

export default ModernNoticeGraphic;
