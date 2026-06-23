import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, Compass, Search, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getArchivedNotices } from "../services/noticeService";
import NoticeCard from "../components/common/NoticeCard/NoticeCard";
import "../styles/Dashboard.css";

const DEPARTMENTS = ["All", "Administration", "General", "IT Support", "Academic", "Computer Science", "Mechanical", "Electrical", "Management"];
const CATEGORIES = ["All", "General", "Announcements", "Events", "Exams", "Support", "Placements", "Achievements"];

function ArchivePage() {
  const [notices, setNotices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [category, setCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArchive();
  }, []);

  useEffect(() => {
    let result = [...notices];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(n => n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q));
    }
    if (dept !== "All") result = result.filter(n => n.department === dept);
    if (category !== "All") result = result.filter(n => n.category === category);
    setFiltered(result);
  }, [notices, search, dept, category]);

  const fetchArchive = async () => {
    try {
      const data = await getArchivedNotices();
      setNotices(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error fetching archive:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDept("All");
    setCategory("All");
  };

  const hasActiveFilters = search || dept !== "All" || category !== "All";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  if (loading) return (
    <div className="dashboard-loading">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="loader" />
      <p>Opening Archive...</p>
    </div>
  );

  const userRole = localStorage.getItem('role');

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="student-dashboard feed-layout archive-view">
      {/* Header */}
      <motion.header variants={itemVariants} className="archive-header" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <motion.div whileHover={{ rotate: 15, scale: 1.1 }} className="header-icon" style={{ background: 'var(--gaming-gradient)', padding: '1rem', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Compass size={32} />
        </motion.div>
        <div className="header-text">
          <h1 className="archive-title" style={{ fontSize: '2rem', fontWeight: '800', background: 'var(--gaming-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Explore Archive</h1>
          <p className="archive-subtitle" style={{ opacity: 0.7, fontSize: '1rem' }}>
            {userRole === 'faculty' ? "Access your past announcements and historical notices." : "Access historical campus announcements and expired updates."}
          </p>
        </div>
      </motion.header>

      {/* Search & Filter Bar */}
      <motion.div variants={itemVariants} style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: '2.75rem', width: '100%' }}
              placeholder="Search archived notices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.2rem',
              background: showFilters ? 'var(--primary-color)' : 'var(--card-bg)',
              color: showFilters ? 'white' : 'var(--text-primary)',
              border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
              cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            <Filter size={16} /> Filters {hasActiveFilters && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700' }}>!</span>}
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', overflow: 'hidden', background: 'var(--card-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: '170px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</label>
                <select className="form-select" value={dept} onChange={e => setDept(e.target.value)}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: '170px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result count */}
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          {filtered.length} archived notice{filtered.length !== 1 ? 's' : ''} found{hasActiveFilters ? ' (filtered)' : ''}
        </p>
      </motion.div>

      {/* Notice list */}
      <div className="feed-container">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="empty-state"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '4rem 2rem' }}>
              <div style={{ marginBottom: '1.5rem', background: 'rgba(var(--brand-primary-rgb), 0.1)', color: 'var(--brand-primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Archive size={48} />
              </div>
              <h3>{hasActiveFilters ? 'No notices match your filters' : 'No Archived Notices'}</h3>
              <p style={{ opacity: 0.7 }}>{hasActiveFilters ? 'Try adjusting your search or filters.' : 'Historical notices will appear here once they expire.'}</p>
              {hasActiveFilters ? (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={clearFilters}
                  style={{ marginTop: '1.5rem', background: 'var(--gaming-gradient)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                  Clear Filters
                </motion.button>
              ) : (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/student')}
                  style={{ marginTop: '1.5rem', background: 'var(--gaming-gradient)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                  Return to Live Feed
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="notices-feed">
              <AnimatePresence>
                {filtered.map((notice) => (
                  <motion.div key={notice._id} variants={itemVariants} initial="hidden" animate="visible" layout>
                    <NoticeCard
                      notice={{ ...notice, isArchived: true }}
                      isSaved={false}
                      onToggleSave={() => {}}
                      onClick={() => navigate(`/notice/${notice._id}`)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.div variants={itemVariants} className="feed-footer" style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.5 }}>
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
