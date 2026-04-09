import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import {
  X,
  Eye,
  Bookmark,
  MessageSquare,
  BarChart3,
  Paperclip,
  FileText,
  Edit,
  Image as ImageIcon,
  Share2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Send,
  Sparkles,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/apiService";
import { updateNotice } from "../services/noticeService";
import Badge from "../components/common/Badge/Badge";
import Button from "../components/common/Button/Button";
import MarkdownContent from "../components/common/MarkdownContent";
import { useToast } from "../context/ToastContext";
import "../styles/Dashboard.css";

function NoticeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editAttachments, setEditAttachments] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchNotice = useCallback(async () => {
    try {
      const res = await api.get(`/notices/${id}`);
      setNotice(res.data);
    } catch (error) {
      console.error("Error fetching notice details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkSaved = useCallback(async () => {
    try {
      const saved = await api.get("/notices/saved/all");
      setIsSaved(saved.data.some(n => n._id === id));
    } catch (err) {
      console.error("Error checking saved status:", err);
    }
  }, [id]);

  const markRead = useCallback(async () => {
    try {
      await api.post(`/notices/${id}/read`);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchNotice();
    markRead();
    checkSaved();
  }, [fetchNotice, markRead, checkSaved]);



  const handleToggleSave = async () => {
    try {
      await api.post(`/notices/${id}/save`);
      setIsSaved(!isSaved);
    } catch (err) {
      showToast("Failed to update bookmark", "error");
    }
  };

  const handleShareClick = async () => {
    const url = `${window.location.origin}/notice/${notice._id}`;
    const title = notice.title || 'Campus Update';
    const text = `Check out this notice: ${title}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        showToast("Notice shared successfully!", "success");
      } catch (err) { }
    } else {
      navigator.clipboard.writeText(url);
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, '_blank');
      showToast("Link copied to clipboard. Opening WhatsApp...", "success");
    }
  };

  const handleVote = async (optionIndex) => {
    try {
      const res = await api.post(`/notices/${id}/vote`, { optionIndex });
      setNotice(res.data);
    } catch (err) {
      showToast("Failed to cast vote", "error");
    }
  };

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const name = localStorage.getItem("name") || "User";
      await api.post(`/notices/${id}/comment`, {
        text: newComment,
        userName: name,
      });
      setNewComment("");
      fetchNotice(); // Refresh comments
    } catch (err) {
      showToast("Failed to post comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      const name = localStorage.getItem("name") || "User";
      await api.post(`/notices/${id}/comment/${commentId}/reply`, {
        text: replyText,
        userName: name,
      });
      setReplyText("");
      setReplyingTo(null);
      fetchNotice();
    } catch (err) {
      showToast("Failed to reply", "error");
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await api.post(`/notices/${id}/comment/${commentId}/like`);
      fetchNotice();
    } catch (err) {
      showToast("Failed to like comment", "error");
    }
  };

  const handleLikeReply = async (commentId, replyId) => {
    try {
      await api.post(`/notices/${id}/comment/${commentId}/reply/${replyId}/like`);
      fetchNotice();
    } catch (err) {
      showToast("Failed to like reply", "error");
    }
  };

  const handleUpdateNotice = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("content", editForm.content);
      formData.append("priority", editForm.priority);
      formData.append("expiryDate", editForm.expiryDate);
      formData.append("department", editForm.department);
      formData.append("category", editForm.category);
      if (editForm.subType) {
        formData.append("subType", editForm.subType);
      }

      if (editAttachments && editAttachments.length > 0) {
        editAttachments.forEach(file => {
          formData.append("attachments", file);
        });
      }

      await updateNotice(id, formData);
      showToast("Notice updated successfully!", "success");
      setIsEditing(false);
      setEditAttachments([]);
      fetchNotice();
    } catch (err) {
      showToast("Failed to update notice.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Notice_${notice?.title || 'Campus'}`,
  });

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  if (loading) return (
    <div className="dashboard-loading">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="loader"
      />
      <p>Loading notice details...</p>
    </div>
  );
  if (!notice) return (
    <div className="empty-state">
      <span className="empty-icon">
        <X size={48} />
      </span>
      <h3>Notice Not Found</h3>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const currentUserId = localStorage.getItem('userId');
  const hasVoted = notice.poll?.options.some(opt => opt.votes.includes(currentUserId));
  const totalVotes = notice.poll?.options.reduce((sum, opt) => sum + opt.votes.length, 0) || 0;

  const highlightMentions = (text) => {
    if (!text) return text;
    return text.split(/(@\w+)/g).map((part, i) =>
      part.startsWith('@') ? <span key={i} style={{ color: 'var(--brand-primary)', fontWeight: 'bold', background: 'rgba(var(--brand-primary-rgb), 0.1)', padding: '0 4px', borderRadius: '4px' }}>{part}</span> : part
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="notice-details-page"
    >
      <motion.header variants={itemVariants} className="details-header">
        <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="back-btn">
            <ChevronLeft size={16} /> Back to Board
          </Button>
        </motion.div>
        <div className="header-meta">
          <motion.div variants={itemVariants}>
            <Badge variant={notice.priority === 'emergency' ? 'emergency' : notice.priority === 'high' ? 'danger' : notice.priority === 'medium' ? 'warning' : 'success'}>
              {notice.priority} Priority
            </Badge>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Badge variant="primary">{notice.department || "General"}</Badge>
          </motion.div>
          {notice.readBy && (
            <motion.div variants={itemVariants}>
              <Badge
                variant="info"
                className="views-badge-clickable"
                onClick={() => setShowViewersModal(true)}
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                title="Click to see who viewed this notice"
              >
                <Eye size={16} /> {notice.readBy.length} Views
              </Badge>
            </motion.div>
          )}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`bookmark-btn-large ${isSaved ? 'saved' : ''}`}
            onClick={handleToggleSave}
            title={isSaved ? "Remove from saved" : "Save for later"}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}
          >
            <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? 'Saved' : 'Save Notice'}
          </motion.button>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bookmark-btn-large"
            onClick={handleShareClick}
            title="Share this notice"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            <Share2 size={16} /> Share
          </motion.button>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bookmark-btn-large"
            onClick={handlePrint}
            title="Print official notice"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            <Printer size={16} /> Print Official
          </motion.button>
        </div>
        <motion.h1 variants={itemVariants} className="details-title">{notice.title}</motion.h1>
        <motion.div variants={itemVariants} className="details-info">
          <span>By <strong
            style={{ cursor: 'pointer', color: 'var(--brand-primary)' }}
            onClick={() => navigate(`/user/${notice.createdBy?._id}`)}
          >{notice.createdBy?.name || "System Admin"}</strong></span>
          <span className="info-separator">•</span>
          <span>Posted on {new Date(notice.createdAt).toLocaleDateString()}</span>
          <span className="info-separator">•</span>
          <span>Expires on {new Date(notice.expiryDate).toLocaleDateString()}</span>

          <AnimatePresence>
            {notice.createdBy && notice.createdBy._id && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ display: 'inline-block' }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="chat-btn"
                  style={{ marginLeft: '1rem', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  onClick={() => navigate(`/messages?user=${notice.createdBy._id}&name=${encodeURIComponent(notice.createdBy.name)}`)}
                >
                  <MessageSquare size={16} /> Chat with Author
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {notice.createdBy && notice.createdBy._id === currentUserId && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ display: 'inline-block' }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  style={{ marginLeft: '1rem', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  onClick={() => {
                    setEditForm({
                      title: notice.title,
                      content: notice.content,
                      priority: notice.priority,
                      expiryDate: new Date(notice.expiryDate).toISOString().split('T')[0],
                      department: notice.department,
                      category: notice.category,
                      subType: notice.subType || '',
                    });
                    setIsEditing(true);
                  }}
                >
                  <Edit size={16} /> Edit Notice
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.header>

      <div className="details-content">
        <div className="content-card">
          <MarkdownContent content={notice.content} />
        </div>

        {notice.poll && (
          <div className="details-poll-section">
            <h4 className="poll-question" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} /> {notice.poll.question}
            </h4>
            <div className="poll-options">
              {notice.poll.options.map((opt, idx) => {
                const percentage = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                const isSelected = opt.votes.includes(currentUserId);

                return (
                  <div
                    key={idx}
                    className={`poll-option ${hasVoted ? 'voted' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => !hasVoted && handleVote(idx)}
                  >
                    <div className="option-bg" style={{ width: `${hasVoted ? percentage : 0}%` }}></div>
                    <span className="option-text">{opt.text}</span>
                    {hasVoted && <span className="option-percentage">{percentage}%</span>}
                  </div>
                );
              })}
            </div>
            <p className="poll-footer">{totalVotes} students have voted</p>
          </div>
        )}

        {notice.attachments && notice.attachments.length > 0 && (
          <div className="attachments-section" style={{ marginTop: '2rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ImageIcon size={20} /> Poster Carousel
            </h4>
            <div className="attachments-list" style={{ display: 'block' }}>
              {(() => {
                const images = notice.attachments.filter(f => f.fileType?.startsWith('image') || f.filename?.match(/\.(jpg|jpeg|png|gif)$/i));
                const docs = notice.attachments.filter(f => !(f.fileType?.startsWith('image') || f.filename?.match(/\.(jpg|jpeg|png|gif)$/i)));

                return (
                  <div>
                    {images.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="carousel-container"
                        style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '1.5rem', background: '#000', boxShadow: 'var(--shadow-lg)' }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={currentSlide}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            src={`http://localhost:5000${images[currentSlide].url}`}
                            alt={`Notice Poster ${currentSlide + 1}`}
                            style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                          />
                        </AnimatePresence>

                        {images.length > 1 && (
                          <>
                            <div style={{ position: 'absolute', top: '50%', left: '0', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 1rem', transform: 'translateY(-50%)' }}>
                              <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.9)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                                style={{ background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
                              >
                                <ChevronLeft size={24} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.9)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setCurrentSlide((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                                style={{ background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}
                              >
                                <ChevronRight size={24} />
                              </motion.button>
                            </div>
                            <div style={{ position: 'absolute', bottom: '1.25rem', left: '0', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
                              {images.map((_, idx) => (
                                <motion.span
                                  layoutId={`dot-${idx}`}
                                  key={idx}
                                  onClick={() => setCurrentSlide(idx)}
                                  style={{
                                    width: idx === currentSlide ? '24px' : '8px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: idx === currentSlide ? '#fff' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                  }}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}

                    {docs.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                        {docs.map((file, idx) => (
                          <a
                            key={idx}
                            href={`http://localhost:5000${file.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-link"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <FileText size={16} />
                            {file.filename}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        <section className="comments-section">
          <h3>Questions & Comments ({notice.comments?.length || 0})</h3>

          <motion.div variants={itemVariants} className="comment-form">
            <textarea
              className="form-input"
              placeholder="Ask a question or leave a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows="3"
              style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', resize: 'none', padding: '1rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submitting}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {submitting ? <Sparkles size={16} className="animate-spin" /> : <Send size={16} />}
                {submitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </motion.div>

          <div className="comments-list">
            {notice.comments?.map((comment, idx) => (
              <div key={idx} className="comment-item" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="comment-user" style={{ fontWeight: 600 }}>{comment.userName}</span>
                  <span className="comment-date" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="comment-text" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>{highlightMentions(comment.text)}</p>

                <div className="comment-actions" style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: (comment.likes || []).includes(currentUserId) ? '#ed4956' : '' }}
                    onClick={() => handleLikeComment(comment._id)}
                  >
                    ❤️ {(comment.likes || []).length} Likes
                  </span>
                  <span
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  >
                    💬 Reply
                  </span>
                </div>

                {replyingTo === comment._id && (
                  <div className="reply-form" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <input
                      className="form-input"
                      style={{ flex: 1, padding: '0.5rem' }}
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <Button size="sm" onClick={() => handleAddReply(comment._id)} disabled={!replyText.trim()}>Reply</Button>
                  </div>
                )}

                {(comment.replies || []).length > 0 && (
                  <div className="replies-list" style={{ marginLeft: '2rem', marginTop: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '1rem' }}>
                    {comment.replies.map((reply, rIdx) => (
                      <div key={rIdx} className="reply-item" style={{ marginBottom: '1rem' }}>
                        <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="comment-user" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{reply.userName}</span>
                          <span className="comment-date" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(reply.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="comment-text" style={{ marginTop: '0.25rem', marginBottom: '0.25rem', fontSize: '0.95rem' }}>{highlightMentions(reply.text)}</p>

                        <div className="comment-actions" style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: (reply.likes || []).includes(currentUserId) ? '#ed4956' : '' }}
                            onClick={() => handleLikeReply(comment._id, reply._id)}
                          >
                            ❤️ {(reply.likes || []).length} Likes
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {(!notice.comments || notice.comments.length === 0) && (
              <p className="no-comments" style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No comments yet. Be the first to ask!</p>
            )}
          </div>
        </section>
      </div>

      {/* Printable Component (Hidden from UI, visible in print) */}
      <div style={{ display: 'none' }}>
        <PrintableNotice ref={printRef} notice={notice} />
      </div>

      <AnimatePresence>
        {showViewersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="viewers-modal-overlay"
            onClick={() => setShowViewersModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="viewers-modal"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>
                  <Eye size={20} /> Viewed By ({[...new Map(notice.readBy.map(v => [v._id, v])).values()].length})
                </h3>
                <button className="close-btn" onClick={() => setShowViewersModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {notice.readBy && notice.readBy.length > 0 ? (
                  <ul className="viewers-list">
                    {[...new Map(notice.readBy.map(v => [v._id, v])).values()].map((viewer, index) => (
                      <motion.li
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        key={index}
                        className="viewer-item"
                      >
                        {viewer.profilePic ? (
                          <img
                            src={`http://localhost:5000${viewer.profilePic}`}
                            alt={viewer.name}
                            className="viewer-avatar"
                          />
                        ) : (
                          <div className="viewer-avatar-placeholder">
                            {(viewer.name || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <span className="viewer-name">{viewer.name || "Unknown User"}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-viewers-text">No one has viewed this yet.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && editForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="viewers-modal-overlay"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="viewers-modal"
              style={{ maxWidth: '600px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3><Edit size={20} style={{ marginRight: '8px' }} /> Edit Notice</h3>
                <button className="close-btn" onClick={() => setIsEditing(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body" style={{ padding: '1.5rem' }}>
                <form className="faculty-form" onSubmit={handleUpdateNotice}>
                  <div className="form-group">
                    <label>Notice Title</label>
                    <input
                      className="form-input"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Content</label>
                    <textarea
                      className="form-input"
                      rows="6"
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Priority Level</label>
                      <select
                        className="form-select"
                        value={editForm.priority}
                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        className="form-input"
                        type="date"
                        value={editForm.expiryDate}
                        onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row" style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                      <label>Department</label>
                      <select
                        className="form-select"
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Management">Management</option>
                        <option value="Administration">Administration</option>
                        <option value="IT Support">IT Support</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        className="form-select"
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value, subType: '' })}
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
                  </div>

                  {editForm.category !== "General" && (
                    <div className="form-row" style={{ marginTop: '1rem' }}>
                      <div className="form-group">
                        <label>Sub-type</label>
                        <select
                          className="form-select"
                          value={editForm.subType || ''}
                          onChange={(e) => setEditForm({ ...editForm, subType: e.target.value })}
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
                            return (types[editForm.category] || []).map(type => (
                              <option key={type} value={type}>{type}</option>
                            ));
                          })()}
                        </select>
                      </div>
                    </div>
                  )}
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Update Poster Photos (Optional)</label>
                    <input
                      type="file"
                      onChange={(e) => setEditAttachments(Array.from(e.target.files))}
                      className="form-input"
                      accept="image/*"
                      multiple
                    />
                  </div>
                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button type="submit" disabled={updating}>
                      {updating ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const PrintableNotice = React.forwardRef(({ notice }, ref) => {
  if (!notice) return null;
  return (
    <div ref={ref} className="printable-notice" style={{ padding: '40px', color: '#000', backgroundColor: '#fff', minHeight: '297mm' }}>
      {/* Official Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', textTransform: 'uppercase' }}>Campus Information System</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#555' }}>Official University Notice Board</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>REF: CIS-{notice._id.substring(18).toUpperCase()}</p>
          <p style={{ margin: '5px 0 0 0' }}>Date: {new Date(notice.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Notice Metadata */}
      <div style={{ marginBottom: '30px' }}>
        <p style={{ margin: '5px 0' }}><strong>Department:</strong> {notice.department || "General"}</p>
        <p style={{ margin: '5px 0' }}><strong>Category:</strong> {notice.category} {notice.subType ? `(${notice.subType})` : ''}</p>
        <p style={{ margin: '5px 0' }}><strong>Priority:</strong> <span style={{ textTransform: 'uppercase' }}>{notice.priority}</span></p>
      </div>

      {/* Main Content */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', textDecoration: 'underline', marginBottom: '25px', textTransform: 'uppercase' }}>{notice.title}</h2>
      </div>

      <div style={{ fontSize: '16px', lineHeight: '1.6', textAlign: 'justify', marginBottom: '60px', whiteSpace: 'pre-wrap' }}>
        {notice.content}
      </div>

      {/* Footer / Signature */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '100px' }}>
        <div style={{ fontSize: '12px', color: '#888' }}>
          <p>Scan this QR to view online</p>
          <div style={{ width: '80px', height: '80px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>[QR CODE]</div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid #000', width: '200px', paddingTop: '10px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{notice.createdBy?.name || "Administrative Head"}</p>
          <p style={{ margin: 0, fontSize: '12px' }}>Authorized Signatory</p>
        </div>
      </div>

      {/* Expiry Warning */}
      <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', borderTop: '1px solid #eee', paddingTop: '10px', fontSize: '10px', color: '#aaa', textAlign: 'center' }}>
        Notice expires on {new Date(notice.expiryDate).toLocaleDateString()}. For internal use only.
      </div>
    </div>
  );
});

export default NoticeDetails;
