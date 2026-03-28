import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
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

  return (
    <div className="faculty-dashboard">
      <header className="dashboard-header">
        <h1 className="page-title">Faculty Dashboard</h1>
        <p className="page-subtitle">Create and manage academic notices for your students.</p>
      </header>

      <div className="content-grid-two-cols">
        <section className="create-notice-section">
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
                {notice.content && (
                  <div className="markdown-preview-box">
                    <small className="preview-label">Live Preview:</small>
                    <div className="preview-container">
                      <MarkdownContent content={notice.content} />
                    </div>
                  </div>
                )}
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
                            ×
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


              <Button type="submit" className="w-full">
                Publish Notice
              </Button>
            </form>
          </div>
        </section>

        <section className="my-notices-section">
          <div className="section-header">
            <h3>My Recent Posts</h3>
          </div>
          {loading ? (
            <div className="dashboard-loading"><div className="loader"></div></div>
          ) : myNotices.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>You haven't posted any notices yet.</p>
            </div>
          ) : (
            <div className="notices-list-compact" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myNotices.slice(0, 5).map((n) => (
                <div
                  key={n._id}
                  onClick={() => navigate(`/notice/${n._id}`)}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
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
                    backgroundColor: n.priority === 'high' ? 'var(--status-high)' : n.priority === 'medium' ? 'var(--status-medium)' : 'var(--status-low)'
                  }}></span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default FacultyDashboard;
