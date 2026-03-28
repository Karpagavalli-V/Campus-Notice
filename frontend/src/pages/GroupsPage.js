import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, ArrowLeft, Send } from "lucide-react";
import api from "../services/apiService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button/Button";
import "../styles/DirectMessages.css"; // Reuse chat styles

function GroupsPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [groups, setGroups] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [followers, setFollowers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const currentUser = { id: localStorage.getItem("userId"), role: localStorage.getItem("role") };

    const fetchGroups = useCallback(async () => {
        try {
            const response = await api.get('/groups');
            setGroups(response.data);
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFollowers = useCallback(async () => {
        if (currentUser.role === 'student') {
            try {
                const data = await import("../services/authService").then(m => m.getFollowing());
                setFollowers(data);
            } catch(err) {
                console.error("Error fetching followers", err);
            }
        }
    }, [currentUser.role]);

    const fetchGroupMessages = useCallback(async (groupId) => {
        try {
            const response = await api.get(`/groups/${groupId}/message`);
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching group messages:", error);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
        fetchFollowers();
    }, [fetchGroups, fetchFollowers]);

    const handleSelectGroup = (group) => {
        setActiveGroup(group);
        fetchGroupMessages(group._id);
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/groups', {
                name: newGroupName,
                isCommunity: currentUser.role === 'admin',
                members: selectedMembers
            });
            setGroups([...groups, response.data]);
            setShowCreateModal(false);
            setNewGroupName("");
            setSelectedMembers([]);
            showToast("Group created successfully", "success");
        } catch (error) {
            showToast("Failed to create group", "error");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeGroup) return;

        try {
            const response = await api.post(`/groups/${activeGroup._id}/message`, { text: newMessage });
            // append directly
            setMessages(prev => [...prev, { ...response.data, sender: { _id: currentUser.id, name: "Me" } }]);
            setNewMessage("");
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to send message", "error");
        }
    };

    return (
        <div className={`messages-page ${activeGroup ? 'chat-active' : ''}`}>
            <div className="messages-sidebar">
                <header className="messages-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Groups</h2>
                    <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(true)}>
                        <Plus size={20} />
                    </Button>
                </header>
                <div className="conversations-list">
                    {groups.map((group) => (
                        <div
                            key={group._id}
                            className={`conversation-item ${activeGroup?._id === group._id ? 'active' : ''}`}
                            onClick={() => handleSelectGroup(group)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="avatar-circle">
                                    <Users size={20} />
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <span className="conversation-user">
                                        {group.name}
                                        {group.isCommunity && <span className="conversation-role" style={{background: 'var(--brand-primary)', color: 'white'}}>Community</span>}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {groups.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                            No groups found. Create one!
                        </div>
                    )}
                </div>
            </div>

            <div className="chat-area">
                {activeGroup ? (
                    <>
                        <header className="chat-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button className="back-btn-mobile" onClick={() => setActiveGroup(null)}>
                                    <ArrowLeft size={20} />
                                </button>
                                <h3>{activeGroup.name}</h3>
                            </div>
                        </header>

                        <div className="messages-list">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender?._id === currentUser.id;
                                return (
                                    <div
                                        key={idx}
                                        className={`message-bubble ${isMe ? 'sent' : 'received'}`}
                                    >
                                        {!isMe && <span style={{fontSize: '0.75rem', fontWeight: 'bold', display: 'block', color: 'var(--brand-primary)'}}>{msg.sender?.name}</span>}
                                        {msg.text}
                                    </div>
                                );
                            })}
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input
                                className="chat-input"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <Button type="submit" disabled={!newMessage.trim()}>
                                Send
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="empty-chat">
                        <span className="empty-chat-icon">
                            <Users size={48} />
                        </span>
                        <h3>Select a group</h3>
                        <p>Choose a group to start communicating</p>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Create Group</h3>
                        <form onSubmit={handleCreateGroup}>
                            <div className="form-group" style={{marginTop: '1rem'}}>
                                <label>Group Name</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={newGroupName} 
                                    onChange={e => setNewGroupName(e.target.value)} 
                                    required 
                                />
                            </div>
                            
                            {currentUser.role === 'student' && followers.length > 0 && (
                                <div className="form-group" style={{marginTop: '1rem'}}>
                                    <label style={{display: 'block', marginBottom: '0.5rem'}}>Select Members (Following)</label>
                                    <div style={{maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.5rem'}}>
                                        {followers.map(f => (
                                            <div key={f._id} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                                                <input 
                                                    type="checkbox" 
                                                    id={`user-${f._id}`}
                                                    checked={selectedMembers.includes(f._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedMembers([...selectedMembers, f._id]);
                                                        else setSelectedMembers(selectedMembers.filter(id => id !== f._id));
                                                    }}
                                                />
                                                <label htmlFor={`user-${f._id}`} style={{margin: 0, fontWeight: 'normal', cursor: 'pointer', flex: 1}}>{f.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentUser.role === 'student' && followers.length === 0 && (
                                <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem'}}>You are not following anyone yet. Connect with others to create groups!</p>
                            )}

                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem'}}>
                                <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={!newGroupName.trim() || (currentUser.role === 'student' && followers.length === 0)}>Create</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GroupsPage;
