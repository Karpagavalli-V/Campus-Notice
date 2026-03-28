import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Eye } from 'lucide-react';
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

    if (loading) return <div className="dashboard-loading"><div className="loader"></div><p>Gathering your performance data...</p></div>;
    if (!data) return <div className="error-state">Error loading analytics</div>;

    return (
        <div className="analytics-board">
            <header className="dashboard-header">
                <h1 className="page-title">Personal Engagement Analytics</h1>
                <p className="page-subtitle">Understand how your notices are being received by students.</p>
            </header>

            <section className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Notices Published</span>
                    <span className="stat-value">{data.totalNotices}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Feedback Score</span>
                    <span className="stat-value">{data.engagementRate}%</span>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Engagement Rate</small>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Strongest Impact</span>
                    <span className="stat-value">{data.mostActiveCategory}</span>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Top Category</small>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Reach</span>
                    <span className="stat-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Eye size={16} /> {data.totalViews}
                    </span>
                </div>
            </section>

            <div className="analytics-grid">
                <div className="chart-card">
                    <h3>Notice Categories</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={data.categoryWise}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                    stroke="none"
                                >
                                    {data.categoryWise.map((entry, index) => (
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

                <div className="chart-card">
                    <h3>Priority Distribution</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={data.priorityWise} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" strokeOpacity={0.5} />
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
                                    cursor={{ fill: 'var(--bg-color)', opacity: 0.5 }}
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                    {data.priorityWise.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <section className="recent-activity-table-section" style={{ marginTop: '2rem' }}>
                <h3>Impact Tracking (Last 5 Posts)</h3>
                <div className="admin-table-container">
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
                            {data.recentActivity.map(notice => (
                                <tr key={notice._id}>
                                    <td className="font-semibold">{notice.title}</td>
                                    <td>{notice.category}</td>
                                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Eye size={14} /> {notice.views}
                                    </td>
                                    <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default FacultyAnalytics;
