import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { socket } from './socket';
import './App.css';

const AVAILABLE_USERS = [
  { id: 'user1', name: 'You', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You' },
  { id: 'chat1', name: 'Elon Musk', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elon' },
  { id: 'chat2', name: 'Bill Gates', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bill' },
];

function App() {
  const [activeChat, setActiveChat] = useState(null);
  const [joinedRooms, setJoinedRooms] = useState([]); // Multiple rooms
  const [currentUser, setCurrentUser] = useState(null); 
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    if (currentUser) {
      socket.connect();
      socket.emit('join_chat', { userId: currentUser.id, roomCode: currentUser.roomCode });

      // Initialize joined list with default room
      const defaultChat = {
        id: currentUser.roomCode,
        name: `Group: ${currentUser.roomCode}`,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.roomCode}`,
        online: true
      };
      setJoinedRooms([defaultChat]);
      setActiveChat(defaultChat);

      return () => {
        socket.disconnect();
      };
    }
  }, [currentUser]);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };

  const handleJoinNewRoom = (code) => {
    if (!code.trim()) return;
    
    const newRoomChat = {
      id: code,
      name: `Group: ${code}`,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${code}`,
      online: true,
    };
    
    setJoinedRooms((prev) => {
      if (!prev.find(c => c.id === code)) {
        return [...prev, newRoomChat];
      }
      return prev;
    });

    setActiveChat(newRoomChat);
    
    if (socket.connected) {
      socket.emit('join_chat', { userId: currentUser.id, roomCode: code });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() === '' || roomCode.trim() === '') return;

    setCurrentUser({
      id: username.toLowerCase().replace(/\s+/g, '-'), // Generate ID
      name: username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      roomCode: roomCode,
    });
    
    // Auto-select the room as group active chat
    setActiveChat({
      id: roomCode,
      name: `Group: ${roomCode}`,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${roomCode}`,
      online: true,
    });
  };

  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="login-box">
          <img 
            src="https://abs.twimg.com/emoji/v2/72x72/1f4ac.png" 
            alt="Logo" 
            className="login-logo"
          />
          <h2>NXF CHAT ROOM</h2>
          <form onSubmit={handleLogin} className="login-form">
            <p>Enter details to join a private room:</p>
            <input
              type="text"
              placeholder="Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Room Code (e.g., 1234)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              required
            />
            <button type="submit">Join Chat</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${activeChat ? 'mobile-active-chat' : ''}`}>
      <Sidebar 
        onSelectChat={handleSelectChat} 
        activeChatId={activeChat?.id} 
        currentUser={currentUser} 
        joinedRooms={joinedRooms}
        onJoinNewRoom={handleJoinNewRoom}
        onLogout={() => setCurrentUser(null)} 
      />
      <ChatArea activeChat={activeChat} currentUser={currentUser} onBack={() => setActiveChat(null)} />
    </div>
  );
}

export default App;
