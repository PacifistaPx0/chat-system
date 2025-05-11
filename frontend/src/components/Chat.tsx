import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
}

interface WebSocketMessage {
  message: string;
  username: string;
  user_id: number;
}

interface ChatRoom {
  id: number;
  names: string;
  participants: any[];
}

export default function Chat() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const statusWsRef = useRef<WebSocket | null>(null);

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
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === data.user_id 
            ? { ...u, is_online: data.status }
            : u
        ));
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

  // Connect to WebSocket when activeRoom changes
  useEffect(() => {
    if (!activeRoom) return;

    // Fetch chat history for the active room
    fetchChatHistory(activeRoom.id);
    
    // Connect to WebSocket for the active room
    const wsUrl = `ws://localhost:8000/ws/chat/${activeRoom.id}/`;
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
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
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

  const fetchChatHistory = async (roomId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/chat/rooms/${roomId}/messages/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.map((msg: any) => ({
          id: msg.id,
          sender: msg.user.username,
          content: msg.content,
          timestamp: msg.timestamp
        })));
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !wsRef.current || !activeRoom) return;

    // Send message through WebSocket
    wsRef.current.send(JSON.stringify({
      message: newMessage
    }));

    setNewMessage('');
  };

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Rooms and Users List */}
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
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Rooms</h3>
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`p-2 cursor-pointer rounded-lg ${
                  activeRoom?.id === room.id ? 'bg-indigo-100' : 'hover:bg-gray-50'
                }`}
              >
                {room.names}
              </div>
            ))}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-medium">Users</h3>
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    u.is_online ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{u.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a room to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}