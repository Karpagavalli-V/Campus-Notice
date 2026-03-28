import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { getConversations, getConversation, sendMessage } from "../services/messageService";
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

    // Keep ref in sync
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const socketRef = useRef(null);

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
            const currentUserId = currentUser.id;

            if (currentActive && (senderId === currentActive._id || (senderId === currentUserId && recipientId === currentActive._id))) {
                return [...prevMessages, message];
            }
            return prevMessages;
        });

        fetchConversations();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Init socket
        socketRef.current = initSocket(currentUser.id);

        // Listener for new messages
        socketRef.current.on("newMessage", (message) => {
            handleIncomingMessage(message);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.off("newMessage");
            }
        };
    }, [currentUser.id]); // Re-run if user changes

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





    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        setSending(true);
        try {
            // Optimistic update? No, let's wait for simple flow first. 
            // Actually backend emits back to sender too, so we can rely on socket listener 
            // OR we can append immediately.
            // Since we listen to 'newMessage' and backend emits to sender too, 
            // we might get duplicates if we append here AND listen.
            // Backend: req.io.to(req.user.id).emit(...)
            // So I should NOT append here manually if I trust the socket.
            // BUT, usually we want instant feedback.
            // Let's rely on API response for instant feedback and ignore socket message if ID already exists.
            // Or just simpler: Send via API. API returns message. Append it. 
            // If socket also sends it, we need to dedup.
            // Current backend implementation emits to sender.
            // Let's ignore manual append and rely on socket? 
            // It might feel slightly slower (network RTT).
            // Better: Append manually, and when socket message comes, if it has same ID (or temp ID), replace/ignore.
            // Since I don't have temp IDs, simple deduplication:
            // When receiving socket message: check if message with this _id exists.

            await sendMessage(activeConversation._id, newMessage);
            // msg is the saved message from DB.
            // We can append it here.
            // setMessages(prev => [...prev, msg]); 
            // WAIT: If I append here, and verify socket logic:
            // Socket sends to sender (req.user.id).
            // DirectMessages receives "newMessage".
            // We need to check if we already have it.

            // Let's Update handleIncomingMessage to dedup.

            setNewMessage("");
            // fetchConversations(); // handled by incoming socket event
        } catch (error) {
            showToast("Failed to send message. Please try again.", "error");
        } finally {
            setSending(false);
        }
    };

    // Helper to deduplicate in handleIncomingMessage
    // We can use a Set of IDs or just check last message.

    return (
        <div className={`messages-page ${activeConversation ? 'chat-active' : ''}`}>
            <div className="messages-sidebar">
                <header className="messages-header">
                    <h2>Messages</h2>
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ marginTop: '0.5rem' }}>Back to Dashboard</Button>
                </header>
                <div className="conversations-list">
                    {conversations.map((conv) => (
                        <div
                            key={conv.user._id}
                            className={`conversation-item ${activeConversation?._id === conv.user._id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveConversation(conv.user);
                                handleSelectUser(conv.user._id);
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="avatar-circle">
                                    {conv.user.profilePic ?
                                        <img src={`http://localhost:5000${conv.user.profilePic}`} alt="avatar" className="avatar-img" /> :
                                        conv.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <span className="conversation-user">
                                        {conv.user.name}
                                        <span className="conversation-role">{conv.user.role}</span>
                                    </span>
                                    <p className="conversation-last-msg">
                                        {conv.lastMessage.sender === currentUser.id ? 'You: ' : ''}
                                        {conv.lastMessage.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {conversations.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                            No conversations yet.
                        </div>
                    )}
                </div>
            </div>

            <div className="chat-area">
                {activeConversation ? (
                    <>
                        <header className="chat-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button className="back-btn-mobile" onClick={() => setActiveConversation(null)}>
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="avatar-circle sm">
                                    {activeConversation.profilePic ?
                                        <img src={`http://localhost:5000${activeConversation.profilePic}`} alt="avatar" className="avatar-img" /> :
                                        (activeConversation.name ? activeConversation.name.charAt(0).toUpperCase() : '?')}
                                </div>
                                <h3>{activeConversation.name}</h3>
                            </div>
                        </header>

                        <div className="messages-list">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender === currentUser.id || (typeof msg.sender === 'object' && msg.sender._id === currentUser.id);
                                return (
                                    <div
                                        key={idx}
                                        className={`message-bubble ${isMe ? 'sent' : 'received'}`}
                                    >
                                        {msg.content}
                                        <span className="message-time">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMe && <span className="read-status">{msg.read ? ' • Read' : ' • Sent'}</span>}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input
                                className="chat-input"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <Button type="submit" disabled={!newMessage.trim() || sending}>
                                Send
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="empty-chat">
                        <span className="empty-chat-icon">
                            <MessageSquare size={48} />
                        </span>
                        <h3>Select a conversation</h3>
                        <p>Choose a user from the left to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DirectMessages;
