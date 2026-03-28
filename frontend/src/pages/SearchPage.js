import React, { useState, useEffect } from "react";
import { Search as SearchIcon, Users, Calendar, Filter, Send } from "lucide-react";
import api from "../services/apiService";
import { useNavigate } from "react-router-dom";
import NoticeCard from "../components/common/NoticeCard/NoticeCard";
import "../styles/Dashboard.css"; // Reuse dashboard styles

function SearchPage() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("All");
    const [department, setDepartment] = useState("");
    const [company, setCompany] = useState("");
    const [results, setResults] = useState({ posts: [], events: [], users: [] });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("posts");

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await api.get('/search', {
                params: {
                    query, filter, department, company
                }
            });
            setResults(res.data);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // Keep users tab logic separated
    const renderUsers = () => {
        if (results.users.length === 0) return <p>No users found.</p>;
        return (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {results.users.map(user => (
                    <div key={user._id} className="user-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card-bg)' }}>
                        <div className="avatar-circle">
                            {user.profilePic ? (
                                <img src={`http://localhost:5000${user.profilePic}`} alt="avatar" className="avatar-img" />
                            ) : (
                                <Users size={24} />
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0 }}>{user.name}</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.department || user.role}</p>
                        </div>
                        <button 
                            style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                            onClick={() => navigate(`/messages?user=${user._id}&name=${encodeURIComponent(user.name)}`)}
                        >
                           <Send size={16} />
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="search-page" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2>Discover Campus Updates</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Search for announcements, events, and people.</p>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                    <SearchIcon style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        className="form-input" 
                        style={{ flex: 1, paddingLeft: '3rem', fontSize: '1.1rem' }}
                        type="search" 
                        placeholder="Search posts, events, companies, or users..." 
                        value={query} 
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button type="submit" style={{ padding: '0.75rem 2rem', background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                        Search
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Filter size={18} color="var(--text-secondary)" />
                    <select className="form-select" style={{ width: 'auto', flex: 1 }} value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="All">All Categories</option>
                        <option value="Academic">Academic</option>
                        <option value="Non-academic">Non-Academic</option>
                        <option value="Announcements">Announcements</option>
                        <option value="Events">Events</option>
                        <option value="Placements">Placements</option>
                    </select>

                    <select className="form-select" style={{ width: 'auto', flex: 1 }} value={department} onChange={e => setDepartment(e.target.value)}>
                        <option value="">All Departments</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Management">Management</option>
                    </select>

                    <input 
                        className="form-input" 
                        style={{ width: 'auto', flex: 1 }}
                        placeholder="Company/Interest e.g. Google" 
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                    />
                </div>
            </form>

            {loading ? (
                <div style={{ textAlign: 'center', margin: '4rem 0' }}><div className="loader"></div></div>
            ) : (
                query && (
                    <div className="search-results">
                        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                            <button onClick={() => setActiveTab("posts")} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'posts' ? '2px solid var(--brand-primary)' : 'none', color: activeTab === 'posts' ? 'var(--brand-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'posts' ? 'bold' : 'normal', cursor: 'pointer' }}>
                                Posts & Announcements ({results.posts?.length || 0})
                            </button>
                            <button onClick={() => setActiveTab("events")} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'events' ? '2px solid var(--brand-primary)' : 'none', color: activeTab === 'events' ? 'var(--brand-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'events' ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={18} /> Events ({results.events?.length || 0})
                            </button>
                            <button onClick={() => setActiveTab("users")} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'users' ? '2px solid var(--brand-primary)' : 'none', color: activeTab === 'users' ? 'var(--brand-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'users' ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={18} /> People ({results.users?.length || 0})
                            </button>
                        </div>

                        {activeTab === 'posts' && (
                            <div className="feed-container">
                                {results.posts.length > 0 ? results.posts.map(notice => (
                                    <NoticeCard key={notice._id} notice={notice} isSaved={false} onToggleSave={() => {}} onClick={() => navigate(`/notice/${notice._id}`)} />
                                )) : <p>No posts found matching '{query}'.</p>}
                            </div>
                        )}

                        {activeTab === 'events' && (
                            <div className="feed-container">
                                {results.events.length > 0 ? results.events.map(notice => (
                                    <NoticeCard key={notice._id} notice={notice} isSaved={false} onToggleSave={() => {}} onClick={() => navigate(`/notice/${notice._id}`)} />
                                )) : <p>No events found.</p>}
                            </div>
                        )}

                        {activeTab === 'users' && renderUsers()}
                    </div>
                )
            )}
        </div>
    );
}

export default SearchPage;
