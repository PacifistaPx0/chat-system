export const getWebSocketUrl = (roomName: string): string => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = import.meta.env.MODE === 'production' 
    ? window.location.host
    : 'localhost:8000';
  
  return `${protocol}//${host}/ws/chat/${roomName}/`;
};