import React, { useState, useEffect } from "react";
import { Trophy, Medal, Award, User, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLeaderboard } from "../services/gamificationService";
import Badge from "../components/common/Badge/Badge";
import "../styles/Leaderboard.css";

const Leaderboard = () => {
    const [topStudents, setTopStudents] = useState([]);
    const [topFaculty, setTopFaculty] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                const [students, faculty, general] = await Promise.all([
                    getLeaderboard("student"),
                    getLeaderboard("faculty"),
                    getLeaderboard("")
                ]);
                setTopStudents(students.slice(0, 3));
                setTopFaculty(faculty.slice(0, 3));
                setAllUsers(general);
            } catch (error) {
                console.error("Error fetching leaderboards:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboards();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return <div className="dashboard-loading"><div className="loader"></div><p>Ranking participants...</p></div>;

    const renderPodium = (users, title, icon) => (
        <div className="podium-section">
            <h2 className="section-title">
                {icon} {title}
            </h2>
            <div className="top-three-grid">
                {users.map((user, index) => (
                    <motion.div
                        key={user._id}
                        variants={itemVariants}
                        className={`podium-card rank-${index + 1}`}
                        whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
                    >
                        <div className="podium-rank-icon">
                            {index === 0 && <Medal color="#ffd700" size={32} />}
                            {index === 1 && <Medal color="#c0c0c0" size={28} />}
                            {index === 2 && <Medal color="#cd7f32" size={24} />}
                        </div>
                        <div className="podium-avatar">
                            {user.profilePic ? (
                                <img src={`http://localhost:5000${user.profilePic}`} alt={user.name} />
                            ) : (
                                <span>{user.name[0].toUpperCase()}</span>
                            )}
                        </div>
                        <h3>{user.name}</h3>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
                            {user.department}
                        </div>
                        <div className="podium-xp">
                            <Star size={16} className="text-warning" fill="currentColor" />
                            {user.xp || 0} XP
                        </div>
                        <div className="podium-badges">
                            {user.badges.slice(0, 3).map((b, i) => (
                                <span key={i} title={b.name} className="podium-badge-icon">{b.icon}</span>
                            ))}
                        </div>
                    </motion.div>
                ))}
                {users.length === 0 && (
                    <div className="empty-podium" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No rankings available for this category yet.
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="leaderboard-page"
        >
            <header className="dashboard-header" style={{ marginBottom: '3rem' }}>
                <motion.h1 layoutId="page-title" className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Trophy className="text-warning" size={36} /> Campus Champions
                </motion.h1>
                <p className="page-subtitle">Celebrating the most active members of our academic community.</p>
            </header>

            {renderPodium(topStudents, "Student Superstars", <Medal color="var(--status-low)" />)}
            {renderPodium(topFaculty, "Faculty Formidables", <Award color="var(--secondary-color)" />)}

            <div className="full-rankings-section">
                <h2 className="section-title" style={{ marginTop: '2rem' }}>
                    <Trophy size={20} style={{ marginRight: '10px' }} /> Overall Rankings
                </h2>
                <div className="leaderboard-table-container">
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>User</th>
                                <th>Role / Dept</th>
                                <th>Badges</th>
                                <th>XP Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {allUsers.map((user, index) => (
                                    <motion.tr
                                        layout
                                        key={user._id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0 }}
                                    >
                                        <td className="rank-cell">#{index + 1}</td>
                                        <td className="user-cell">
                                            <div className="avatar-sm">
                                                {user.profilePic ? (
                                                    <img src={`http://localhost:5000${user.profilePic}`} alt="" />
                                                ) : (
                                                    user.name[0].toUpperCase()
                                                )}
                                            </div>
                                            <span className="font-semibold">{user.name}</span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                <Badge variant={user.role === 'faculty' ? 'info' : 'success'}>
                                                    {user.role}
                                                </Badge>
                                                <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{user.department}</div>
                                            </div>
                                        </td>
                                        <td>
                                            {user.badges.map((b, i) => (
                                                <span key={i} className="table-badge-icon" title={b.name}>{b.icon}</span>
                                            ))}
                                        </td>
                                        <td className="xp-cell">
                                            <span className="xp-badge">{user.xp || 0}</span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default Leaderboard;
