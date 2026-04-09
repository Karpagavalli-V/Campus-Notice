import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MessageSquare, ArrowLeft, Send, Sparkles, MoreVertical, Edit, Trash2, X as CloseIcon, Check, Reply, Phone, Video, Search, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getConversations, getConversation, sendMessage, updateMessage, deleteMessage } from "../services/messageService";
import { initSocket } from "../services/socketService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button/Button";
import "../styles/DirectMessages.css";

function DirectMessages() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const targetUserId = searchParams.get("user");
    const targetUserName = searchParams.get("name");

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const activeConversationRef = useRef(activeConversation);

    // Keep ref in sync for socket handlers
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingMsg, setEditingMsg] = useState(null); // { _id, content }
    const [editValue, setEditValue] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [directorySearch, setDirectorySearch] = useState("");
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [tempStatus, setTempStatus] = useState("");
    const [activeCall, setActiveCall] = useState(null); // { type: 'video' | 'voice', user: {...}, status: 'connecting' | 'ringing' }
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
    const [chatSearchQuery, setChatSearchQuery] = useState("");
    const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
    const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);

    // Media Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const fileInputRef = useRef(null);

    const messagesEndRef = useRef(null);
    const currentUserId = localStorage.getItem("userId");
    const socketRef = useRef(null);

    const startCall = (type) => {
        if (!activeConversation) return;
        const callData = { 
            from: currentUserId, 
            to: activeConversation._id, 
            type, 
            user: currentUser // Send my info to them
        };
        setActiveCall({ type, user: activeConversation, status: 'connecting' });
        socketRef.current.emit("callUser", callData);

        setTimeout(() => {
            setActiveCall(prev => (prev && prev.status === 'connecting') ? { ...prev, status: 'ringing' } : prev);
        }, 3000);
    };

    const answerCall = (accepted) => {
        if (!activeCall) return;
        socketRef.current.emit("answerCall", { to: (activeCall.status === 'incoming' ? activeCall.from : activeCall.user._id), accepted });
        if (accepted) {
            setActiveCall(prev => ({ ...prev, status: 'in-call' }));
            showToast("Call started (WebRTC simulation)", "success");
        } else {
            setActiveCall(null);
        }
    };

    const endCall = () => {
        if (activeCall) {
            const targetId = activeCall.status === 'incoming' ? activeCall.from : activeCall.user._id;
            socketRef.current.emit("endCall", { to: targetId });
        }
        setActiveCall(null);
    };

    const handleIncomingCall = (data) => {
        // data: { from, type, user }
        setActiveCall({ ...data, status: 'incoming' });
        // Optional: play sound here
    };

    const handleCallResponse = (data) => {
        // data: { accepted }
        if (data.accepted) {
            setActiveCall(prev => ({ ...prev, status: 'in-call' }));
            showToast("Call accepted", "success");
        } else {
            setActiveCall(null);
            showToast("Call declined", "info");
        }
    };

    const handleCallEnded = () => {
        setActiveCall(null);
        showToast("Call ended", "info");
    };

    const clearChat = () => {
        if (window.confirm("Clear all messages in this chat?")) {
            setMessages([]);
            setIsHeaderMenuOpen(false);
            showToast("Chat cleared locally.", "info");
        }
    };

    const openContactInfo = () => {
        setIsHeaderMenuOpen(false);
        setIsContactDrawerOpen(true);
    };

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/auth/user/${currentUserId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();
                setCurrentUser(data);
                setTempStatus(data.status || "");
            } catch (err) { console.error("Error fetching me:", err); }
        };
        fetchMe();
    }, [currentUserId]);

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        try {
            await fetch(`http://localhost:5000/api/auth/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: tempStatus })
            });
            setCurrentUser(prev => ({ ...prev, status: tempStatus }));
            setIsStatusModalOpen(false);
            showToast("Status updated!", "success");
        } catch (err) {
            showToast("Failed to update status", "error");
        }
    };

    const fetchAllUsers = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/auth/all`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            setAllUsers(data.filter(u => u._id !== currentUserId));
        } catch (err) {
            console.error("Error fetching directory:", err);
        }
    };

    const fetchConversations = useCallback(async () => {
        try {
            const data = await getConversations();
            setConversations(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            setLoading(false);
        }
    }, []);

    const handleSelectUser = useCallback(async (userId, userDetails = null) => {
        try {
            const msgs = await getConversation(userId);
            setMessages(msgs);

            const existingConv = conversations.find(c => c.user._id === userId);
            if (existingConv) {
                setActiveConversation(existingConv.user);
            } else if (userDetails) {
                setActiveConversation({ _id: userId, ...userDetails });
            } else {
                setActiveConversation({ _id: userId, name: "User" });
            }

            setIsNewChatModalOpen(false);
            setIsChatSearchOpen(false);
            setChatSearchQuery("");
        } catch (error) {
            console.error("Error fetching conversation:", error);
        }
    }, [conversations]);

    const handleIncomingMessage = (message) => {
        const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
        const recipientId = typeof message.recipient === 'object' ? message.recipient._id : message.recipient;

        setMessages(prevMessages => {
            const exists = prevMessages.some(m => m._id === message._id);
            if (exists) return prevMessages;

            const currentActive = activeConversationRef.current;
            const currentUserId = localStorage.getItem("userId");

            if (currentActive && (senderId === currentActive._id || (senderId === currentUserId && recipientId === currentActive._id))) {
                return [...prevMessages, message];
            }
            return prevMessages;
        });
        fetchConversations();
    };

    const handleMessageEdited = (data) => {
        setMessages(prev => prev.map(m =>
            m._id === data.messageId ? { ...m, content: data.content, isEdited: true } : m
        ));
    };

    const handleMessageDeleted = (data) => {
        setMessages(prev => prev.filter(m => m._id !== data.messageId));
        fetchConversations();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        socketRef.current = initSocket(currentUserId);
        socketRef.current.on("newMessage", handleIncomingMessage);
        socketRef.current.on("messageEdited", handleMessageEdited);
        socketRef.current.on("messageDeleted", handleMessageDeleted);
        socketRef.current.on("incomingCall", handleIncomingCall);
        socketRef.current.on("callResponse", handleCallResponse);
        socketRef.current.on("callEnded", handleCallEnded);

        return () => {
            if (socketRef.current) {
                socketRef.current.off("newMessage");
                socketRef.current.off("messageEdited");
                socketRef.current.off("messageDeleted");
                socketRef.current.off("incomingCall");
                socketRef.current.off("callResponse");
                socketRef.current.off("callEnded");
            }
        };
    }, [currentUserId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !activeConversation) return;

        setSending(true);
        try {
            const formData = new FormData();
            formData.append("recipientId", activeConversation._id);
            if (newMessage.trim()) formData.append("content", newMessage);
            if (replyingTo) formData.append("parentMessageId", replyingTo._id);
            if (selectedFile) formData.append("media", selectedFile);

            await sendMessage(formData);
            setNewMessage("");
            setReplyingTo(null);
            setSelectedFile(null);
            setFilePreview(null);
        } catch (error) {
            showToast("Failed to send message.", "error");
        } finally {
            setSending(false);
        }
    };

    const onEdit = async (e) => {
        e.preventDefault();
        if (!editValue.trim() || !editingMsg) return;
        try {
            await updateMessage(editingMsg._id, editValue);
            setEditingMsg(null);
            setEditValue("");
        } catch (err) {
            showToast("Failed to edit message.", "error");
        }
    };

    const onDelete = async (messageId) => {
        if (!window.confirm("Delete this message for everyone?")) return;
        try {
            await deleteMessage(messageId);
            setOpenMenuId(null);
        } catch (err) {
            showToast("Failed to delete message.", "error");
        }
    };

    const onReply = (message) => {
        setReplyingTo(message);
        setOpenMenuId(null);
    };

    const openDirectory = () => {
        fetchAllUsers();
        setIsNewChatModalOpen(true);
    };

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (targetUserId) {
            handleSelectUser(targetUserId, { name: targetUserName });
        }
    }, [targetUserId, targetUserName, handleSelectUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const filteredConversations = conversations.filter(conv => 
        conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredDirectory = allUsers.filter(u => 
        u.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
        u.role.toLowerCase().includes(directorySearch.toLowerCase())
    );

    const filteredMessages = isChatSearchOpen && chatSearchQuery
        ? messages.filter(m => m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()))
        : messages;

    // Animation Variants
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };
    const messageVariants = { hidden: { opacity: 0, scale: 0.8, y: 10 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } } };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className={`direct-messages-layout ${activeConversation ? 'chat-active' : ''}`}
        >
            <div className="sidebar">
                <AnimatePresence>
                    {isStatusModalOpen && (
                        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="sidebar-drawer">
                            <header className="drawer-header mini">
                                <ArrowLeft size={24} onClick={() => setIsStatusModalOpen(false)} style={{ cursor: 'pointer' }} />
                                <h3>Profile</h3>
                            </header>
                            <div className="status-section">
                                <div className="avatar-circle xlg" style={{ margin: '0 auto 30px' }}>
                                    {currentUser?.profilePic ? <img src={`http://localhost:5000${currentUser.profilePic}`} alt="" className="avatar-img" /> : currentUser?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="status-label">Your Name</div>
                                <div className="status-value">{currentUser?.name}</div>
                                <div className="status-label">About</div>
                                <form onSubmit={handleUpdateStatus} className="status-edit-form">
                                    <input className="status-input" value={tempStatus} onChange={(e) => setTempStatus(e.target.value)} placeholder="Add a status..." />
                                    <button type="submit" className="status-save-btn"><Check size={20} /></button>
                                </form>
                                <p className="status-info-text">This name will be visible to your Campus Notice contacts.</p>
                            </div>
                        </motion.div>
                    )}
                    {isNewChatModalOpen && (
                        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="sidebar-drawer">
                            <header className="drawer-header">
                                <ArrowLeft size={24} onClick={() => setIsNewChatModalOpen(false)} style={{ cursor: 'pointer' }} />
                                <h3>New Chat</h3>
                            </header>
                            <div className="search-bar-container">
                                <div className="search-bar">
                                    <Search size={18} />
                                    <input placeholder="Search name or role" value={directorySearch} onChange={(e) => setDirectorySearch(e.target.value)} />
                                </div>
                            </div>
                            <div className="directory-list">
                                {filteredDirectory.map(user => (
                                    <div key={user._id} className="conversation-item" onClick={() => handleSelectUser(user._id, user)}>
                                        <div className="conv-content">
                                            <div className="avatar-circle">
                                                {user.profilePic ? <img src={`http://localhost:5000${user.profilePic}`} alt="" className="avatar-img" /> : user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="conv-details">
                                                <span className="conversation-user">{user.name}</span>
                                                <p className="conversation-role-text">{user.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="sidebar-header">
                    <div className="profile-actions">
                        <div className="avatar-circle sm" onClick={() => setIsStatusModalOpen(true)} style={{ cursor: 'pointer' }}>
                            {currentUser?.profilePic ? <img src={`http://localhost:5000${currentUser.profilePic}`} alt="" className="avatar-img" /> : currentUser?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="header-icons">
                            <motion.button onClick={() => navigate(-1)} title="Back to Campus"><ArrowLeft size={22} /></motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setIsStatusModalOpen(true)} title="My Status"><Sparkles size={24} /></motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} onClick={openDirectory} title="New Chat"><MessageSquare size={24} /></motion.button>
                            <motion.button whileHover={{ scale: 1.1 }}><MoreVertical size={24} /></motion.button>
                        </div>
                    </div>
                </div>
                <div className="search-bar-container">
                    <div className="search-bar">
                        <Search size={18} />
                        <input placeholder="Search or start new chat" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>
                <motion.div className="conversations-list" variants={containerVariants} initial="hidden" animate="visible">
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map((conv) => (
                            <motion.div key={conv.user._id} variants={itemVariants} whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.03)" }} className={`conversation-item ${activeConversation?._id === conv.user._id ? 'active' : ''}`} onClick={() => handleSelectUser(conv.user._id, conv.user)}>
                                <div className="conv-content">
                                    <div className="avatar-circle">{conv.user.profilePic ? <img src={`http://localhost:5000${conv.user.profilePic}`} alt="" className="avatar-img" /> : conv.user.name.charAt(0).toUpperCase()}</div>
                                    <div className="conv-details">
                                        <div className="conv-row">
                                            <span className="conversation-user">{conv.user.name}</span>
                                            <span className="conv-time">{new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="conv-row">
                                            <p className="conversation-last-msg">
                                                {(typeof conv.lastMessage.sender === 'object' ? conv.lastMessage.sender._id : conv.lastMessage.sender) === currentUserId ? 'You: ' : ''}
                                                {conv.lastMessage.mediaUrl && !conv.lastMessage.content ? '📷 Photo' : conv.lastMessage.content}
                                            </p>
                                            {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="no-conv-placeholder">
                            <p>No chats found</p>
                            <button className="start-chat-btn" onClick={openDirectory}>Start a new chat</button>
                        </div>
                    )}
                </motion.div>
            </div>

            <div className="chat-area">
                <AnimatePresence>
                {activeCall && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="call-overlay">
                        <div className="call-info">
                            <div className="avatar-circle lg">{activeCall.user.profilePic ? <img src={`http://localhost:5000${activeCall.user.profilePic}`} alt="" className="avatar-img" /> : activeCall.user.name?.charAt(0).toUpperCase()}</div>
                            <h2>{activeCall.user.name}</h2>
                            <p className="calling-status">
                                {activeCall.status === 'connecting' && 'Connecting...'}
                                {activeCall.status === 'ringing' && 'Ringing...'}
                                {activeCall.status === 'incoming' && 'Incoming Call...'}
                                {activeCall.status === 'in-call' && 'In Call'}
                            </p>
                        </div>
                        <div className="call-actions">
                            {activeCall.status === 'incoming' ? (
                                <>
                                    <button className="call-btn accept" onClick={() => answerCall(true)} style={{ backgroundColor: '#25d366' }}><Phone size={24} /></button>
                                    <button className="call-btn end" onClick={() => answerCall(false)}><Phone size={24} style={{ transform: 'rotate(135deg)' }} /></button>
                                </>
                            ) : (
                                <>
                                    <button className="call-btn end" onClick={endCall}><Phone size={24} style={{ transform: 'rotate(135deg)' }} /></button>
                                    {activeCall.type === 'video' && <button className="call-btn"><Video size={24} /></button>}
                                    <button className="call-btn"><MoreVertical size={24} /></button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}

                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {activeConversation ? (
                        <motion.div key={activeConversation._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="chat-container-inner" >
                            <header className="chat-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, cursor: 'pointer' }} onClick={openContactInfo}>
                                    <button className="back-btn-mobile" onClick={(e) => { e.stopPropagation(); setActiveConversation(null); }}><ArrowLeft size={20} /></button>
                                    <div className="avatar-circle sm">{activeConversation.profilePic ? <img src={`http://localhost:5000${activeConversation.profilePic}`} alt="" className="avatar-img" /> : activeConversation.name?.charAt(0).toUpperCase()}</div>
                                    <div className="header-info"><h3>{activeConversation.name}</h3><span className="online-status">online</span></div>
                                </div>
                                {isChatSearchOpen ? (
                                    <div className="header-search-box">
                                        <input autoFocus placeholder="Search messages..." value={chatSearchQuery} onChange={(e) => setChatSearchQuery(e.target.value)} />
                                        <CloseIcon size={20} onClick={() => { setIsChatSearchOpen(false); setChatSearchQuery(""); }} style={{ cursor: 'pointer' }} />
                                    </div>
                                ) : (
                                    <div className="header-actions">
                                        <Video size={22} onClick={() => startCall('video')} style={{ cursor: 'pointer' }} />
                                        <Phone size={22} onClick={() => startCall('voice')} style={{ cursor: 'pointer' }} />
                                        <Search size={22} onClick={() => setIsChatSearchOpen(true)} style={{ cursor: 'pointer' }} />
                                        <div className="menu-container">
                                            <MoreVertical size={22} onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)} style={{ cursor: 'pointer' }} />
                                            <AnimatePresence>
                                                {isHeaderMenuOpen && (
                                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="header-dropdown" >
                                                        <button onClick={openContactInfo}>View contact</button>
                                                        <button onClick={openContactInfo}>Media, links, and docs</button>
                                                        <button onClick={() => { setIsChatSearchOpen(true); setIsHeaderMenuOpen(false); }}>Search</button>
                                                        <button onClick={() => showToast("Mute coming soon", "info")}>Mute notifications</button>
                                                        <button onClick={clearChat}>Clear chat</button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}
                            </header>

                            <div className="messages-list">
                                <AnimatePresence initial={false}>
                                    {filteredMessages.map((msg, idx) => {
                                        const isMe = (typeof msg.sender === 'object' ? msg.sender._id : msg.sender) === currentUserId;
                                        const isEditing = editingMsg?._id === msg._id;
                                        return (
                                            <motion.div key={msg._id || idx} variants={messageVariants} initial="hidden" animate="visible" layout className={`message-bubble-wrapper ${isMe ? 'sent' : 'received'}`}>
                                                <div className="message-bubble">
                                                    {msg.replyTo && (
                                                        <div className="replied-content-preview">
                                                            <div className="replied-user">{(typeof msg.replyTo.sender === 'object' ? msg.replyTo.sender._id : msg.replyTo.sender) === currentUserId ? 'You' : activeConversation.name}</div>
                                                            <div className="replied-text">{msg.replyTo.mediaUrl && <span style={{marginRight:'5px'}}>📷 Photo</span>}{msg.replyTo.content}</div>
                                                        </div>
                                                    )}
                                                    {msg.mediaUrl && (
                                                        <div className="msg-media-bubble">
                                                            <img src={`http://localhost:5000${msg.mediaUrl}`} alt="media" className="msg-media-img" />
                                                        </div>
                                                    )}
                                                    {isEditing ? (
                                                        <form className="msg-edit-form" onSubmit={onEdit}>
                                                            <input autoFocus className="msg-edit-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                                                            <div className="edit-actions">
                                                                <button type="button" onClick={() => setEditingMsg(null)}><CloseIcon size={14} /></button>
                                                                <button type="submit"><Check size={14} /></button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <>
                                                            {msg.content && <div className="msg-content">{msg.content}{msg.isEdited && <span className="edited-tag">(edited)</span>}</div>}
                                                            {!isEditing && (
                                                                <div className="msg-options-trigger">
                                                                    <button onClick={() => setOpenMenuId(openMenuId === msg._id ? null : msg._id)}><MoreVertical size={14} /></button>
                                                                    <AnimatePresence>
                                                                        {openMenuId === msg._id && (
                                                                            <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} className="msg-context-menu">
                                                                                <button onClick={() => onReply(msg)}><Reply size={12} /> Reply</button>
                                                                                {isMe && !msg.mediaUrl && <button onClick={() => { setEditingMsg(msg); setEditValue(msg.content); setOpenMenuId(null); }}><Edit size={12} /> Edit</button>}
                                                                                {isMe && <button onClick={() => onDelete(msg._id)} className="delete-opt"><Trash2 size={12} /> Delete</button>}
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                    <span className="message-time">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isMe && (
                                                            <span className={`read-status ${msg.read ? 'read' : ''}`}>
                                                                {msg.read ? (
                                                                    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M4.53033 7.46967L1.28033 4.21967C0.987437 3.92678 0.512563 3.92678 0.21967 4.21967C-0.0732233 4.51256 -0.0732233 4.98744 0.21967 5.28033L3.99849 9.05915C4.29177 9.35244 4.76757 9.3517 5.06 9.0575L14.7803 1.28033C15.0732 1.04602 15.0142 0.573223 14.7803 0.28033C14.5463 -0.0125631 14.125 0.21967 13.8321 0.45398L4.53033 7.46967Z" fill="currentColor"/>
                                                                        <path d="M9.53033 7.46967L6.28033 4.21967C5.98744 3.92678 5.51256 3.92678 5.21967 4.21967C4.92678 4.51256 4.92678 4.98744 5.21967 5.28033L8.99849 9.05915C9.29177 9.35244 9.76757 9.3517 10.06 9.0575L15.7803 4.28033C16.0732 4.04602 16.0142 3.57322 15.7803 3.28033C15.5463 2.98744 15.125 3.21967 14.8321 3.45398L9.53033 7.46967Z" fill="currentColor"/>
                                                                    </svg>
                                                                ) : (
                                                                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M1.21967 3.21967C0.926777 2.92678 0.451903 2.92678 0.15901 3.21967C-0.133883 3.51256 -0.133883 3.98744 0.15901 4.28033L3.93783 8.05915C4.23111 8.35244 4.70691 8.3517 4.99934 8.0575L10.7196 2.28033C11.0125 2.04602 10.9535 1.57322 10.7196 1.28033C10.4856 0.987437 10.0643 1.21967 9.77138 1.45398L4.53033 6.46967L1.21967 3.21967Z" fill="currentColor"/>
                                                                    </svg>
                                                                )}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="chat-input-area" onSubmit={handleSendMessage}>
                                <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                                <AnimatePresence>
                                    {(replyingTo || filePreview) && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="reply-preview-container">
                                            {filePreview && (
                                                <div className="file-preview-box">
                                                    <img src={filePreview} alt="preview" className="img-preview-thumb" />
                                                    <button type="button" onClick={() => { setSelectedFile(null); setFilePreview(null); }} className="close-reply"><CloseIcon size={16} /></button>
                                                </div>
                                            )}
                                            {replyingTo && !filePreview && (
                                                <div className="reply-preview-content">
                                                    <div className="reply-preview-user">Replying to {(typeof replyingTo.sender === 'object' ? replyingTo.sender._id : replyingTo.sender) === currentUserId ? 'yourself' : activeConversation.name}</div>
                                                    <div className="reply-preview-text">{replyingTo.content}</div>
                                                </div>
                                            )}
                                            {replyingTo && !filePreview && <button type="button" onClick={() => setReplyingTo(null)} className="close-reply"><CloseIcon size={16} /></button>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className="input-row">
                                    <button type="button" className="attachment-btn" onClick={() => fileInputRef.current?.click()}><Paperclip size={22} color="#54656f" /></button>
                                    <input className="chat-input" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                                    <Button type="submit" disabled={(!newMessage.trim() && !selectedFile) || sending} style={{ width: '45px', height: '45px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#008069' }}><Send size={20} color="white" /></Button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="empty-chat">
                            <motion.span className="empty-chat-icon" animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}><MessageSquare size={48} /></motion.span>
                            <h3>Select a conversation</h3>
                            <p>Choose a user from the left to start chatting</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isContactDrawerOpen && activeConversation && (
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="right-drawer">
                            <header className="drawer-header mini">
                                <CloseIcon size={24} onClick={() => setIsContactDrawerOpen(false)} style={{ cursor: 'pointer' }} />
                                <h3>Contact info</h3>
                            </header>
                            <div className="drawer-content">
                                <div className="contact-info-card">
                                    <div className="avatar-circle xlg">{activeConversation.profilePic ? <img src={`http://localhost:5000${activeConversation.profilePic}`} alt="" className="avatar-img" /> : activeConversation.name?.charAt(0).toUpperCase()}</div>
                                    <h2 className="contact-info-name">{activeConversation.name}</h2>
                                    <p className="contact-info-role">{activeConversation.role}</p>
                                </div>
                                <div className="contact-info-section">
                                    <div className="section-label">About and status</div>
                                    <div className="section-value text-lg">{activeConversation.status || "Hey there! I am using Campus Notice."}</div>
                                </div>
                                <div className="contact-info-section">
                                    <div className="section-label">Media, links and docs</div>
                                    <div className="media-gallery-grid">
                                        {messages.filter(m => m.mediaUrl).slice(-6).map((m, i) => (
                                            <div key={i} className="gallery-item">
                                                <img src={`http://localhost:5000${m.mediaUrl}`} alt="" />
                                            </div>
                                        ))}
                                        {messages.filter(m => m.mediaUrl).length === 0 && <div className="section-value link">No media shared yet</div>}
                                    </div>
                                    {messages.filter(m => m.mediaUrl).length > 6 && <div className="section-value link" style={{marginTop:'5px', textAlign:'right'}}>View all</div>}
                                </div>
                                <div className="contact-info-section actionable"><div className="action-item danger">Block {activeConversation.name}</div><div className="action-item danger">Report {activeConversation.name}</div></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default DirectMessages;
