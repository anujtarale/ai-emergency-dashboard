import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string;
if (!SOCKET_URL) {
  throw new Error('[useSocket.ts] VITE_SOCKET_URL is not defined. Check your .env file.');
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAppStore();

  useEffect(() => {
    if (!user) return;

    // Only connect once
    if (socketRef.current?.connected) return;

    const token = localStorage.getItem('accessToken');

    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: token || ''
      },
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['polling']
    });

    socketRef.current.on('connect', () => {
      // Join admin room if user is admin
      if (user.role === 'admin') {
        socketRef.current?.emit('join-room', 'admin-dashboard');
      }
    });

    socketRef.current.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    socketRef.current.on('error', (err) => {
      console.warn('[Socket] Error:', err);
    });

    socketRef.current.on('maintenance-updated', (data: { maintenanceMode: boolean }) => {
      useAppStore.getState().setMaintenanceMode(data.maintenanceMode);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return {
    socket: socketRef.current,
    on,
    off,
    emit,
    isConnected: socketRef.current?.connected ?? false
  };
};
