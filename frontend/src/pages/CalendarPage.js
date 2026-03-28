import React, { useState, useEffect } from 'react';
import { getNotices } from '../services/noticeService';
import { useNavigate } from 'react-router-dom';
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
            <div className="calendar-header">
                <h2 className="calendar-title">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <div className="calendar-nav">
                    <Button variant="outline" size="sm" onClick={prevMonth}>Prev</Button>
                    <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
                    <Button variant="outline" size="sm" onClick={nextMonth}>Next</Button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return (
            <div className="calendar-grid-header">
                {days.map(d => <div key={d}>{d}</div>)}
            </div>
        );
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Events': return '#3b82f6'; // Blue
            case 'Exams': return '#ef4444';  // Red
            case 'Academic': return '#0d9488'; // Teal
            case 'Support': return '#f97316';  // Orange
            default: return 'var(--primary-color)';
        }
    };

    const renderCells = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const numDays = daysInMonth(month, year);
        const startDay = firstDayOfMonth(month, year);
        const cells = [];

        for (let i = 0; i < startDay; i++) {
            cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
        }

        for (let d = 1; d <= numDays; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayNotices = notices.filter(n => n.expiryDate && n.expiryDate.split('T')[0] === dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

            cells.push(
                <div key={d} className={`calendar-cell ${isToday ? 'today' : ''}`}>
                    <span className="day-number">{d}</span>
                    <div className="day-notices">
                        {dayNotices.map(n => (
                            <div
                                key={n._id}
                                className="calendar-notice-tag"
                                onClick={() => navigate(`/notice/${n._id}`)}
                                style={{
                                    background: n.priority === 'high' ? 'var(--status-high)' : getCategoryColor(n.category)
                                }}
                                title={`${n.category}: ${n.title}`}
                            >
                                {n.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return <div className="calendar-grid">{cells}</div>;
    };

    if (loading) return <div className="dashboard-loading"><div className="loader"></div><p>Loading calendar...</p></div>;

    return (
        <div className="calendar-page">
            <header className="dashboard-header">
                <h1 className="page-title">Campus Hub Calendar</h1>
                <p className="page-subtitle">Track important deadlines and upcoming events.</p>
            </header>
            {renderHeader()}
            <div className="calendar-container">
                {renderDays()}
                {renderCells()}
            </div>
        </div>
    );
};

export default CalendarPage;

