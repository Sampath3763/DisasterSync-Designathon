import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const WebSocketContext = createContext(null);
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export function WebSocketProvider({ children }) {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const listeners = useRef({});
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;
    ws.current = new WebSocket(WS_URL);
    ws.current.onopen = () => { setConnected(true); console.log('WS connected'); };
    ws.current.onclose = () => {
      setConnected(false);
      reconnectTimer.current = setTimeout(connect, 3000);
    };
    ws.current.onerror = () => ws.current?.close();
    ws.current.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        const event = msg.event;
        if (listeners.current[event]) listeners.current[event].forEach(fn => fn(msg.data));
        if (listeners.current['*']) listeners.current['*'].forEach(fn => fn(msg));
      } catch {}
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);

  const on = useCallback((event, handler) => {
    if (!listeners.current[event]) listeners.current[event] = [];
    listeners.current[event].push(handler);
    return () => { listeners.current[event] = listeners.current[event]?.filter(h => h !== handler); };
  }, []);

  const send = useCallback((event, data) => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ event, data }));
  }, []);

  return (
    <WebSocketContext.Provider value={{ connected, on, send }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
