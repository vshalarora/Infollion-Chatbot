import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Paperclip, X, FileText, PlusCircle, ImageIcon } from 'lucide-react';

const API_URL = 'http://localhost:3001';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, TXT, PNG, and JPG files are allowed.');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNewChat = async () => {
    try {
      if (chatId) {
        await axios.post(`${API_URL}/reset`, { chatId });
      }
      setChatId(null);
      setMessages([]);
      removeFile();
      setInputMessage('');
    } catch (error) {
      console.error('Failed to reset chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() && !selectedFile) return;

    const userMsgText = inputMessage.trim();
    const currentFile = selectedFile;
    const currentPreviewUrl = previewUrl;

    // Build the user message for UI
    const newUserMsg = {
      role: 'user',
      text: userMsgText,
      file: currentFile ? {
        name: currentFile.name,
        type: currentFile.type,
        previewUrl: currentPreviewUrl
      } : null
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputMessage('');
    removeFile();
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (chatId) {
        formData.append('chatId', chatId);
      }
      if (userMsgText) {
        formData.append('message', userMsgText);
      }
      if (currentFile) {
        formData.append('file', currentFile);
      }

      const response = await axios.post(`${API_URL}/chat`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.chatId && !chatId) {
        setChatId(response.data.chatId);
      }

      setMessages(prev => [...prev, {
        role: 'bot',
        text: response.data.response
      }]);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Sorry, I encountered an error. Please try again. ' + (error.response?.data?.error || '')
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div id="root">
      <header className="header">
        <h1>Infollion ChatBot</h1>
        <button className="btn-new-chat" onClick={handleNewChat}>
          <PlusCircle size={18} />
          <span>New Chat</span>
        </button>
      </header>

      <main className="chat-container">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
            <p>Start a conversation or upload a file (PDF, TXT, PNG, JPG).</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.file && (
              <>
                {msg.file.type.startsWith('image/') ? (
                  <img src={msg.file.previewUrl} alt="Uploaded preview" className="message-image" />
                ) : (
                  <div className="message-file-badge">
                    <FileText size={16} />
                    {msg.file.name}
                  </div>
                )}
                <br />
              </>
            )}
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="typing-indicator">Infollion bot is thinking...</div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="input-area-wrapper">
        <div className="input-container">
          {selectedFile && (
            <div className="preview-container">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="preview-image" />
              ) : (
                <div className="preview-file">
                  <FileText size={24} />
                  <span>{selectedFile.name}</span>
                </div>
              )}
              <button className="remove-file-btn" onClick={removeFile}>
                <X size={18} />
              </button>
            </div>
          )}

          <div className="input-row">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="file-input"
              accept=".pdf,.txt,.png,.jpg,.jpeg"
            />
            <button
              type="button"
              className="btn-upload"
              onClick={() => fileInputRef.current?.click()}
              title="Upload file (PDF, TXT, PNG, JPG)"
            >
              <Paperclip size={20} />
            </button>

            <input
              type="text"
              className="text-input"
              placeholder="Message Infollion Bot..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            <button
              className="btn-send"
              onClick={handleSendMessage}
              disabled={isLoading || (!inputMessage.trim() && !selectedFile)}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
