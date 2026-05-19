import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const DEFAULT_PREFS = { orders: true, campaigns: false };

function loadPrefs() {
    try {
        const raw = localStorage.getItem("notif_prefs");
        return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
    } catch { return DEFAULT_PREFS; }
}

function isOrderNotif(n) {
    const t = (n.type ?? "").toLowerCase();
const s = `${n.title ?? ""} ${n.message ?? ""} ${n.body ?? ""}`.toLowerCase();
    return t.includes("order") || t.includes("deliver") || t.includes("placed") ||
        s.includes("order") || s.includes("placed") || s.includes("deliver");
}

function isCampaignNotif(n) {
    const t = (n.type ?? "").toLowerCase();
const s = `${n.title ?? ""} ${n.message ?? ""} ${n.body ?? ""}`.toLowerCase();
    return t.includes("campaign") || t.includes("promo") || t.includes("newsletter") ||
        s.includes("campaign") || s.includes("promo") || s.includes("newsletter");
}

export function useNotifications(isLoggedIn) {
    const [notifications, setNotifications] = useState([]);
    const [prefs, setPrefs] = useState(loadPrefs);

    // sync prefs when ProfilePage saves
    useEffect(() => {
        const handler = () => setPrefs(loadPrefs());
        const storageHandler = (e) => { if (e.key === "notif_prefs") setPrefs(loadPrefs()); };
        window.addEventListener("notifPrefsUpdated", handler);
        window.addEventListener("storage", storageHandler);
        return () => {
            window.removeEventListener("notifPrefsUpdated", handler);
            window.removeEventListener("storage", storageHandler);
        };
    }, []);

    // re-read prefs on login
    useEffect(() => { if (isLoggedIn) setPrefs(loadPrefs()); }, [isLoggedIn]);

    // fetch existing
    useEffect(() => {
        if (!isLoggedIn) return;
        api.get("/api/notifications")
            .then((r) => {
                const data = Array.isArray(r.data) ? r.data : (r.data.notifications ?? []);
                console.log("NOTIF DATA:", JSON.stringify(data[0]));
                setNotifications(data);
            })
            .catch(() => { });
    }, [isLoggedIn]);

    // SSE
    useEffect(() => {
        if (!isLoggedIn) return;
        const token = localStorage.getItem("token");
        if (!token) return;
        const es = new EventSource(`${API_URL}/api/notifications/stream?token=${token}`);
        es.onmessage = (e) => {
            try { setNotifications((prev) => [{ ...JSON.parse(e.data), is_read: false }, ...prev]); } catch {""}
        };
        es.onerror = () => es.close();
        return () => es.close();
    }, [isLoggedIn]);

    const markRead = useCallback(async (id) => {
        await api.patch(`/api/notifications/${id}/read`);
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    }, []);

    const markAllRead = useCallback(async () => {
        await api.patch("/api/notifications/read-all");
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }, []);

    // filter by prefs
    const visibleNotifications = notifications.filter((n) => {
        if (isOrderNotif(n)) return prefs.orders === true;
        if (isCampaignNotif(n)) return prefs.campaigns === true;
        return true;
    });

    const unreadCount = visibleNotifications.filter((n) => !n.is_read).length;
    const isSilent = prefs.orders === false;

    return { notifications: visibleNotifications, allNotifications: notifications, unreadCount, markRead, markAllRead, isSilent, prefs };
}