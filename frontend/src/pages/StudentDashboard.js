import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Newspaper } from "lucide-react";
import { getNotices, getSavedNotices, toggleSaveNotice } from "../services/noticeService";
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
  
  const fetchFollowingIds = async () => {
    try {
      // Direct call to API or via authService if exported
      const response = await fetch("http://localhost:5000/api/auth/following", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      setFollowingIds(data.map(user => user._id));
    } catch (err) {
      console.error("Error fetching following:", err);
    }
  };

  useEffect(() => {
    fetchSavedIds();
    fetchFollowingIds();
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

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
    
    // If toggling 'showFollowing' or 'showSaved', make sure they are mutually exclusive or handle it gracefully
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
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Fetching latest notices...</p>
      </div>
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
    <div className="student-dashboard feed-layout">
      {/* Stories Section */}
      <NoticeStories
        urgentNotices={storyNotices}
        onStoryClick={(id) => navigate(`/notice/${id}`)}
      />

      <div className="feed-container">
        
        {/* Modern Tab Switcher: Unique Way */}
        <div className="tab-switcher-modern">
            <button 
                onClick={() => handleFilterChange({ target: { name: 'showFollowing', type: 'checkbox', checked: false }})}
                className={`tab-btn-modern ${(!filters.showFollowing && !filters.showSaved) ? 'active' : ''}`}
            >
                For You
            </button>
            <button 
                onClick={() => handleFilterChange({ target: { name: 'showFollowing', type: 'checkbox', checked: true }})}
                className={`tab-btn-modern ${filters.showFollowing ? 'active' : ''}`}
            >
                Following
            </button>
            <button 
                onClick={() => handleFilterChange({ target: { name: 'showSaved', type: 'checkbox', checked: true }})}
                className={`tab-btn-modern ${filters.showSaved ? 'active' : ''}`}
            >
                Saved
            </button>
        </div>

        {displayedNotices.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              {filters.showSaved ? <Bookmark size={48} /> : <Newspaper size={48} />}
            </span>
            <h3>{filters.showSaved ? 'No Saved Notices' : filters.showFollowing ? 'No Following Updates' : 'No New Notices'}</h3>
            <p>{filters.showSaved ? "You haven't bookmarked any notices yet." : filters.showFollowing ? "Follow faculty to see updates here." : "You're all caught up!"}</p>
          </div>
        ) : (
          <div className="notices-feed">
            {displayedNotices.map((notice) => (
              <NoticeCard
                key={notice._id}
                notice={notice}
                isSaved={savedIds.includes(notice._id)}
                onToggleSave={handleToggleSave}
                onClick={() => navigate(`/notice/${notice._id}`)}
              />
            ))}
            <div className="feed-footer">
              <p>You're all caught up! ✓</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
