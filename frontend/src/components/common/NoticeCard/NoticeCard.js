import React from 'react';
import { Bookmark, Heart, Send, MessageCircle, MoreHorizontal, AlertTriangle, Archive } from 'lucide-react';
import Badge from '../Badge/Badge';
import './NoticeCard.css';
import { toggleLikeNotice } from '../../../services/noticeService';
import { useToast } from '../../../context/ToastContext'; // Assuming ToastContext is available here

const NoticeCard = ({ notice, onClick, isSaved, onToggleSave }) => {
    const { showToast } = useToast();
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
            } catch (err) {}
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

    const handleReactionClick = async (type) => {
        try {
            const res = await toggleLikeNotice(notice._id); // Existing simple toggle
            setUserReaction(res.liked ? 'excellent' : null);
            setLikeCount(res.likeCount);
        } catch (err) {
            showToast("Failed to react.", "error");
        }
    };

    const handleAdvancedReaction = async (type) => {
        try {
            const res = await import('../../../services/noticeService').then(m => m.toggleReaction(notice._id, type));
            setReactions(res.reactions);
            const mine = res.reactions.find(r => r.user === localStorage.getItem('userId'));
            setUserReaction(mine ? mine.type : null);
            setShowReactionPicker(false);
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
        } catch(err) {
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
        <article className="unique-notice-card" onClick={handleActionClick}>
            {/* Header: Professional Info */}
            <header className="card-header">
                <div className="user-profile-wrapper">
                    <div className="user-avatar-modern">
                        {notice.author?.name?.[0]?.toUpperCase() || notice.createdBy?.name?.[0]?.toUpperCase() || 'N'}
                    </div>
                    <div className="user-info-text">
                        <div className="name-row">
                            <span className="user-name-modern">{notice.author?.name || notice.createdBy?.name || 'Campus Faculty'}</span>
                            {(notice.author?._id || notice.createdBy?._id) && (notice.author?._id !== localStorage.getItem('userId') && notice.createdBy?._id !== localStorage.getItem('userId')) && (
                                <>
                                    <span className="meta-dot small">•</span>
                                    <button 
                                        onClick={handleFollowClick}
                                        className={`follow-btn-modern ${isFollowing ? 'following' : ''}`}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                </>
                            )}
                        </div>
                        <span className="notice-meta-modern">{notice.department} • {formatTimeAgo(notice.createdAt)}</span>
                    </div>
                </div>
                <button className="more-btn-modern" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal size={18} />
                </button>
            </header>

            {/* Poster Area: Transforming text into a visual card */}
            <div className={`poster-area category-${(notice.category || 'General').toLowerCase().replace(/\s+/g, '-')}`}>
                {images.length > 0 ? (
                    <div className="carousel-view" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                        <img 
                            src={`http://localhost:5000${images[currentImageIndex].url}`} 
                            alt="Notice Slide" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        {images.length > 1 && (
                            <>
                                <button className="carousel-nav prev" onClick={prevImage} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', zIndex: 10 }}>❮</button>
                                <button className="carousel-nav next" onClick={nextImage} style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', zIndex: 10 }}>❯</button>
                                <div className="carousel-dots" style={{ position: 'absolute', bottom: '10px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                    {images.map((_, idx) => (
                                        <div key={idx} style={{ padding: '4px' }} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}>
                                            <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', background: idx === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'background 0.3s', cursor: 'pointer' }} />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="poster-overlay"></div>
                        <div className="poster-content">
                            <h2 className="poster-title">{notice.title || 'Campus Update'}</h2>
                            <div className="poster-divider"></div>
                            <p className="poster-text">
                                {(notice.content || '').substring(0, 200)}
                                {notice.content?.length > 200 && '...'}
                            </p>
                        </div>
                    </>
                )}

                {notice.priority === 'Emergency' && !isArchived && (
                    <div className="card-priority-badge emergency">
                        <AlertTriangle size={14} /> Emergency
                    </div>
                )}
                {isArchived && (
                    <div className="card-priority-badge archived">
                        <Archive size={14} /> Archived
                    </div>
                )}
            </div>

            {/* Interaction Bar: Unique & Minimalist */}
            <div className="card-interactions">
                <div className="left-interactions">
                    <div className="reaction-container" 
                         onMouseEnter={() => setShowReactionPicker(true)}
                         onMouseLeave={() => setShowReactionPicker(false)}
                         style={{ position: 'relative' }}>
                        <button
                            className={`interaction-btn ${userReaction ? 'active' : ''}`}
                            onClick={() => handleAdvancedReaction(userReaction || 'like')}
                        >
                            {userReaction ? <span>{reactionIcons[userReaction]}</span> : <Heart size={20} color="currentColor" />}
                            <span>{reactions.length || likeCount}</span>
                        </button>
                        
                        {showReactionPicker && (
                            <div className="reaction-picker-bubble">
                                {Object.entries(reactionIcons).map(([key, emoji]) => (
                                    <button 
                                        key={key} 
                                        className="emoji-choice"
                                        onClick={(e) => { e.stopPropagation(); handleAdvancedReaction(key); }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="interaction-btn" onClick={handleActionClick}>
                        <MessageCircle size={20} />
                        <span>Discuss</span>
                    </button>
                    <button className="interaction-btn" onClick={handleShareClick}>
                        <Send size={20} />
                        <span>Share</span>
                    </button>
                </div>
                <button
                    className={`interaction-btn bookmark-btn ${isSaved ? 'active' : ''}`}
                    onClick={handleSaveClick}
                >
                    <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Footer: Views & Category */}
            <footer className="card-footer">
                <div className="stats-row">
                    <span className="like-count">{likeCount} likes</span>
                    <span className="dot">•</span>
                    <span className="view-count">{notice.readBy?.length || 0} views</span>
                </div>
                {notice.category && (
                    <div className="category-tag" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span>#{notice.category.replace(/\s+/g, '')}</span>
                        {notice.subType && (
                            <span style={{ color: 'var(--brand-primary)', fontWeight: '600' }}>• {notice.subType}</span>
                        )}
                        {notice.mentions && notice.mentions.length > 0 && (
                            <div className="tagged-users" style={{ display: 'flex', gap: '4px', fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: '600', marginLeft: 'auto' }}>
                                🏷️ {notice.mentions.length} mentioned
                            </div>
                        )}
                    </div>
                )}
            </footer>
        </article>
    );
};

export default NoticeCard;
