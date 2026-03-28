import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getNotices } from '../../services/noticeService';
import './EmergencyBanner.css';

const EmergencyBanner = () => {
    const [emergencyNotices, setEmergencyNotices] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchEmergency = async () => {
            try {
                const notices = await getNotices({ isActive: true });
                const emergency = notices.filter(n => n.priority === 'emergency');
                setEmergencyNotices(emergency);
            } catch (error) {
                console.error('Error fetching emergency notices:', error);
            }
        };

        fetchEmergency();
        const interval = setInterval(fetchEmergency, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (emergencyNotices.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % emergencyNotices.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [emergencyNotices]);

    if (emergencyNotices.length === 0) return null;

    const currentNotice = emergencyNotices[currentIndex];

    return (
        <div className="emergency-banner">
            <div className="banner-content">
                <span className="banner-tag">
                    <AlertTriangle size={18} /> EMERGENCY
                </span>
                <span className="banner-text">
                    <strong>{currentNotice.title}:</strong> {currentNotice.content.substring(0, 100)}...
                </span>
                <a href={`/notice/${currentNotice._id}`} className="banner-link">View Details</a>
            </div>
            {emergencyNotices.length > 1 && (
                <div className="banner-nav">
                    {currentIndex + 1} / {emergencyNotices.length}
                </div>
            )}
        </div>
    );
};

export default EmergencyBanner;
