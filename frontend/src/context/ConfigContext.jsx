/**
 * ConfigContext.jsx — Shared configuration state
 *
 * ── What was broken & why ────────────────────────────────────────────────
 *
 * 1. 404 on PUT /api/configration/ar
 *    Root cause: Vite dev server was receiving the request instead of
 *    FastAPI because no proxy was configured. Fix: add the /api proxy
 *    block to vite.config.js (see vite.config.js).
 *
 * 2. Server reply was discarded after PUT
 *    toggleGlobalAR / toggleProductAR called putAR() but threw away the
 *    returned { arOn, products } envelope. The optimistic update was never
 *    reconciled with the real DB state, so a second toggle would send
 *    stale data. Fix: applyServerReply() now always syncs from the response.
 *
 * 3. FastAPI error shape not parsed correctly
 *    FastAPI wraps errors as { detail: "..." }. Old code called res.text()
 *    which returned raw JSON string as the error message. Fix: try JSON
 *    first, extract .detail.
 *
 * ── Persistence strategy ─────────────────────────────────────────────────
 *   1. On mount  → GET /api/configration/ar  (DB truth, overwrites cache)
 *   2. On toggle → PUT /api/configration/ar  (write to DB, sync reply)
 *   3. localStorage = fast cache so UI doesn't flash on reload
 *
 * ── Products ─────────────────────────────────────────────────────────────
 *   Products come entirely from the DB via GET on mount.
 *   The seed list is only a last-resort fallback when the network
 *   request fails and there is no cache yet.
 */

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "app_config";
const AR_ENDPOINT = "/api/configration/ar";   // Vite proxy forwards this to FastAPI

// ─── localStorage helpers ─────────────────────────────────────────────────
function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveCache(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /**/ }
}

// ─── Auth headers ─────────────────────────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── API: GET /api/configration/ar ───────────────────────────────────────
async function getAR() {
  const res = await fetch(AR_ENDPOINT, { headers: authHeaders() });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j?.detail ?? msg; } catch { /**/ }
    throw new Error(msg);
  }
  return res.json();
}

// ─── API: PUT /api/configration/ar ───────────────────────────────────────
async function putAR(body) {
  const res = await fetch(AR_ENDPOINT, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      msg = typeof json?.detail === "string"
        ? json.detail
        : JSON.stringify(json?.detail ?? json);
    } catch {
      try { msg = await res.text() || msg; } catch { /**/ }
    }
    throw new Error(msg);
  }

  return res.json(); // { arOn: bool, products: [...] }
}

// ─── Helper: apply server envelope to React state ────────────────────────
function applyServerReply(data, setArOn, setProducts) {
  if (typeof data.arOn !== "undefined") setArOn(Boolean(data.arOn));
  if (Array.isArray(data.products) && data.products.length > 0) {
    setProducts(data.products);
  }
}

// ─── Context ──────────────────────────────────────────────────────────────
const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const cache = loadCache();

  const [arOn,      setArOn]      = useState(cache?.arOn     ?? true);
  const [botOn,     setBotOn]     = useState(cache?.botOn    ?? true);
  const [products,  setProducts]  = useState(cache?.products ?? []);
  const [arLoading, setArLoading] = useState(false);
  const [arError,   setArError]   = useState(null);
  const [dbLoaded,  setDbLoaded]  = useState(false);

  // ── Persist to localStorage ───────────────────────────────────────────
  useEffect(() => {
    saveCache({ arOn, botOn, products });
  }, [arOn, botOn, products]);

  // ── Fetch real DB state on mount ──────────────────────────────────────
  useEffect(() => {
    getAR()
      .then(data => {
        applyServerReply(data, setArOn, setProducts);
        setDbLoaded(true);
      })
      .catch(err => {
        console.warn("[ConfigContext] GET /api/configration/ar failed:", err.message);
        setDbLoaded(true); // still mark done so UI can show cached state
      });
  }, []);

  // ── Global AR toggle ──────────────────────────────────────────────────
  const toggleGlobalAR = useCallback(async () => {
    const nextArOn     = !arOn;
    const snapArOn     = arOn;
    const snapProducts = products;

    // Optimistic update
    setArOn(nextArOn);
    setProducts(prev => prev.map(p => ({
      ...p,
      able_ar: nextArOn ? (p.active ? true : p.able_ar) : false,
      active:  nextArOn ? p.active : false,
    })));
    setArError(null);
    setArLoading(true);

    try {
      const data = await putAR({ scope: "global", able_ar: nextArOn });
      // Sync from server — overrides the optimistic guess with DB truth
      applyServerReply(data, setArOn, setProducts);
    } catch (err) {
      setArOn(snapArOn);
      setProducts(snapProducts);
      setArError(`Could not save AR setting — ${err.message}`);
    } finally {
      setArLoading(false);
    }
  }, [arOn, products]);

  // ── Per-product AR toggle ─────────────────────────────────────────────
  const toggleProductAR = useCallback(async (index) => {
    const snapProducts = products;
    const product      = products[index];
    const nextActive   = !product.active;
    const nextAbleAr   = nextActive && arOn;

    setProducts(prev => prev.map((p, i) =>
      i === index ? { ...p, active: nextActive, able_ar: nextAbleAr } : p
    ));
    setArError(null);
    setArLoading(true);

    try {
      const data = await putAR({
        scope:     "product",
        productId: product.id,
        able_ar:   nextAbleAr,
      });
      applyServerReply(data, setArOn, setProducts);
    } catch (err) {
      setProducts(snapProducts);
      setArError(`Could not update ${product.name} — ${err.message}`);
    } finally {
      setArLoading(false);
    }
  }, [arOn, products]);

  // ── Bot toggle (client-only) ──────────────────────────────────────────
  const toggleBot = useCallback(() => setBotOn(v => !v), []);

  return (
    <ConfigContext.Provider value={{
      arOn, toggleGlobalAR, arLoading, arError,
      clearArError: () => setArError(null),
      botOn, toggleBot,
      products, toggleProductAR,
      dbLoaded,
    }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used inside <ConfigProvider>");
  return ctx;
}