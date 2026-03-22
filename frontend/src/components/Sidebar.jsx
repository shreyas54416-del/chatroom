import React, { useState } from 'react';
import { Search, MessageSquarePlus, MoreVertical, Users, Sun, Moon, LogOut } from 'lucide-react'; // Add LogOut
import { mockChats } from '../mockData';
import './Sidebar.css';

function Sidebar({ onSelectChat, activeChatId, currentUser, joinedRooms = [], onJoinNewRoom, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newRoomCode, setNewRoomCode] = useState('');

  const handleJoinClick = () => {
    if (newRoomCode.trim()) {
      onJoinNewRoom(newRoomCode);
      setNewRoomCode('');
      setIsJoinModalOpen(false);
    }
  };

  const filteredChats = (joinedRooms || []).filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="avatar-container">
          <img src={currentUser.avatar} alt="Profile" className="avatar" />
        </div>
        <div className="header-actions" style={{ position: 'relative' }}>
          <button className="action-btn" title="Back to Login" onClick={onLogout}>
            <LogOut size={20} />
          </button>
          <button className="action-btn" title="New Chat" onClick={() => setIsJoinModalOpen(true)}>
            <MessageSquarePlus size={20} />
          </button>
          <button className="action-btn" title="More options" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MoreVertical size={20} />
          </button>

          {isMenuOpen && (
            <div className="dropdown-menu">
              <button onClick={onLogout}>🚪 Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Join Room Modal */}
      {isJoinModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="title-hud">Join / Create Room</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Enter a room code to switch channels.
            </p>
            <input
              type="text"
              placeholder="e.g., 9999"
              value={newRoomCode}
              onChange={(e) => setNewRoomCode(e.target.value)}
              className="modal-input"
            />
            <div className="modal-actions">
              <button className="modal-btn confirm" onClick={handleJoinClick}>Join</button>
              <button className="modal-btn cancel" onClick={() => setIsJoinModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="chat-list">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
            onClick={() => onSelectChat(chat)}
          >
            <div className="avatar-container">
              <img src={chat.avatar} alt={chat.name} className="avatar" />
              {chat.online && <span className="online-indicator"></span>}
            </div>
            <div className="chat-info">
              <div className="chat-info-top">
                <span className="chat-name">{chat.name}</span>
                <span className="chat-time">{chat.timestamp}</span>
              </div>
              <div className="chat-info-bottom">
                <p className="chat-message">{chat.lastMessage}</p>
                {chat.unreadCount > 0 && (
                  <span className="unread-badge">{chat.unreadCount}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
