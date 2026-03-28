import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, Compass } from "lucide-react";
import { getArchivedNotices } from "../services/noticeService";
import NoticeCard from "../components/common/NoticeCard/NoticeCard";
import "../styles/Dashboard.css";

function ArchivePage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArchive();
  }, []);

  const fetchArchive = async () => {
    try {
      const data = await getArchivedNotices();
      setNotices(data);
    } catch (err) {
      console.error("Error fetching archive:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="dashboard-loading">
      <div className="loader"></div>
      <p>Opening Archive...</p>
    </div>
  );

  const userRole = localStorage.getItem('role');

  return (
    <div className="student-dashboard feed-layout archive-view">
      {/* Archive Header - Instagram Explore Style */}
      <header className="archive-header">
        <div className="header-icon">
          <Compass size={32} />
        </div>
        <div className="header-text">
          <h1 className="archive-title">Explore Archive</h1>
          <p className="archive-subtitle">
            {userRole === 'faculty'
              ? "Access your past announcements and historical notices."
              : "Access historical campus announcements and expired updates."}
          </p>
        </div>
      </header>

      <div className="feed-container">
        {notices.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <Archive size={48} />
            </span>
            <h3>No Archived Notices</h3>
            <p>Historical notices will appear here once they expire.</p>
          </div>
        ) : (
          <div className="notices-feed">
            {notices.map((notice) => (
              <NoticeCard
                key={notice._id}
                notice={{ ...notice, isArchived: true }}
                isSaved={false} // Archive usually doesn't show save state unless needed
                onToggleSave={() => { }}
                onClick={() => navigate(`/notice/${notice._id}`)}
              />
            ))}
            <div className="feed-footer">
              <p>End of Archive ✓</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArchivePage;
