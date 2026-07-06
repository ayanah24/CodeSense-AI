import { useEffect, useRef, useState } from "react";
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useSocket() {
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        async function connect() {
            try {
                //fetch
                const res = await fetch(`${SOCKET_URL}/auth/token`, {
                    credentials: 'include',
                });

                if (!res) {
                    console.warn('Socket auth failed-not logged in');
                    return;
                }

                const { token } = await res.json();

                //socket connect to token 
                const socket = io(SOCKET_URL, {
                    auth: { token },
                    transports: ['websocket'],
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionAttempts: 5,
                });

                //event listeners
                socket.on('connect', () => {
                    console.log('socket connected:', socket.id);
                    setConnected(true);
                });



                socket.on('disconnect', (reason) => {
                    console.log('🔌 Socket disconnected:', reason);
                    setConnected(false);
                });

                socket.on('connect_error', (err) => {
                    console.error('Socket connection error:', err.message);
                    setConnected(false);
                });

                socketRef.current = socket;


            } catch (err) {
                console.error('socket setup Error:', err.message);
            }
        }

        connect();

        //cleanup
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    //event on
    function on(event, callback) {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        } else {
            setTimeout(() => {
                if (socketRef.current) {
                    socketRef.current.on(event, callback);
                }
            }, 2000);
        }
    }

    //event off 
    function off(event, callback) {
        if (socketRef.current) {
            socketRef.current.off(event, callback);
        }
    }

    return { connected, on, off }
}
