import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { getAnalytics, getAdminStats } from '../services/adminService';
import { FileText, Users, Eye, TrendingUp } from 'lucide-react';
import './AnalyticsBoard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

const AnalyticsBoard = () => {
    const [data, setData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analytics, adminStats] = await Promise.all([getAnalytics(), getAdminStats()]);
                setData(analytics);
                setStats(adminStats);
            } catch (err) {
                console.error("Error fetching analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="dashboard-loading"><div className="loader"></div><p>Aggregating data...</p></div>;
    if (!data) return <div>Error loading analytics</div>;

    const totalViews = data.recentActivity.reduce((sum, n) => sum + (n.readBy?.length || 0), 0);

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: <Users size={20} />, color: '#6366f1' },
        { label: 'Total Notices', value: stats?.totalNotices ?? '—', icon: <FileText size={20} />, color: '#10b981' },
        { label: 'Total Views', value: totalViews, icon: <Eye size={20} />, color: '#f59e0b' },
        { label: 'Departments', value: data.deptWise.length, icon: <TrendingUp size={20} />, color: '#ec4899' },
    ];

    return (
        <div className="analytics-board">
            <header className="dashboard-header">
                <h1 className="page-title">System Analytics</h1>
                <p className="page-subtitle">Visual overview of campus communication trends.</p>
            </header>

            {/* ── Stat cards ── */}
            <div className="analytics-stats-row">
                {statCards.map((s) => (
                    <div className="analytics-stat-card" key={s.label}>
                        <div className="stat-icon" style={{ background: s.color + '20', color: s.color }}>
                            {s.icon}
                        </div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Charts ── */}
            <div className="analytics-grid">
                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3>Notices by Department</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.deptWise} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" strokeOpacity={0.5} />
                                <XAxis
                                    dataKey="_id"
                                    interval={0}
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 10, dy: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    height={50}
                                />
                                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-color)', opacity: 0.5 }}
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                    {data.deptWise.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3>Priority Distribution</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.priorityWise}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                    stroke="none"
                                >
                                    {data.priorityWise.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--card-bg)" strokeWidth={3} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Recent posts table ── */}
            <section className="analytics-table-section">
                <h3><FileText size={16} /> Recent Posts</h3>
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>Notice</th>
                            <th>Creator</th>
                            <th>Dept</th>
                            <th><span style={{display:'flex',alignItems:'center',gap:'4px'}}><Eye size={13}/>Views</span></th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.recentActivity.map(notice => (
                            <tr key={notice._id}>
                                <td className="cell-notice-title">{notice.title}</td>
                                <td>{notice.createdBy?.name || "System"}</td>
                                <td>{notice.department}</td>
                                <td>
                                    <span className="cell-views">
                                        <Eye size={13} />
                                        {notice.readBy?.length || 0}
                                    </span>
                                </td>
                                <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default AnalyticsBoard;
