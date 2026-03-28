import React from 'react';
import './NoticeStories.css';

const NoticeStories = ({ urgentNotices, onStoryClick }) => {
    if (!urgentNotices || urgentNotices.length === 0) return null;

    return (
        <div className="notice-stories-container">
            <div className="stories-track">
                {urgentNotices.map((notice) => (
                    <div
                        key={notice._id}
                        className={`story-item ${notice.priority === 'Emergency' ? 'emergency' : ''}`}
                        onClick={() => onStoryClick(notice._id)}
                    >
                        <div className="story-avatar-ring">
                            <div className="story-avatar">
                                {notice.createdBy?.name?.[0].toUpperCase() || 'A'}
                            </div>
                        </div>
                        <span className="story-label">
                            {notice.createdBy?.name?.split(' ')[0] || 'Notice'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NoticeStories;
