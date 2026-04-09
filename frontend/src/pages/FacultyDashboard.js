import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Plus, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createNotice, getNotices } from "../services/noticeService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button/Button";
import MarkdownContent from "../components/common/MarkdownContent";
import "../styles/Dashboard.css";
import "../styles/Form.css";

function FacultyDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [notice, setNotice] = useState({
    title: "",
    content: "",
    priority: "low",
    expiryDate: "",
    department: "Computer Science",
    category: "General",
  });
  const [attachments, setAttachments] = useState([]);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [myNotices, setMyNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAutoCategorized, setIsAutoCategorized] = useState(false);

  useEffect(() => {
    fetchMyNotices();
  }, []);

  const fetchMyNotices = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const data = await getNotices({ createdBy: userId });
      setMyNotices(data);
    } catch (err) {
      console.error("Error fetching notices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removeOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  const handleChange = (e) => {
    setNotice({ ...notice, [e.target.name]: e.target.value });
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", notice.title);
      formData.append("content", notice.content);
      formData.append("priority", notice.priority);
      formData.append("expiryDate", notice.expiryDate);
      formData.append("department", notice.department);
      formData.append("category", notice.category);

      if (showPoll && pollQuestion.trim()) {
        const pollData = {
          question: pollQuestion,
          options: pollOptions
            .filter(opt => opt.trim() !== "")
            .map(opt => ({ text: opt, votes: [] }))
        };
        if (pollData.options.length >= 2) {
          formData.append("poll", JSON.stringify(pollData));
        }
      }

      if (attachments && attachments.length > 0) {
        attachments.forEach(file => {
          formData.append("attachments", file);
        });
      }

      await createNotice(formData);
      showToast("Notice created successfully!", "success");
      setNotice({
        title: "",
        content: "",
        priority: "low",
        expiryDate: "",
        department: "Computer Science",
        category: "General"
      });
      setAttachments([]);
      setShowPoll(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setIsAutoCategorized(false);
      fetchMyNotices();
    } catch (err) {
      showToast("Error creating notice. Please try again.", "error");
    }
  };

  const predictCategory = (text) => {
    const lowerText = text.toLowerCase();
    const map = {
      'Events': ['workshop', 'seminar', 'webinar', 'fest', 'celebration', 'meet', 'club', 'gathering', 'event'],
      'Exams': ['exam', 'test', 'quiz', 'midterm', 'final', 'backlog', 'viva', 'assessment', 'result'],
      'Academic': ['lecture', 'class', 'course', 'syllabus', 'assignment', 'project', 'thesis', 'research', 'academic'],
      'Support': ['maintenance', 'wifi', 'hostel', 'complaint', 'issue', 'help', 'service', 'it support', 'support']
    };

    for (const [cat, keywords] of Object.entries(map)) {
      if (keywords.some(kw => lowerText.includes(kw))) return cat;
    }
    return null;
  };

  const handlePredictiveCategory = () => {
    const combinedText = `${notice.title} ${notice.content}`;
    const predicted = predictCategory(combinedText);
    if (predicted && notice.category === 'General') {
      setNotice(prev => ({ ...prev, category: predicted }));
      setIsAutoCategorized(true);
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
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="faculty-dashboard"
    >
      <header className="dashboard-header">
        <motion.h1 layoutId="page-title" className="page-title">Faculty Dashboard</motion.h1>
        <motion.p variants={itemVariants} className="page-subtitle">Create and manage academic notices for your students.</motion.p>
      </header>

      <div className="content-grid-two-cols">
        <motion.section 
            variants={itemVariants}
            className="create-notice-section"
        >
          <div className="section-header">
            <h3>Post New Notice</h3>
          </div>
          <div className="action-card-form">
            <form className="faculty-form" onSubmit={handleCreateNotice}>
              <div className="form-group">
                <label>Notice Title</label>
                <input
                  className="form-input"
                  name="title"
                  placeholder="e.g. Mid-term Exam Schedule"
                  value={notice.title}
                  onChange={handleChange}
                  onBlur={handlePredictiveCategory}
                  required
                />
              </div>

              <div className="form-group">
                <label>Content Description</label>
                <textarea
                  className="form-input"
                  name="content"
                  rows="5"
                  placeholder="Detailed information about the notice... (Supports **bold**, *italic*, - list)"
                  value={notice.content}
                  onChange={handleChange}
                  onBlur={handlePredictiveCategory}
                  required
                />
                <AnimatePresence>
                    {notice.content && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="markdown-preview-box"
                        style={{ overflow: 'hidden' }}
                    >
                        <small className="preview-label">Live Preview:</small>
                        <div className="preview-container">
                        <MarkdownContent content={notice.content} />
                        </div>
                    </motion.div>
                    )}
                </AnimatePresence>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority Level</label>
                  <select
                    className="form-select"
                    name="priority"
                    value={notice.priority}
                    onChange={handleChange}
                    style={{ border: notice.priority === 'emergency' ? '2px solid var(--status-high)' : '' }}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="emergency">Emergency (Site-wide Banner)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    className="form-input"
                    type="date"
                    name="expiryDate"
                    value={notice.expiryDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    className="form-select"
                    name="department"
                    value={notice.department}
                    onChange={handleChange}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Management">Management</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Notice Category
                    {isAutoCategorized && (
                      <span className="auto-suggest-badge" title="Automatically selected based on your content" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Sparkles size={12} /> Auto-suggested
                      </span>
                    )}
                  </label>
                  <select
                    className="form-select"
                    name="category"
                    value={notice.category}
                    onChange={handleChange}
                  >
                    <option value="General">General</option>
                    <option value="Events">Events</option>
                    <option value="Exams">Exams</option>
                    <option value="Academic">Academic</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Poster Photos (Carousels allow multiple!)</label>
                <input
                  type="file"
                  onChange={(e) => setAttachments(Array.from(e.target.files))}
                  className="form-input"
                  accept="image/*"
                  multiple
                />
              </div>

              <div className="form-group poll-toggle-group">
                <label className="checkbox-label" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showPoll}
                    onChange={(e) => setShowPoll(e.target.checked)}
                  />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Include a Poll
                  </span>
                </label>
              </div>

              <AnimatePresence>
                {showPoll && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="poll-creation-box"
                        style={{ overflow: 'hidden', paddingBottom: '1rem' }}
                    >
                    <div className="form-group">
                        <label>Poll Question</label>
                        <input
                        className="form-input"
                        placeholder="e.g. Which date works best for the extra class?"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        required={showPoll}
                        />
                    </div>
                    <div className="poll-options-list">
                        <label>Poll Options</label>
                        {pollOptions.map((opt, idx) => (
                        <motion.div 
                            layout
                            key={idx} 
                            className="poll-option-input-row"
                        >
                            <input
                            className="form-input"
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            required={showPoll && idx < 2}
                            />
                            {pollOptions.length > 2 && (
                            <button
                                type="button"
                                className="remove-opt-btn"
                                onClick={() => removeOption(idx)}
                            >
                                ×
                            </button>
                            )}
                        </motion.div>
                        ))}
                        {pollOptions.length < 5 && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            className="add-opt-btn"
                            onClick={addOption}
                        >
                            + Add Option
                        </motion.button>
                        )}
                    </div>
                    </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                  <Button type="submit" className="w-full">
                    Publish Notice
                  </Button>
              </motion.div>
            </form>
          </div>
        </motion.section>

        <motion.section 
            variants={itemVariants}
            className="my-notices-section"
        >
          <div className="section-header">
            <h3>My Recent Posts</h3>
          </div>
          <AnimatePresence mode="wait">
            {loading ? (
                <motion.div 
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="dashboard-loading"
                ><div className="loader"></div></motion.div>
            ) : myNotices.length === 0 ? (
                <motion.div 
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="empty-state" 
                    style={{ padding: '2rem' }}
                >
                    <ClipboardList size={40} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p>You haven't posted any notices yet.</p>
                </motion.div>
            ) : (
                <motion.div 
                    key="list"
                    className="notices-list-compact" 
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                {myNotices.slice(0, 5).map((n, i) => (
                    <motion.div
                        key={n._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ x: 10, backgroundColor: 'rgba(139, 92, 246, 0.05)', borderColor: 'var(--primary-color)' }}
                        onClick={() => navigate(`/notice/${n._id}`)}
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            padding: '1.rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s'
                        }}
                    >
                    <div>
                        <p style={{ fontWeight: '600', margin: 0 }}>{n.title}</p>
                        <small style={{ color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</small>
                    </div>
                    <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: n.priority === 'high' ? 'var(--status-high)' : n.priority === 'medium' ? 'var(--status-medium)' : 'var(--status-low)',
                        boxShadow: `0 0 10px ${n.priority === 'high' ? 'var(--status-high)' : 'transparent'}`
                    }}></span>
                    </motion.div>
                ))}
                </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>
    </motion.div>
  );
}

export default FacultyDashboard;
