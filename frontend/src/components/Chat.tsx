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
    <div className="fixed inset-0 flex bg-zinc-900">
      {/* Sidebar section */}
      <div className="w-80 flex flex-col bg-zinc-800/50 border-r border-zinc-700/50">
        {/* Fixed Header */}
        <div className="flex-none p-6 border-b border-zinc-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Chat
            </h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Sign Out
            </button>
          </div>
          <p className="text-sm text-zinc-400 mt-2">
            Welcome, <span className="text-teal-400">{user?.username}</span>
          </p>
        </div>

        {/* Rooms and Users Lists */}
        <div className="flex-1 overflow-y-auto">
          {/* Rooms List */}
          <div className="p-6 border-b border-zinc-700/50">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Rooms</h3>
            <div className="space-y-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`p-3 cursor-pointer rounded-lg transition-all ${
                    activeRoom?.id === room.id
                      ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400'
                      : 'text-zinc-300 hover:bg-zinc-700/50'
                  }`}
                >
                  {room.names}
                </div>
              ))}
            </div>
          </div>

          {/* Users List */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Users</h3>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center p-3 rounded-lg hover:bg-zinc-700/50 transition-all"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-lg bg-zinc-700 flex items-center justify-center">
                      <span className="text-zinc-300 font-medium">
                        {u.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-800 ${
                        u.is_online ? 'bg-teal-400' : 'bg-zinc-500'
                      }`}
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-zinc-300">{u.username}</p>
                    <p className="text-xs text-zinc-500">
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
      <div className="flex-1 flex flex-col bg-zinc-900">
        {activeRoom ? (
          <>
            {/* Messages Section */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === user?.username ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xl rounded-lg px-4 py-2 ${
                        message.sender === user?.username
                          ? 'bg-teal-500 text-white'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 opacity-70 mb-1">
                        <span className="text-sm">{message.sender}</span>
                        <span className="text-xs">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="flex-none p-4 border-t border-zinc-800">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 bg-zinc-800 text-zinc-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-teal-500/50 placeholder-zinc-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-zinc-400">Select a room to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}