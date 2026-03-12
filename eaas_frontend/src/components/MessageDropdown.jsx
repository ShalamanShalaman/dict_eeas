
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Send, Inbox, Clock, Trash2, User, CheckCheck, Mail, MailOpen, MessageCircle, Bell, ChevronRight } from "lucide-react";

const MessageDropdown = ({ user, isOpen, onClose, onUnreadCountChange }) => {
  const [messages, setMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showSent, setShowSent] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  
  // Compose form state
  const [recipientUserId, setRecipientUserId] = useState("");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user?.user_id) {
      fetchMessages();
      fetchAvailableUsers();
    }
  }, [isOpen, user?.user_id]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/messages/${user.user_id}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        const count = data.unread_count || 0;
        setUnreadCount(count);
        if (onUnreadCountChange) {
          onUnreadCountChange(count);
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/messages/sent/${user.user_id}`
      );
      if (response.ok) {
        const data = await response.json();
        setSentMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch sent messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/messages/users/${user.user_id}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendError("");
    setSendSuccess(false);
    
    if (!recipientUserId || !subject.trim() || !messageText.trim()) {
      setSendError("Please fill in all fields");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_user_id: user.user_id,
          recipient_user_id: recipientUserId,
          subject: subject.trim(),
          message: messageText.trim(),
        }),
      });

      if (response.ok) {
        setSendSuccess(true);
        setRecipientUserId("");
        setSubject("");
        setMessageText("");
        setTimeout(() => {
          setShowCompose(false);
          setSendSuccess(false);
        }, 1500);
      } else {
        const data = await response.json();
        setSendError(data.error || "Failed to send message");
      }
    } catch (err) {
      setSendError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/messages/${messageId}/read`,
        { method: "PUT" }
      );
      
      if (response.ok) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, is_read: true } : msg
          )
        );
        
        const unreadCount = messages.filter(m => m.id !== messageId && !m.is_read).length;
        setUnreadCount(unreadCount);
        if (onUnreadCountChange) {
          onUnreadCountChange(unreadCount);
        }
      }
    } catch (err) {
      console.error("Failed to mark message as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/messages/mark-read/${user.user_id}`,
        { method: 'POST' }
      );
      if (response.ok) {
        setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
        setUnreadCount(0);
        if (onUnreadCountChange) {
          onUnreadCountChange(0);
        }
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/messages/${messageId}`,
        { method: "DELETE" }
      );
      
      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        setSentMessages(prev => prev.filter(m => m.id !== messageId));
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleMessageClick = (message) => {
    if (!message.is_read) {
      handleMarkAsRead(message.id);
    }
    setSelectedMessage(message);
  };

  const handleShowSent = () => {
    setShowSent(true);
    fetchSentMessages();
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'reviewer':
        return 'bg-blue-100 text-blue-700';
      case 'employee':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 999998, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={onClose}
      />

      {/* Dropdown */}
      <div 
        className="fixed top-16 right-4 sm:right-6 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform origin-top-right transition-all"
        style={{ zIndex: 999999, maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="text-l=sm font-bold text-white">Messages</p>
                
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg animate-pulse">
                  {unreadCount} new
                </span>
              )}
              <button
                onClick={onClose}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Compose Button */}
        <div className="p-3 border-b border-gray-100 bg-gray-50">
          <button
            onClick={() => {
              setShowCompose(true);
              setSelectedMessage(null);
              setShowSent(false);
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            <Send size={16} />
            Compose New Message
          </button>
        </div>

        {/* Tabs */}
        {!showCompose && !selectedMessage && (
          <div className="flex border-b border-gray-100 bg-white">
            <button
              onClick={() => setShowSent(false)}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${!showSent ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <Inbox size={16} />
              Inbox
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={handleShowSent}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${showSent ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <Send size={16} />
              Sent
            </button>
          </div>
        )}

        {/* Mark All as Read Button */}
        {!showCompose && !selectedMessage && !showSent && unreadCount > 0 && (
          <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100">
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          </div>
        )}

        {/* Message List */}
        {!showCompose && !selectedMessage && (
          <div className="max-h-80 overflow-y-auto bg-white">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm">Loading messages...</p>
              </div>
            ) : (showSent ? sentMessages : messages).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Mail size={28} className="opacity-50" />
                </div>
                <p className="text-sm font-semibold text-gray-600">{showSent ? 'No sent messages' : 'No messages yet'}</p>
                <p className="text-xs mt-1 text-gray-400">{showSent ? 'Messages you sent will appear here' : 'Start a conversation with your colleagues'}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {(showSent ? sentMessages : messages).map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleMessageClick(msg)}
                    className={`p-4 hover:bg-indigo-50 cursor-pointer transition-all duration-200 relative group ${
                      !msg.is_read ? 'bg-gradient-to-r from-indigo-50 to-white' : ''
                    }`}
                  >
                    {!msg.is_read && !showSent && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-l-xl" />
                    )}
                    <div className="flex items-start gap-3 pl-2">
                      <div className={`p-2.5 rounded-xl shrink-0 ${!msg.is_read ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                        <User size={18} className={!msg.is_read ? 'text-indigo-600' : 'text-gray-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm truncate pr-2 ${!msg.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {showSent ? msg.recipient_name : msg.sender_name}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            {!msg.is_read && !showSent && (
                              <span className="w-2 h-2 bg-indigo-600 rounded-full" />
                            )}
                            {showSent && msg.is_read && (
                              <MailOpen size={14} className="text-green-600" />
                            )}
                          </div>
                        </div>
                        <p className={`text-xs font-medium truncate ${!msg.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                          {msg.subject}
                        </p>
                        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                          <Clock size={12} />
                          {formatTimeAgo(msg.created_at)}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    
                    {/* Delete button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(msg.id);
                      }}
                      className="absolute top-3 right-3 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-lg"
                      title="Delete message"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Compose Form */}
        {showCompose && !selectedMessage && (
          <div className="p-4 max-h-80 overflow-y-auto bg-white">
            <form onSubmit={handleSendMessage}>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">To:</label>
                <select
                  value={recipientUserId}
                  onChange={(e) => setRecipientUserId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select recipient...</option>
                  {availableUsers.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.role}) {u.office_name ? `- ${u.office_name}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subject:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter subject..."
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message:</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-28 resize-none"
                  placeholder="Type your message..."
                  required
                />
              </div>
              {sendError && (
                <p className="text-xs text-red-600 mb-3 bg-red-50 p-2 rounded-lg">{sendError}</p>
              )}
              {sendSuccess && (
                <p className="text-xs text-green-600 mb-3 bg-green-50 p-2 rounded-lg flex items-center gap-2">
                  <CheckCheck size={14} />
                  Message sent successfully!
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompose(false);
                    setSendError("");
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-md"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Message Detail View */}
        {selectedMessage && !showCompose && (
          <div className="p-4 max-h-80 overflow-y-auto bg-white">
            <button
              onClick={() => setSelectedMessage(null)}
              className="text-xs text-indigo-600 hover:text-indigo-800 mb-3 flex items-center gap-1 font-medium"
            >
              Back to messages
            </button>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="p-3 rounded-full bg-indigo-100">
                  <User size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {showSent ? selectedMessage.recipient_name : selectedMessage.sender_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                    {showSent ? selectedMessage.recipient_role : selectedMessage.sender_role}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getRoleBadgeColor(showSent ? selectedMessage.recipient_role : selectedMessage.sender_role)}`}>
                      {showSent ? selectedMessage.recipient_role : selectedMessage.sender_role}
                    </span>
                  </p>
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-3">
                {selectedMessage.subject}
              </h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-xl border border-gray-100 mb-3">
                {selectedMessage.message}
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                {formatTimeAgo(selectedMessage.created_at)}
              </p>
            </div>
            <button
              onClick={() => {
                setShowCompose(true);
                setRecipientUserId(showSent ? selectedMessage.recipient_user_id : selectedMessage.sender_user_id);
                setSubject(selectedMessage.subject.startsWith('Re:') ? selectedMessage.subject : `Re: ${selectedMessage.subject}`);
                setMessageText(`\n\n--- Original Message ---\n${selectedMessage.message}`);
                setSelectedMessage(null);
              }}
              className="mt-3 w-full py-2.5 px-4 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-xl hover:bg-indigo-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Send size={14} />
              Reply to Message
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

export default MessageDropdown;