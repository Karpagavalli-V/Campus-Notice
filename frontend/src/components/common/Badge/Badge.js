import React from 'react';
import './Badge.css';

const Badge = ({ children, variant = 'info', className = '', ...props }) => {
    return (
        <span className={`badge badge-${variant} ${className}`} {...props}>
            {children}
        </span>
    );
};

export default Badge;
