import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
    const renderSkeleton = () => {
        if (type === 'card') {
            return (
                <div className="skeleton-card">
                    <div className="skeleton-header">
                        <div className="skeleton-avatar"></div>
                        <div className="skeleton-title"></div>
                    </div>
                    <div className="skeleton-body">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line short"></div>
                    </div>
                </div>
            );
        }
        
        if (type === 'text') {
            return (
                <div className="skeleton-text-block">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                </div>
            );
        }

        return <div className={`skeleton-${type}`}></div>;
    };

    return (
        <div className="skeleton-container">
            {Array(count).fill(0).map((_, index) => (
                <div key={index} className="skeleton-wrapper">
                    {renderSkeleton()}
                </div>
            ))}
        </div>
    );
};

export default SkeletonLoader;
