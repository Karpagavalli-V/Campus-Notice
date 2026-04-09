import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Heart, Send, MessageCircle, MoreHorizontal, AlertTriangle, Archive, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../Badge/Badge';
import './NoticeCard.css';
import { toggleLikeNotice } from '../../../services/noticeService';
import { useToast } from '../../../context/ToastContext';

const NoticeCard = ({ notice, onClick, isSaved, onToggleSave }) => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [reactions, setReactions] = React.useState(notice.reactions || []);
    const [likeCount, setLikeCount] = React.useState(notice.likes?.length || 0);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [isFollowing, setIsFollowing] = React.useState(false);
    const [showReactionPicker, setShowReactionPicker] = React.useState(false);

    // My reaction
    const myReaction = reactions.find(r => r.user === localStorage.getItem('userId'))?.type;
    const [userReaction, setUserReaction] = React.useState(myReaction);

    React.useEffect(() => {
        const fetchFollowingStatus = async () => {
            try {
                const following = await import('../../../services/authService').then(m => m.getFollowing());
                setIsFollowing(following.some(f => f._id === notice.createdBy?._id || f._id === notice.author?._id));
            } catch (err) { }
        };
        if (notice.createdBy || notice.author) {
            fetchFollowingStatus();
        }
    }, [notice.createdBy, notice.author]);

    const isArchived = notice.isArchived || (notice.expiryDate && new Date(notice.expiryDate) < new Date());

    // Extract images from attachments
    const images = (notice.attachments || []).filter(f => f.fileType?.startsWith('image') || f.filename?.match(/\.(jpg|jpeg|png|gif)$/i));

    const handleSaveClick = (e) => {
        e.stopPropagation();
        onToggleSave(notice._id);
    };

    const handleAdvancedReaction = async (type) => {
        try {
            const res = await import('../../../services/noticeService').then(m => m.toggleReaction(notice._id, type));
            setReactions(res.reactions);
            const mine = res.reactions.find(r => r.user === localStorage.getItem('userId'));
            setUserReaction(mine ? mine.type : null);
            setShowReactionPicker(false);

            // Pop effect for like count
            setLikeCount(res.reactions.length);
        } catch (err) {
            showToast("Failed to react", "error");
        }
    };

    const reactionIcons = {
        excellent: '👏',
        love: '❤️',
        zap: '⚡',
        insightful: '💡',
        like: '👍'
    };

    const handleFollowClick = async (e) => {
        e.stopPropagation();
        try {
            const authorId = notice.createdBy?._id || notice.author?._id;
            if (!authorId) return;
            const res = await import('../../../services/authService').then(m => m.toggleFollow(authorId));
            setIsFollowing(res.isFollowing);
            showToast(res.message, "success");
        } catch (err) {
            showToast("Failed to update follow status", "error");
        }
    };

    const handleShareClick = async (e) => {
        e.stopPropagation();
        const url = `${window.location.origin}/notice/${notice._id}`;
        const title = notice.title || 'Campus Update';
        const text = `Check out this notice: ${title}`;

        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
                showToast("Notice shared successfully!", "success");
            } catch (err) {
                // User cancelled share or it failed, ignore
            }
        } else {
            navigator.clipboard.writeText(url);
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, '_blank');
            showToast("Link copied to clipboard. Opening WhatsApp...", "success");
        }
    };

    const handleActionClick = (e) => {
        e.stopPropagation();
        onClick();
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return "Just now";
        if (minutes < 60) return `${minutes} mins ago`;
        if (hours < 24) return `${hours} hrs ago`;
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <motion.article
            className="unique-notice-card"
            onClick={handleActionClick}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{
                y: -12,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
                transition: { duration: 0.4, ease: "easeOut" }
            }}
            transition={{
                type: "spring",
                stiffness: 80,
                damping: 15
            }}
        >
            {/* Header: Professional Info */}
            <header className="card-header">
                <div className="user-profile-wrapper">
                    <motion.div
                        className="user-avatar-modern"
                        onClick={(e) => { e.stopPropagation(); navigate(`/user/${notice.author?._id || notice.createdBy?._id}`); }}
                        style={{ cursor: 'pointer' }}
                        whileHover={{
                            scale: 1.15,
                            rotate: [0, -10, 10, 0],
                            boxShadow: "0 0 15px var(--brand-primary)"
                        }}
                    >
                        {notice.author?.name?.[0]?.toUpperCase() || notice.createdBy?.name?.[0]?.toUpperCase() || 'N'}
                    </motion.div>
                    <div className="user-info-text">
                        <div className="name-row">
                            <span
                                className="user-name-modern"
                                onClick={(e) => { e.stopPropagation(); navigate(`/user/${notice.author?._id || notice.createdBy?._id}`); }}
                                style={{ cursor: 'pointer' }}
                            >
                                {notice.author?.name || notice.createdBy?.name || 'Campus Faculty'}
                            </span>
                            {(notice.author?._id || notice.createdBy?._id) && (notice.author?._id !== localStorage.getItem('userId') && notice.createdBy?._id !== localStorage.getItem('userId')) && (
                                <>
                                    <span className="meta-dot small">•</span>
                                    <motion.button
                                        onClick={handleFollowClick}
                                        whileHover={{ scale: 1.05, backgroundColor: "var(--brand-primary)", color: "white" }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`follow-btn-modern ${isFollowing ? 'following' : ''}`}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </motion.button>
                                </>
                            )}
                        </div>
                        <span className="notice-meta-modern">{notice.department} • {formatTimeAgo(notice.createdAt)}</span>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.8 }}
                    className="more-btn-modern"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal size={18} />
                </motion.button>
            </header>

            {/* Poster Area */}
            <div className={`poster-area category-${(notice.category || 'General').toLowerCase().replace(/\s+/g, '-')}`}>
                <AnimatePresence mode="popLayout" initial={false}>
                    {images.length > 0 ? (
                        <motion.div
                            key={`carousel-${currentImageIndex}`}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="carousel-view"
                            style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
                        >
                            <img
                                src={`http://localhost:5000${images[currentImageIndex].url}`}
                                alt="Notice Slide"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {images.length > 1 && (
                                <>
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="carousel-nav prev" onClick={prevImage}>❮</motion.button>
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="carousel-nav next" onClick={nextImage}>❯</motion.button>
                                    <div className="carousel-dots">
                                        {images.map((_, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ scale: 1.5 }}
                                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                                style={{ padding: '4px', cursor: 'pointer' }}
                                            >
                                                <span style={{
                                                    display: 'block',
                                                    width: idx === currentImageIndex ? '16px' : '6px',
                                                    height: '6px',
                                                    borderRadius: '3px',
                                                    background: idx === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                                                    transition: 'all 0.3s'
                                                }} />
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="text-poster"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.02 }}
                            className="poster-content-wrapper"
                            style={{ width: '100%', height: '100%' }}
                        >
                            <div className="poster-overlay"></div>
                            <div className="poster-content">
                                <motion.h2
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="poster-title"
                                >{notice.title || 'Campus Update'}</motion.h2>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '60px' }}
                                    className="poster-divider"
                                ></motion.div>
                                <motion.p
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="poster-text"
                                >
                                    {(notice.content || '').substring(0, 200)}
                                    {notice.content?.length > 200 && '...'}
                                </motion.p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {notice.priority === 'Emergency' && !isArchived && (
                        <motion.div
                            initial={{ scale: 0, x: 20 }}
                            animate={{ scale: 1, x: 0 }}
                            exit={{ scale: 0, x: 20 }}
                            className="card-priority-badge emergency"
                        >
                            <AlertTriangle size={14} /> Emergency
                        </motion.div>
                    )}
                    {isArchived && (
                        <motion.div
                            initial={{ scale: 0, x: 20 }}
                            animate={{ scale: 1, x: 0 }}
                            exit={{ scale: 0, x: 20 }}
                            className="card-priority-badge archived"
                        >
                            <Archive size={14} /> Archived
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Interaction Bar */}
            <div className="card-interactions">
                <div className="left-interactions">
                    <div className="reaction-container"
                        onMouseEnter={() => setShowReactionPicker(true)}
                        onMouseLeave={() => setShowReactionPicker(false)}
                        style={{ position: 'relative' }}>
                        <motion.button
                            whileTap={{ scale: 0.7 }}
                            className={`interaction-btn ${userReaction ? 'active' : ''}`}
                            onClick={() => handleAdvancedReaction(userReaction || 'like')}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={userReaction || 'none'}
                                    initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
                                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                >
                                    {userReaction ? <span>{reactionIcons[userReaction]}</span> : <Heart size={20} color="currentColor" />}
                                </motion.div>
                            </AnimatePresence>
                            <motion.span
                                key={likeCount}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                {likeCount}
                            </motion.span>
                        </motion.button>

                        <AnimatePresence>
                            {showReactionPicker && (
                                <motion.div
                                    className="reaction-picker-bubble"
                                    initial={{ opacity: 0, y: 15, scale: 0.8, x: '-50%' }}
                                    animate={{ opacity: 1, y: -15, scale: 1, x: '-50%' }}
                                    exit={{ opacity: 0, y: 15, scale: 0.8, x: '-50%' }}
                                    style={{ left: '50%' }}
                                >
                                    {Object.entries(reactionIcons).map(([key, emoji], idx) => (
                                        <motion.button
                                            key={key}
                                            className={`emoji-choice ${userReaction === key ? 'active' : ''}`}
                                            initial={{ scale: 0, y: 10 }}
                                            animate={{ scale: 1, y: 0 }}
                                            transition={{
                                                delay: idx * 0.04,
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 15
                                            }}
                                            whileHover={{
                                                scale: 1.5,
                                                y: -5,
                                                transition: { duration: 0.1 }
                                            }}
                                            onClick={(e) => { e.stopPropagation(); handleAdvancedReaction(key); }}
                                        >
                                            {emoji}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <motion.button
                        whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                        whileTap={{ scale: 0.9 }}
                        className="interaction-btn"
                        onClick={handleActionClick}
                    >
                        <MessageCircle size={20} />
                        <span>Discuss</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                        whileTap={{ scale: 0.9 }}
                        className="interaction-btn"
                        onClick={handleShareClick}
                    >
                        <Share2 size={20} />
                        <span>Share</span>
                    </motion.button>
                </div>
                <motion.button
                    whileHover={{ scale: 1.2, color: "var(--brand-primary)" }}
                    whileTap={{ scale: 0.8 }}
                    className={`interaction-btn bookmark-btn ${isSaved ? 'active' : ''}`}
                    onClick={handleSaveClick}
                >
                    <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                </motion.button>
            </div>

            {/* Footer */}
            <footer className="card-footer">
                <div className="stats-row">
                    <motion.span layout className="like-count">{likeCount} likes</motion.span>
                    <span className="dot">•</span>
                    <motion.span layout className="view-count">{notice.readBy?.length || 0} views</motion.span>
                </div>
                {notice.category && (
                    <div className="category-tag-row" style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '10px' }}>
                        <motion.span
                            whileHover={{ scale: 1.1, x: 5 }}
                            className="main-cat-tag"
                            style={{
                                padding: '4px 10px',
                                background: 'rgba(139, 92, 246, 0.1)',
                                color: 'var(--brand-primary)',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                            }}
                        >
                            #{notice.category.replace(/\s+/g, '')}
                        </motion.span>
                        {notice.subType && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '500' }}>{notice.subType}</span>
                        )}
                        {notice.mentions && notice.mentions.length > 0 && (
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="tag-indicator"
                                style={{ display: 'flex', gap: '4px', fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: '600', marginLeft: 'auto' }}
                            >
                                🏷️ {notice.mentions.length} mentioned
                            </motion.div>
                        )}
                    </div>
                )}
            </footer>
        </motion.article>
    );
};

export default NoticeCard;
