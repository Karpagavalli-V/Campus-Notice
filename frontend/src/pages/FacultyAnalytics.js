import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Eye, TrendingUp, Award, Layers, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/apiService';
import '../styles/Dashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

const FacultyAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/notices/stats/me');
                setData(res.data);
            } catch (err) {
                console.error("Error fetching faculty stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 20 }
        }
    };

    if (loading) return (
        <div className="dashboard-loading">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="loader" 
            />
            <p>Gathering your performance data...</p>
        </div>
    );
    
    if (!data) return <div className="error-state">Error loading analytics</div>;

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="analytics-board"
        >
            <motion.header variants={itemVariants} className="dashboard-header">
                <h1 className="page-title">Personal Engagement Analytics</h1>
                <p className="page-subtitle">Understand how your notices are being received by students.</p>
            </motion.header>

            <motion.section variants={itemVariants} className="stats-grid">
                <motion.div whileHover={{ y: -5, scale: 1.02 }} className="stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Layers size={20} />
                    </div>
                    <span className="stat-label">Notices Published</span>
                    <span className="stat-value">{data.totalNotices}</span>
                </motion.div>
                <motion.div whileHover={{ y: -5, scale: 1.02 }} className="stat-card">
                   <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <TrendingUp size={20} />
                    </div>
                    <span className="stat-label">Feedback Score</span>
                    <span className="stat-value">{data.engagementRate}%</span>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Engagement Rate</small>
                </motion.div>
                <motion.div whileHover={{ y: -5, scale: 1.02 }} className="stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Award size={20} />
                    </div>
                    <span className="stat-label">Strongest Impact</span>
                    <span className="stat-value" style={{ fontSize: '1.25rem' }}>{data.mostActiveCategory}</span>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Top Category</small>
                </motion.div>
                <motion.div whileHover={{ y: -5, scale: 1.02 }} className="stat-card">
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Zap size={20} />
                    </div>
                    <span className="stat-label">Total Reach</span>
                    <span className="stat-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Eye size={16} /> {data.totalViews}
                    </span>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total views</small>
                </motion.div>
            </motion.section>

            <div className="analytics-grid">
                <motion.div variants={itemVariants} className="chart-card">
                    <h3>Notice Categories</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={data.categoryWise}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="count"
                                    nameKey="_id"
                                    stroke="none"
                                    animationBegin={200}
                                    animationDuration={1500}
                                >
                                    {data.categoryWise.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.1))' }} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', border: 'none' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="chart-card">
                    <h3>Priority Distribution</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={data.priorityWise} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" strokeOpacity={0.3} />
                                <XAxis
                                    dataKey="_id"
                                    interval={0}
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 10, dy: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    height={50}
                                />
                                <YAxis
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-color)', opacity: 0.3 }}
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', border: 'none' }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={50} animationBegin={400} animationDuration={1500}>
                                    {data.priorityWise.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            <motion.section variants={itemVariants} className="recent-activity-table-section" style={{ marginTop: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <TrendingUp size={20} style={{ color: 'var(--brand-primary)' }} /> Impact Tracking (Last 5 Posts)
                </h3>
                <div className="admin-table-container" style={{ overflow: 'visible' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Notice</th>
                                <th>Category</th>
                                <th>Views</th>
                                <th>Published On</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {data.recentActivity.map((notice, idx) => (
                                    <motion.tr 
                                        key={notice._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        whileHover={{ backgroundColor: 'rgba(var(--brand-primary-rgb), 0.05)', scale: 1.002 }}
                                        className="interactive-row"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td className="font-semibold">{notice.title}</td>
                                        <td>{notice.category}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Eye size={14} style={{ color: 'var(--brand-primary)' }} /> {notice.views}
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{new Date(notice.createdAt).toLocaleDateString()}</td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default FacultyAnalytics;
