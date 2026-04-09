import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Newspaper, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getNotices, getSavedNotices, toggleSaveNotice } from "../services/noticeService";
import { toggleFollow, getFollowing } from "../services/authService";
import { useToast } from "../context/ToastContext";
import NoticeCard from "../components/common/NoticeCard/NoticeCard";
import NoticeStories from "../components/common/NoticeStories/NoticeStories";
import "../styles/Dashboard.css";

function StudentDashboard() {
  const { showToast } = useToast();
  const [notices, setNotices] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    department: "All",
    priority: "All",
    category: "All",
    showSaved: false,
    showFollowing: false
  });
  const navigate = useNavigate();

  const fetchNotices = useCallback(async () => {
    try {
      const data = await getNotices(filters);
      setNotices(data);
    } catch (err) {
      console.error("Error fetching notices:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSavedIds = async () => {
    try {
      const saved = await getSavedNotices();
      setSavedIds(saved.map(n => n._id));
    } catch (err) {
      console.error("Error fetching saved IDs:", err);
    }
  };

  const [followingIds, setFollowingIds] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const fetchFollowingIds = async () => {
    try {
      const data = await getFollowing();
      setFollowingIds(data.map(user => user._id));
    } catch (err) {
      console.error("Error fetching following:", err);
    }
  };
  
  const fetchSuggested = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      const currentUserId = localStorage.getItem("userId");
      const suggested = data.filter(u => u._id !== currentUserId && !followingIds.includes(u._id))
                            .sort(() => 0.5 - Math.random()) // Shuffle
                            .slice(0, 5); // Pick 5
      setSuggestedUsers(suggested);
    } catch (err) {
      console.error("Error fetching suggested:", err);
    }
  }, [followingIds]);

  useEffect(() => {
    fetchSavedIds();
    fetchFollowingIds();
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    if (followingIds.length >= 0) fetchSuggested();
  }, [followingIds, fetchSuggested]);

  const handleFollow = async (id) => {
      try {
          const res = await toggleFollow(id);
          setFollowingIds(prev =>
              res.isFollowing ? [...prev, id] : prev.filter(userId => userId !== id)
          );
          showToast(res.message, "success");
      } catch (err) {
          showToast(err.response?.data?.message || "Failed to follow user", "error");
      }
  };

  const handleToggleSave = async (id) => {
    try {
      await toggleSaveNotice(id);
      setSavedIds(prev =>
        prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
      );
    } catch (err) {
      showToast("Failed to update bookmark.", "error");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'showFollowing' && checked) {
        setFilters({ ...filters, showFollowing: true, showSaved: false });
    } else if (name === 'showSaved' && checked) {
        setFilters({ ...filters, showSaved: true, showFollowing: false });
    } else {
        setFilters({
          ...filters,
          [name]: type === 'checkbox' ? checked : value
        });
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="dashboard-loading"
      >
        <div className="loader"></div>
        <p>Fetching latest notices...</p>
      </motion.div>
    );
  }

  const displayedNotices = filters.showSaved
    ? notices.filter(n => savedIds.includes(n._id))
    : notices;

  const currentUserId = localStorage.getItem("userId");
  
  const storyNotices = notices.filter(n => 
    n.createdBy && 
    followingIds.includes(n.createdBy._id) && 
    (!n.readBy || !n.readBy.some(id => id === currentUserId || id._id === currentUserId))
  ).slice(0, 10);

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="student-dashboard dashboard-grid-main"
    >
      <div className="feed-container-main">
        {/* Stories Section */}
        <NoticeStories
          urgentNotices={storyNotices}
          onStoryClick={(id) => navigate(`/notice/${id}`)}
        />

        {/* Modern Tab Switcher */}
        <div className="tab-switcher-modern">
            <button 
                onClick={() => handleFilterChange({ target: { name: 'showFollowing', type: 'checkbox', checked: false }})}
                className={`tab-btn-modern ${(!filters.showFollowing && !filters.showSaved) ? 'active' : ''}`}
            >
                {(!filters.showFollowing && !filters.showSaved) && (
                    <motion.div layoutId="activeTab" className="active-indicator" />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>For You</span>
            </button>
            <button 
                onClick={() => handleFilterChange({ target: { name: 'showFollowing', type: 'checkbox', checked: true }})}
                className={`tab-btn-modern ${filters.showFollowing ? 'active' : ''}`}
            >
                 {filters.showFollowing && (
                    <motion.div layoutId="activeTab" className="active-indicator" />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>Following</span>
            </button>
            <button 
                onClick={() => handleFilterChange({ target: { name: 'showSaved', type: 'checkbox', checked: true }})}
                className={`tab-btn-modern ${filters.showSaved ? 'active' : ''}`}
            >
                 {filters.showSaved && (
                    <motion.div layoutId="activeTab" className="active-indicator" />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>Saved</span>
            </button>
        </div>

        <AnimatePresence mode="wait">
            {displayedNotices.length === 0 ? (
            <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="empty-state"
            >
                <motion.span 
                    className="empty-icon"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                >
                {filters.showSaved ? <Bookmark size={48} /> : <Newspaper size={48} />}
                </motion.span>
                <h3>{filters.showSaved ? 'No Saved Notices' : filters.showFollowing ? 'No Following Updates' : 'No New Notices'}</h3>
                <p>{filters.showSaved ? "You haven't bookmarked any notices yet." : filters.showFollowing ? "Follow faculty to see updates here." : "You're all caught up!"}</p>
            </motion.div>
            ) : (
            <motion.div 
                key="feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="notices-feed"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {displayedNotices.map((notice, index) => (
                    <NoticeCard
                        key={notice._id}
                        notice={notice}
                        isSaved={savedIds.includes(notice._id)}
                        onToggleSave={handleToggleSave}
                        onClick={() => navigate(`/notice/${notice._id}`)}
                    />
                    ))}
                </div>
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="feed-footer"
                >
                <p><Sparkles size={16} /> You're all caught up! ✓</p>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Suggested Users Sidebar */}
      <aside className="suggestions-sidebar-fixed">
          <div className="suggestions-header">
              <h3>Suggested for you</h3>
              <button onClick={() => navigate('/search')}>See All</button>
          </div>
          <div className="suggestions-list">
              {suggestedUsers.map(user => (
                  <div key={user._id} className="suggestion-user-item">
                      <div className="s-user-info" onClick={() => navigate(`/user/${user._id}`)}>
                          <div className="s-avatar">
                              {user.profilePic ? <img src={`http://localhost:5000${user.profilePic}`} alt="" /> : user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="s-details">
                              <span className="s-name">{user.name}</span>
                              <span className="s-role">{user.role}</span>
                          </div>
                      </div>
                      <button className="s-follow-btn" onClick={() => handleFollow(user._id)}>Follow</button>
                  </div>
              ))}
              {suggestedUsers.length === 0 && <p className="s-empty">Finding people to follow...</p>}
          </div>
          <footer className="sidebar-copy-footer">
              <p>© 2024 CAMPUS NOTICE FROM DEEPMIND</p>
          </footer>
      </aside>
    </motion.div>

  );
}

export default StudentDashboard;
