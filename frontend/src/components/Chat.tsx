import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
}

export default function Chat() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // For demo purposes, we'll use some dummy data
      setUsers([
        { id: 1, username: 'john_doe', isOnline: true },
        { id: 2, username: 'jane_smith', isOnline: false },
        // Add more users as needed
      ]);

      setMessages([
        {
          id: 1,
          sender: 'john_doe',
          content: 'Hey there!',
          timestamp: '2025-05-07T10:00:00'
        },
        {
          id: 2,
          sender: user.username,
          content: 'Hello! How are you?',
          timestamp: '2025-05-07T10:01:00'
        },
      ]);
    }
  }, [user, navigate]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      sender: user?.username || 'anonymous',
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Users List */}
      <div className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chat App</h2>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Welcome, {user?.username}</p>
        </div>
        <div className="overflow-y-auto h-full">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${
                  u.isOnline ? 'bg-green-400' : 'bg-gray-400'
                }`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{u.username}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === user?.username ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === user?.username
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm font-medium mb-1">{message.sender}</p>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}