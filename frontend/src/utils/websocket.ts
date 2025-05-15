/**
 * WebSocket Utility Functions
 * Contains functions for managing WebSocket connections in the chat application
 */

/**
 * Generates a WebSocket URL for connecting to a specific chat room
 * 
 * @param roomName - The name of the chat room to connect to
 * @returns A complete WebSocket URL string
 * 
 * Features:
 * - Automatically detects secure/non-secure protocol (ws/wss)
 * - Handles different hosts for production and development
 * - URL-encodes room names for safety
 */
export const getWebSocketUrl = (roomName: string): string => {
  // Determine WebSocket protocol based on current page protocol
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  
  // Use appropriate host based on environment
  const host = import.meta.env.MODE === 'production' 
    ? window.location.host    // Use current host in production
    : 'localhost:8000';       // Use local development server
  
  // Ensure roomName is URL-safe by encoding special characters
  const safeRoomName = encodeURIComponent(roomName);
  return `${protocol}//${host}/ws/chat/${safeRoomName}/`;
};