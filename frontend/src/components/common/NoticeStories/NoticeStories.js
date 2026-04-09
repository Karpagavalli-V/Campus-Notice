import React from 'react';
import { motion } from 'framer-motion';
import './NoticeStories.css';

const NoticeStories = ({ urgentNotices, onStoryClick }) => {
    if (!urgentNotices || urgentNotices.length === 0) return null;

    const containerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <motion.div 
            className="notice-stories-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="stories-track">
                {urgentNotices.map((notice) => (
                    <motion.div
                        key={notice._id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
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
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default NoticeStories;
