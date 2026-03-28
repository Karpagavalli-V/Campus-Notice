import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { getAllNotices, deleteNotice, createNotice } from "../services/noticeService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button/Button";
import Badge from "../components/common/Badge/Badge";
import ConfirmDialog from "../components/common/ConfirmDialog/ConfirmDialog";
import "../styles/Dashboard.css";
import "../styles/Form.css";

function ManageNotices() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, noticeId: null });

  // Form State
  const [notice, setNotice] = useState({
    title: "",
    content: "",
    priority: "low",
    expiryDate: "",
    department: "Administration",
    category: "General",
    subType: "",
    mentions: [],
  });
  const [connections, setConnections] = useState({ followers: [], following: [] });
  const [attachments, setAttachments] = useState([]);
  const [creating, setCreating] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isAutoCategorized, setIsAutoCategorized] = useState(false);

  useEffect(() => {
    fetchNotices();
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const data = await import("../services/authService").then(m => m.getConnections());
      setConnections(data);
    } catch (err) {
      console.error("Error fetching connections:", err);
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

  const fetchNotices = async () => {
    try {
      const data = await getAllNotices();
      setNotices(data);
    } catch (err) {
      console.error("Error fetching notices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("title", notice.title);
      formData.append("content", notice.content);
      formData.append("priority", notice.priority);
      formData.append("expiryDate", notice.expiryDate);
      formData.append("department", notice.department);
      formData.append("category", notice.category);
      if (notice.subType) {
        formData.append("subType", notice.subType);
      }

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

      // Add mentions
      if (notice.mentions && notice.mentions.length > 0) {
        notice.mentions.forEach(mId => {
          formData.append("mentions[]", mId);
        });
      }

      await createNotice(formData);
      showToast("Notice created successfully!", "success");
      setNotice({
        title: "",
        content: "",
        priority: "low",
        expiryDate: "",
        department: "Administration",
        category: "General",
        subType: "",
        mentions: []
      });
      setAttachments([]);
      setIsAutoCategorized(false);
      setShowPoll(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setShowCreate(false);
      fetchNotices();
    } catch (err) {
      showToast("Error creating notice. Please try again.", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleChange = (e) => {
    setNotice({ ...notice, [e.target.name]: e.target.value });
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

  const handleDeleteNotice = async (id) => {
    setConfirmDialog({ isOpen: true, noticeId: id });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteNotice(confirmDialog.noticeId);
      showToast("Notice deleted successfully.", "success");
      fetchNotices();
    } catch (err) {
      showToast("Failed to delete notice.", "error");
    } finally {
      setConfirmDialog({ isOpen: false, noticeId: null });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, noticeId: null });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading notices...</p>
      </div>
    );
  }

  return (
    <div className="manage-notices-page">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Manage Notices</h1>
          <p className="page-subtitle">View, create and moderate active campus notices.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Cancel Creation" : "+ Create New Notice"}
        </Button>
      </header>

      {showCreate && (
        <section className="create-notice-section" style={{ marginBottom: '2rem', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Compose New Notice</h3>
          <form className="faculty-form" onSubmit={handleCreateNotice}>
            <div className="form-group">
              <label>Notice Title</label>
              <input
                className="form-input"
                name="title"
                placeholder="e.g. System Maintenance Update"
                value={notice.title}
                onChange={handleChange}
                onBlur={handlePredictiveCategory}
                required
              />
            </div>

            <div className="form-group">
              <label>Content</label>
              <textarea
                className="form-input"
                name="content"
                rows="4"
                placeholder="Detailed information..."
                value={notice.content}
                onChange={handleChange}
                onBlur={handlePredictiveCategory}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select
                  className="form-select"
                  name="priority"
                  value={notice.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  className="form-select"
                  name="department"
                  value={notice.department}
                  onChange={handleChange}
                >
                  <option value="Administration">Administration</option>
                  <option value="General">General</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Academic">Academic</option>
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

              <div className="form-group">
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  Category
                  {isAutoCategorized && (
                    <span className="auto-suggest-badge" title="Automatically selected based on your content" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Sparkles size={12} /> Auto-suggested
                    </span>
                  )}
                </label>
                <select
                  className="form-select"
                  name="category"
                  value={notice.category}
                  onChange={(e) => {
                    setNotice({ ...notice, category: e.target.value, subType: '' });
                  }}
                >
                  <option value="General">General</option>
                  <option value="Announcements">Announcements</option>
                  <option value="Events">Events</option>
                  <option value="Exams">Exams</option>
                  <option value="Support">Support</option>
                  <option value="Placements">Placements</option>
                  <option value="Achievements">Achievements</option>
                </select>
              </div>

              {notice.category !== "General" && (
                <div className="form-group">
                  <label>Sub-type</label>
                  <select
                    className="form-select"
                    name="subType"
                    value={notice.subType}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select Sub-type</option>
                    {(() => {
                        const types = {
                            "Announcements": ["Holiday Notice", "Timetable Update", "Circular", "Important Notice", "Others"],
                            "Events": ["Cultural", "Technical", "Workshop", "Seminar", "Non - technical", "Others"],
                            "Exams": ["Preparatory Test(pt)", "Continuous assignment test (cat)", "Semester", "Model Exam", "Others"],
                            "Support": ["IT Help", "Technical Issue", "Account Issue", "General Query", "Others"],
                            "Placements": ["Placement Drive", "Internship", "Company Visit", "Others"],
                            "Achievements": ["Student Achievement", "Faculty Achievement", "College Achievement", "Competition Winner", "Others"]
                        };
                        return (types[notice.category] || []).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ));
                    })()}
                  </select>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Poster Photos (Carousels allow multiple!)</label>
              <input
                type="file"
                onChange={(e) => setAttachments(Array.from(e.target.files))}
                className="form-input"
                accept="image/*"
              />
            </div>

            <div className="form-group">
                <label>Tag Students / Faculty (Connections)</label>
                <div className="mention-picker" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    {[...connections.followers, ...connections.following].filter((v, i, a) => a.findIndex(t => t._id === v._id) === i).map(user => (
                        <div 
                            key={user._id} 
                            onClick={() => {
                                const newMentions = notice.mentions.includes(user._id)
                                    ? notice.mentions.filter(id => id !== user._id)
                                    : [...notice.mentions, user._id];
                                setNotice({...notice, mentions: newMentions});
                            }}
                            className={`mention-tag-choice ${notice.mentions.includes(user._id) ? 'selected' : ''}`}
                            style={{ 
                                padding: '4px 12px', 
                                borderRadius: '20px', 
                                fontSize: '0.85rem', 
                                cursor: 'pointer',
                                background: notice.mentions.includes(user._id) ? 'var(--brand-primary)' : 'var(--card-bg)',
                                color: notice.mentions.includes(user._id) ? 'white' : 'var(--text-main)',
                                border: '1px solid var(--border-color)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {user.name} ({user.role})
                        </div>
                    ))}
                    {([...connections.followers, ...connections.following].length === 0) && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No connections found. Follow someone to tag them!</p>
                    )}
                </div>
            </div>

            <div className="form-group poll-toggle-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showPoll}
                  onChange={(e) => setShowPoll(e.target.checked)}
                />
                <span>Include a Poll</span>
              </label>
            </div>

            {showPoll && (
              <div className="poll-creation-box">
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
                    <div key={idx} className="poll-option-input-row">
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
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 5 && (
                    <button
                      type="button"
                      className="add-opt-btn"
                      onClick={addOption}
                    >
                      + Add Option
                    </button>
                  )}
                </div>
              </div>
            )}

            <Button type="submit" disabled={creating}>
              {creating ? "Publishing..." : "Publish Notice"}
            </Button>
          </form>
        </section>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Dept/Creator</th>
              <th>Priority</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((n) => (
              <tr key={n._id}>
                <td className="font-semibold">{n.title}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{n.department || "General"}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.createdBy?.name || "Unknown"}</span>
                  </div>
                </td>
                <td>
                  <Badge variant={n.priority === 'high' ? 'danger' : n.priority === 'medium' ? 'warning' : 'success'}>
                    {n.priority}
                  </Badge>
                </td>
                <td>{new Date(n.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/notice/${n._id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotice(n._id)}
                      style={{ color: 'var(--status-high)' }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {notices.length === 0 && (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <p>No notices found.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Notice"
        message="Are you sure you want to delete this notice? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default ManageNotices;
