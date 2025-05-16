/**
 * Chat Component - Main chat interface of the application
 * Handles real-time messaging, user presence, and chat room management
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getWebSocketUrl } from '../utils/websocket';

// Types for message data structure
interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
}

// Type for incoming WebSocket messages
interface WebSocketMessage {
  message: string;
  username: string;
  user_id: number;
}

// Type for chat room data structure
interface ChatRoom {
  id: number;
  names: string;
  participants: any[]; // TODO: Consider defining a proper type for participants
}

export default function Chat() {
  // Authentication and navigation hooks
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State management for chat functionality
  const [messages, setMessages] = useState<Message[]>([]); // Store chat messages
  const [newMessage, setNewMessage] = useState(''); // Current message being typed
  const [users, setUsers] = useState<any[]>([]); // List of all users
  const [rooms, setRooms] = useState<ChatRoom[]>([]); // Available chat rooms
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null); // Currently selected room

  // WebSocket references for real-time communication
  const wsRef = useRef<WebSocket | null>(null); // Main chat WebSocket
  const statusWsRef = useRef<WebSocket | null>(null); // User status WebSocket

  // Initial setup effect - runs on component mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch rooms
    fetchRooms();

    // Fetch initial users list
    fetchUsers();

    // Connect to status WebSocket
    const statusWs = new WebSocket('ws://localhost:8000/ws/status/');

    statusWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'user_status') {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === data.user_id ? { ...u, is_online: data.status } : u
          )
        );
      }
    };

    statusWsRef.current = statusWs;

    return () => {
      if (statusWsRef.current) {
        statusWsRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user, navigate]);

  // Room connection effect - runs when active room changes
  useEffect(() => {
    if (!activeRoom) return;

    // Fetch chat history for the active room
    fetchChatHistory(activeRoom.names);

    // Connect to WebSocket for the active room
    const wsUrl = getWebSocketUrl(activeRoom.names);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        const newMessage: Message = {
          id: messages.length + 1,
          sender: data.username,
          content: data.message,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMessage]);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [activeRoom]);

  /**
   * Fetches available chat rooms from the server
   * Sets the first room as active if none is selected
   */
  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:8000/chat/rooms/', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
        // Set first room as active if none is selected
        if (data.length > 0 && !activeRoom) {
          setActiveRoom(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  /**
   * Fetches chat history for a specific room
   * @param roomName - Name of the room to fetch history for
   */
  const fetchChatHistory = async (roomName: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/chat/rooms/${roomName}/messages/`,
        {
          credentials: 'include',
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(
          data.map((msg: any) => ({
            id: msg.id,
            sender: msg.user.username,
            content: msg.content,
            timestamp: msg.timestamp,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  /**
   * Fetches list of all users and their online status
   */
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/chat/users/', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  /**
   * Handles sending a new message
   * Validates message content and WebSocket connection before sending
   */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !wsRef.current || !activeRoom) return;

    // Send message through WebSocket
    wsRef.current.send(
      JSON.stringify({
        message: newMessage,
      })
    );

    setNewMessage('');
  };

  /**
   * Handles user logout
   * Closes WebSocket connections and redirects to login page
   */
  const handleLogout = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (statusWsRef.current) {
      statusWsRef.current.close();
    }
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 flex bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Sidebar section with glassmorphism effect */}
      <div className="w-80 flex flex-col backdrop-blur-md bg-white/10 border-r border-gray-700">
        {/* Fixed Header */}
        <div className="flex-none p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Chat Sphere
            </h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full text-sm text-red-400 hover:text-red-300 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Welcome back, <span className="text-purple-400">{user?.username}</span>
          </p>
        </div>

        {/* Rooms and Users Lists */}
        <div className="flex-1 overflow-y-auto">
          {/* Rooms List */}
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-medium text-gray-300 mb-4">Rooms</h3>
            <div className="space-y-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`p-3 cursor-pointer rounded-xl transition-all duration-200 ${
                    activeRoom?.id === room.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-gray-300">{room.names}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Users List */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-300 mb-4">Users</h3>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center p-3 rounded-xl hover:bg-white/5 transition-all duration-200"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {u.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                        u.is_online ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300">{u.username}</p>
                    <p className="text-xs text-gray-500">
                      {u.is_online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            {/* Messages Section */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === user?.username ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xl rounded-2xl px-6 py-4 ${
                        message.sender === user?.username
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {message.sender[0].toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{message.sender}</p>
                        <span className="text-xs opacity-50">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="flex-none p-6 backdrop-blur-md bg-gray-900/50 border-t border-gray-700">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/10 text-gray-300 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">Select a room to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}