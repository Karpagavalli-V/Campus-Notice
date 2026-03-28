import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { getAnalytics } from '../services/adminService';
import './AnalyticsBoard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

const AnalyticsBoard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAnalytics();
                setData(res);
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

    return (
        <div className="analytics-board">
            <header className="dashboard-header">
                <h1 className="page-title">System Analytics</h1>
                <p className="page-subtitle">Visual overview of campus communication trends.</p>
            </header>

            <div className="analytics-grid">
                <div className="chart-card">
                    <h3>Notices by Department</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={320}>
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
                                    {data.deptWise.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Priority Distribution</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={320}>
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

            <section className="recent-activity-table-section" style={{ marginTop: '2rem' }}>
                <h3>Recent Posts</h3>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Notice</th>
                                <th>Creator</th>
                                <th>Dept</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentActivity.map(notice => (
                                <tr key={notice._id}>
                                    <td className="font-semibold">{notice.title}</td>
                                    <td>{notice.createdBy?.name || "System"}</td>
                                    <td>{notice.department}</td>
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

export default AnalyticsBoard;
