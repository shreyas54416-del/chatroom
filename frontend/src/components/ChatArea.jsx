import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Smile, Paperclip, Send, Mic, ArrowLeft } from 'lucide-react';
import { mockMessages } from '../mockData';
import { socket } from '../socket'; // Import socket
import './ChatArea.css';

function ChatArea({ activeChat, currentUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [fileData, setFileData] = useState(null); // { name, type, content }
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Search Toggle
  const [isRecording, setIsRecording] = useState(false); // Mic state
  const [mediaRecorder, setMediaRecorder] = useState(null); // Recorder state
  const [timer, setTimer] = useState(0); // Add timer
  const timerIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ['🔫', '💰', '🏎️', '🚁', '💊', '💣', '😎', '🔥', '💵', '🍔', '🛹', '🍹'];

  useEffect(() => {
    if (activeChat) {
      // Fetch historical messages from backend to avoid race condition
      socket.emit('get_messages', { roomCode: activeChat.id });
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  // Socket Listener for incoming messages
  useEffect(() => {
    socket.on('receive_message', (data) => {
      if (activeChat && (data.roomCode === activeChat.id || data.sender === activeChat.id)) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socket.on('load_messages', (data) => {
      setMessages(data); // Load historical messages
    });

    return () => {
      socket.off('receive_message');
      socket.off('load_messages');
    };
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMicClick = async () => {
    if (isRecording) {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
        clearInterval(timerIntervalRef.current);
        setTimer(0);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        
        let chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64Audio = reader.result;
            const voiceMsg = {
              id: Date.now(),
              text: '', // Empty text
              sender: currentUser.id,
              roomCode: currentUser.roomCode,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              file: { name: 'voice_note.webm', type: 'audio/webm', content: base64Audio }
            };
            socket.emit('send_message', voiceMsg);
            setMessages((prev) => [...prev, voiceMsg]);
          };
          stream.getTracks().forEach(track => track.stop()); // Release mic
        };

        recorder.start();
        setIsRecording(true);
        setTimer(0);
        timerIntervalRef.current = setInterval(() => {
          setTimer((prev) => prev + 1);
        }, 1000);

      } catch (err) {
        alert('Could not access microphone: ' + err.message);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileData({
        name: file.name,
        type: file.type,
        content: event.target.result, // Base64
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' && !fileData) return;

    const newMsg = {
      id: messages.length + 1 + Date.now(),
      text: newMessage,
      sender: currentUser.id,
      roomCode: currentUser.roomCode, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      file: fileData, // Add file details
    };

    socket.emit('send_message', newMsg);

    setMessages([...messages, newMsg]);
    setNewMessage('');
    setFileData(null); // Clear file
  };

  const addEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSaveChat = () => {
    const text = messages.map(m => `[${m.timestamp}] ${m.sender === currentUser.id ? 'You' : m.sender}: ${m.text || (m.file ? 'Attached file' : '')}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_room_${activeChat.id}.txt`;
    a.click();
    setIsMenuOpen(false); // Close menu
  };

  if (!activeChat) {
    return (
      <div className="chat-area-empty">
        <div className="empty-content">
          <img 
            src="https://abs.twimg.com/emoji/v2/72x72/1f4ac.png" 
            alt="Chat" 
            className="empty-icon"
          />
          <h2>NXF CHAT ROOM</h2>
          <p>Send and receive messages in private encrypted channels.</p>
          <p className="empty-footer">🔒 End-to-end encrypted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <button className="mobile-back-btn" onClick={onBack} style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            marginRight: '12px',
            display: 'none', /* Hidden by default */
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ArrowLeft size={20} />
          </button>
          <img src={activeChat.avatar} alt={activeChat.name} className="avatar" />
          <div className="chat-header-info">
            {isSearchOpen ? (
              <input 
                type="text" 
                placeholder="Search messages..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="header-search-input"
                autoFocus
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--accent-green)',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  width: '150px'
                }}
              />
            ) : (
              <span className="chat-header-name">{activeChat.name}</span>
            )}
            <span className="chat-header-status">online</span>
          </div>
        </div>
        <div className="chat-header-right" style={{ position: 'relative' }}>
          <button className="action-btn" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search size={18} style={{ color: isSearchOpen ? 'var(--accent-green)' : 'currentColor' }} />
          </button>
          <button className="action-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}><MoreVertical size={18} /></button>

          {isMenuOpen && (
            <div className="dropdown-menu">
              <button onClick={() => { setMessages([]); setIsMenuOpen(false); }}>🗑️ Clear Chat</button>
              <button onClick={handleSaveChat}>💾 Save Chat (TXT)</button>
            </div>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="message-list">
        {messages.filter(msg => 
          (msg.text || '').toLowerCase().includes(searchQuery.toLowerCase())
        ).map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble-wrapper ${msg.sender === currentUser.id ? 'sent' : 'received'}`}
          >
            <div className={`message-bubble ${msg.sender === currentUser.id ? 'sent' : 'received'}`}>
              <span className="message-sender">{msg.sender === currentUser.id ? 'You' : msg.sender}</span>
              
              {/* Render File if exists */}
              {msg.file && (
                <div className="message-file-content">
                  {msg.file.type.startsWith('image/') ? (
                    <img src={msg.file.content} alt="Upload" className="message-image" />
                  ) : msg.file.type.startsWith('audio/') ? (
                    <audio controls src={msg.file.content} className="message-audio" style={{ maxWidth: '210px', marginTop: '4px' }} />
                  ) : (
                    <div className="message-file-doc">
                      📄 <span>{msg.file.name}</span>
                    </div>
                  )}
                </div>
              )}

              {msg.text && <p className="message-text">{msg.text}</p>}
              <span className="message-time">
                {msg.timestamp}
                {msg.sender === currentUser.id && <span className="message-status"> ✓ </span>}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Overlay */}
      {showEmojiPicker && (
        <div className="emoji-picker">
          {emojis.map((emoji, index) => (
            <button key={index} type="button" onClick={() => addEmoji(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* File Preview above Input Bar */}
      {fileData && (
        <div className="file-preview-bar">
          <div className="preview-item">
            {fileData.type.startsWith('image/') ? (
              <img src={fileData.content} alt="Preview" className="preview-thumb" />
            ) : (
              <div className="preview-doc-icon">📄</div>
            )}
            <span className="preview-name">{fileData.name}</span>
            <button type="button" onClick={() => setFileData(null)} className="remove-preview">×</button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form className="input-bar" onSubmit={handleSendMessage}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*,application/pdf"
          onChange={handleFileChange}
        />
        <button 
          type="button" 
          className={`action-btn ${showEmojiPicker ? 'active' : ''}`} 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile size={20} />
        </button>
        <button 
          type="button" 
          className="action-btn" 
          onClick={() => fileInputRef.current.click()}
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        {newMessage.trim() === '' && !fileData ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isRecording && (
              <span style={{ 
                color: '#ff4d4d', 
                fontSize: '12px', 
                fontFamily: 'var(--font-hud)', 
                animation: 'pulse 1s infinite' 
              }}>
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </span>
            )}
            <button 
              type="button" 
              className={`action-btn ${isRecording ? 'recording' : ''}`} 
              onClick={handleMicClick}
            >
              <Mic size={20} style={{ color: isRecording ? '#ff4d4d' : 'currentColor' }} />
            </button>
          </div>
        ) : (
          <button type="submit" className="send-btn"><Send size={18} /></button>
        )}
      </form>
    </div>
  );
}

export default ChatArea;
