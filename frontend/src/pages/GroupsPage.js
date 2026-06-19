import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, ArrowLeft, Send, Settings, Trash2, UserMinus, Edit2, Check, X } from "lucide-react";
import api from "../services/apiService";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button/Button";
import "../styles/DirectMessages.css";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
    const [showSettings, setShowSettings] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [newName, setNewName] = useState("");

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
        setShowSettings(false);
        setRenaming(false);
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
            setMessages(prev => [...prev, { ...response.data, sender: { _id: currentUser.id, name: "Me" } }]);
            setNewMessage("");
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to send message", "error");
        }
    };

    const handleDeleteGroup = async () => {
        if (!activeGroup) return;
        if (!window.confirm(`Delete "${activeGroup.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/groups/${activeGroup._id}`);
            showToast("Group deleted", "success");
            setGroups(prev => prev.filter(g => g._id !== activeGroup._id));
            setActiveGroup(null);
            setShowSettings(false);
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to delete group", "error");
        }
    };

    const handleRemoveMember = async (memberId, memberName) => {
        if (!activeGroup) return;
        try {
            const res = await api.delete(`/groups/${activeGroup._id}/members/${memberId}`);
            // Update activeGroup's members list
            setActiveGroup(res.data);
            setGroups(prev => prev.map(g => g._id === activeGroup._id ? res.data : g));
            showToast(`${memberName} removed from group`, "success");
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to remove member", "error");
        }
    };

    const handleRenameGroup = async () => {
        if (!newName.trim() || !activeGroup) return;
        try {
            const res = await api.put(`/groups/${activeGroup._id}/rename`, { name: newName });
            setActiveGroup(res.data);
            setGroups(prev => prev.map(g => g._id === activeGroup._id ? res.data : g));
            setRenaming(false);
            setNewName("");
            showToast("Group renamed successfully", "success");
        } catch (err) {
            showToast("Failed to rename group", "error");
        }
    };

    const isGroupAdmin = activeGroup && (
        activeGroup.creator?._id === currentUser.id ||
        activeGroup.creator === currentUser.id ||
        activeGroup.admins?.some(a => (a._id || a) === currentUser.id)
    );

    const avatarFor = (user) => {
        if (user?.profilePic) return <img src={`${API_BASE}${user.profilePic}`} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />;
        return <span>{user?.name?.[0]?.toUpperCase() || '?'}</span>;
    };

    return (
        <div className={`messages-page ${activeGroup ? 'chat-active' : ''}`}>
            {/* Sidebar */}
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
                                <div className="avatar-circle"><Users size={20} /></div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <span className="conversation-user">
                                        {group.name}
                                        {group.isCommunity && <span className="conversation-role" style={{background: 'var(--brand-primary)', color: 'white'}}>Community</span>}
                                    </span>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''}
                                    </div>
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

            {/* Chat area */}
            <div className="chat-area">
                {activeGroup ? (
                    <>
                        <header className="chat-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                <button className="back-btn-mobile" onClick={() => setActiveGroup(null)}>
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="avatar-circle" style={{ width: '38px', height: '38px', flexShrink: 0 }}>
                                    <Users size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    {renaming ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                className="form-input"
                                                value={newName}
                                                onChange={e => setNewName(e.target.value)}
                                                style={{ padding: '4px 8px', fontSize: '0.9rem', flex: 1 }}
                                                autoFocus
                                                onKeyDown={e => { if (e.key === 'Enter') handleRenameGroup(); if (e.key === 'Escape') { setRenaming(false); setNewName(""); } }}
                                            />
                                            <button onClick={handleRenameGroup} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-low)' }}><Check size={16} /></button>
                                            <button onClick={() => { setRenaming(false); setNewName(""); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-high)' }}><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <h3 style={{ margin: 0 }}>{activeGroup.name}</h3>
                                    )}
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {activeGroup.members?.length || 0} members
                                    </p>
                                </div>
                            </div>
                            {isGroupAdmin && (
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    style={{ background: showSettings ? 'rgba(139,92,246,0.15)' : 'none', border: 'none', cursor: 'pointer', color: showSettings ? 'var(--primary-color)' : 'var(--text-muted)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                                    title="Group Settings"
                                >
                                    <Settings size={20} />
                                </button>
                            )}
                        </header>

                        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                            {/* Messages */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div className="messages-list">
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.sender?._id === currentUser.id;
                                        return (
                                            <div key={idx} className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                                                {!isMe && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', color: 'var(--brand-primary)', marginBottom: '2px' }}>{msg.sender?.name}</span>}
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
                                        <Send size={16} />
                                    </Button>
                                </form>
                            </div>

                            {/* Settings panel */}
                            {showSettings && isGroupAdmin && (
                                <div style={{
                                    width: '260px', borderLeft: '1px solid var(--border-color)', background: 'var(--card-bg)',
                                    display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0
                                }}>
                                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>Group Settings</h4>
                                    </div>
                                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1 }}>
                                        {/* Rename */}
                                        <button
                                            onClick={() => { setRenaming(true); setNewName(activeGroup.name); setShowSettings(false); }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.6rem 1rem', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '600', width: '100%', transition: 'background 0.2s' }}
                                        >
                                            <Edit2 size={15} /> Rename Group
                                        </button>

                                        {/* Members list */}
                                        <div>
                                            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Members ({activeGroup.members?.length || 0})</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {(activeGroup.members || []).map((member) => {
                                                    const memberId = member._id || member;
                                                    const memberName = member.name || 'Member';
                                                    const isCreator = (activeGroup.creator?._id || activeGroup.creator) === memberId;
                                                    return (
                                                        <div key={memberId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0' }}>
                                                            <div className="avatar-circle" style={{ width: '30px', height: '30px', fontSize: '0.75rem', flexShrink: 0 }}>
                                                                {avatarFor(member)}
                                                            </div>
                                                            <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {memberName}
                                                                {isCreator && <span style={{ fontSize: '0.7rem', marginLeft: '4px', color: 'var(--primary-color)', fontWeight: '700' }}>Admin</span>}
                                                            </span>
                                                            {!isCreator && memberId !== currentUser.id && (
                                                                <button
                                                                    onClick={() => handleRemoveMember(memberId, memberName)}
                                                                    title="Remove from group"
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-high)', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                                                                >
                                                                    <UserMinus size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Delete group */}
                                        <button
                                            onClick={handleDeleteGroup}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--radius-md)', padding: '0.6rem 1rem', cursor: 'pointer', color: '#f43f5e', fontSize: '0.875rem', fontWeight: '600', width: '100%', marginTop: 'auto' }}
                                        >
                                            <Trash2 size={15} /> Delete Group
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="empty-chat">
                        <span className="empty-chat-icon"><Users size={48} /></span>
                        <h3>Select a group</h3>
                        <p>Choose a group to start communicating</p>
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
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
