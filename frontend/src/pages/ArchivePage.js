import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, Compass, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  if (loading) return (
    <div className="dashboard-loading">
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="loader" 
        />
        <p>Opening Archive...</p>
    </div>
  );

  const userRole = localStorage.getItem('role');

  return (
    <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="student-dashboard feed-layout archive-view"
    >
      <motion.header variants={itemVariants} className="archive-header" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="header-icon" 
            style={{ background: 'var(--gaming-gradient)', padding: '1rem', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Compass size={32} />
        </motion.div>
        <div className="header-text">
          <h1 className="archive-title" style={{ fontSize: '2rem', fontWeight: '800', background: 'var(--gaming-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Explore Archive</h1>
          <p className="archive-subtitle" style={{ opacity: 0.7, fontSize: '1rem' }}>
            {userRole === 'faculty'
              ? "Access your past announcements and historical notices."
              : "Access historical campus announcements and expired updates."}
          </p>
        </div>
      </motion.header>

      <div className="feed-container">
        <AnimatePresence mode="popLayout">
            {notices.length === 0 ? (
            <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="empty-state"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '4rem 2rem' }}
            >
                <div className="empty-icon-wrapper" style={{ marginBottom: '1.5rem', background: 'rgba(var(--brand-primary-rgb), 0.1)', color: 'var(--brand-primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Archive size={48} />
                </div>
                <h3>No Archived Notices</h3>
                <p style={{ opacity: 0.7 }}>Historical notices will appear here once they expire.</p>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/dashboard')} 
                    style={{ marginTop: '1.5rem', background: 'var(--gaming-gradient)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', color: 'white', fontWeight: 'bold' }}
                >
                    Return to Live Feed
                </motion.button>
            </motion.div>
            ) : (
            <div className="notices-feed">
                <AnimatePresence>
                    {notices.map((notice, idx) => (
                    <motion.div
                        key={notice._id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        layout
                    >
                        <NoticeCard
                            notice={{ ...notice, isArchived: true }}
                            isSaved={false}
                            onToggleSave={() => { }}
                            onClick={() => navigate(`/notice/${notice._id}`)}
                        />
                    </motion.div>
                    ))}
                </AnimatePresence>
                <motion.div 
                    variants={itemVariants}
                    className="feed-footer" 
                    style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.5 }}
                >
                <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>End of Archive ✓</p>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default ArchivePage;
