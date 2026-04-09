import React, { useState, useEffect } from 'react';
import { getNotices } from '../services/noticeService';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import Button from '../components/common/Button/Button';
import '../styles/Dashboard.css';
import './CalendarPage.css';

const CalendarPage = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllNotices = async () => {
            try {
                const data = await getNotices({});
                setNotices(data);
            } catch (err) {
                console.error("Error fetching notices for calendar:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllNotices();
    }, []);

    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const renderHeader = () => {
        const months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        const prevMonth = () => {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        };

        const nextMonth = () => {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        };

        const goToday = () => {
            setCurrentDate(new Date());
        };

        return (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="calendar-header"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--card-bg)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}
            >
                <AnimatePresence mode="wait">
                    <motion.h2 
                        key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="calendar-title" 
                        style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}
                    >
                        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </motion.h2>
                </AnimatePresence>
                <div className="calendar-nav" style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="outline" size="sm" onClick={prevMonth} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ChevronLeft size={16} /> Prev
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToday} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Target size={16} /> Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextMonth} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Next <ChevronRight size={16} />
                    </Button>
                </div>
            </motion.div>
        );
    };

    const renderDays = () => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return (
            <div className="calendar-grid-header" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', padding: '0.75rem 0', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
                {days.map(d => <div key={d}>{d}</div>)}
            </div>
        );
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Events': return '#6366f1'; // Indigo
            case 'Exams': return '#ef4444';  // Red
            case 'Academic': return '#10b981'; // Emerald
            case 'Support': return '#f59e0b';  // Amber
            default: return 'var(--brand-primary)';
        }
    };

    const renderCells = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const numDays = daysInMonth(month, year);
        const startDay = firstDayOfMonth(month, year);
        const cells = [];

        for (let i = 0; i < startDay; i++) {
            cells.push(<div key={`empty-${i}`} className="calendar-cell empty" style={{ aspectRatio: '1/1', background: 'transparent' }}></div>);
        }

        for (let d = 1; d <= numDays; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayNotices = notices.filter(n => n.expiryDate && n.expiryDate.split('T')[0] === dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

            cells.push(
                <motion.div 
                    key={d} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: d * 0.01 }}
                    className={`calendar-cell ${isToday ? 'today' : ''}`}
                    style={{
                        aspectRatio: '1/1',
                        border: '1px solid var(--border-color)',
                        padding: '0.5rem',
                        position: 'relative',
                        background: isToday ? 'rgba(var(--brand-primary-rgb), 0.05)' : 'var(--card-bg)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'default',
                        transition: 'all 0.2s ease',
                        boxShadow: isToday ? 'inset 0 0 0 1px var(--brand-primary)' : 'none'
                    }}
                >
                    <span className="day-number" style={{ fontWeight: isToday ? 700 : 400, opacity: isToday ? 1 : 0.7, fontSize: '0.9rem' }}>{d}</span>
                    <div className="day-notices" style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '2px', height: 'calc(100% - 1.5rem)', overflowY: 'auto' }}>
                        {dayNotices.map(n => (
                            <motion.div
                                key={n._id}
                                whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
                                whileTap={{ scale: 0.95 }}
                                className="calendar-notice-tag"
                                onClick={() => navigate(`/notice/${n._id}`)}
                                style={{
                                    background: n.priority === 'high' ? '#ef4444' : getCategoryColor(n.category),
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                title={`${n.category}: ${n.title}`}
                            >
                                {n.title}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            );
        }

        return (
            <AnimatePresence mode="wait">
                <motion.div 
                    key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="calendar-grid" 
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(7, 1fr)', 
                        gap: '0.5rem' 
                    }}
                >
                    {cells}
                </motion.div>
            </AnimatePresence>
        );
    };

    if (loading) return (
        <div className="dashboard-loading">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="loader" 
            />
            <p>Loading calendar...</p>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="calendar-page"
        >
            <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CalendarIcon size={28} style={{ color: 'var(--brand-primary)' }} /> Campus Hub Calendar
                </h1>
                <p className="page-subtitle">Track important deadlines and upcoming events across the institute.</p>
            </header>
            
            {renderHeader()}
            
            <div className="calendar-container" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
                {renderDays()}
                {renderCells()}
            </div>
            
            <div className="calendar-legend" style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#6366f1' }}></div> Events
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444' }}></div> Exams / High Priority
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }}></div> Academic
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', opacity: 0.8 }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b' }}></div> Support
                </div>
            </div>
        </motion.div>
    );
};

export default CalendarPage;
