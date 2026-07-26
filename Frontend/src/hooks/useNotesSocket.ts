import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { Note } from '../types';

interface UseNotesSocketOptions {
  token: string | null;
  onCreated?: (note: Note) => void;
  onUpdated?: (note: Note) => void;
  onDeleted?: (id: string) => void;
}

export const useNotesSocket = ({ token, onCreated, onUpdated, onDeleted }: UseNotesSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    if (onCreated) {
      socket.on('note:created', onCreated);
    }
    if (onUpdated) {
      socket.on('note:updated', onUpdated);
    }
    if (onDeleted) {
      socket.on('note:deleted', (payload: { id: string }) => onDeleted(payload.id));
    }

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { isConnected };
};
