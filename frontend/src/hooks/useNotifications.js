import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

// FIX: use env var instead of hardcoded 127.0.0.1
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useNotifications(isLoggedIn) {
    const [notifications, setNotifications] = useState([]);
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    // Load existing notifications on mount
    useEffect(() => {
        if (!isLoggedIn) return;
        api
            .get("/api/notifications")
            .then((r) => setNotifications(r.data))
            .catch(() => { });
    }, [isLoggedIn]);

    // SSE — real-time connection
    useEffect(() => {
        if (!isLoggedIn) return;
        const token = localStorage.getItem("token");
        if (!token) return;

        // FIX: dynamic URL — works in dev AND production
        const es = new EventSource(
            `${API_URL}/api/notifications/stream?token=${token}`
        );

        es.onmessage = (e) => {
            const notif = JSON.parse(e.data);
            setNotifications((prev) => [{ ...notif, is_read: false }, ...prev]);
        };

        es.onerror = () => es.close();

        return () => es.close();
    }, [isLoggedIn]);

    const markRead = useCallback(async (id) => {
        await api.patch(`/api/notifications/${id}/read`);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
    }, []);

    const markAllRead = useCallback(async () => {
        await api.patch("/api/notifications/read-all");
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }, []);

    return { notifications, unreadCount, markRead, markAllRead };
}