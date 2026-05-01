/**
 * components/Shared.jsx
 * Reusable building blocks: StatusBadge, StarRating, StatCard,
 * OrderRow, OrderModal (order-level + item-level status management).
 */

import { useState } from "react";
import api from "../../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────────────────────

export async function updateOrderStatus(orderId, targetStatus) {
  try {
    const { data } = await api.put(`/api/deliveryman/orders/${orderId}/status`, {
      status: targetStatus,
    });
    return data;
  } catch (err) {
    throw new Error(
      err.response?.data?.detail ||
        `Failed to update status (${err.response?.status ?? "network error"})`
    );
  }
}

export async function cancelOrder(orderId) {
  try {
    const { data } = await api.put(`/api/deliveryman/orders/${orderId}/cancel`);
    return data;
  } catch (err) {
    throw new Error(
      err.response?.data?.detail ||
        `Failed to cancel order (${err.response?.status ?? "network error"})`
    );
  }
}

export async function reportProblem(orderId, reason, notes = "") {
  try {
    const { data } = await api.post(`/api/deliveryman/orders/${orderId}/problem`, {
      reason,
      notes,
    });
    return data;
  } catch (err) {
    throw new Error(
      err.response?.data?.detail ||
        `Failed to report problem (${err.response?.status ?? "network error"})`
    );
  }
}

export async function updateItemStatus(orderId, itemId, targetStatus) {
  try {
    const { data } = await api.put(
      `/api/deliveryman/orders/${orderId}/items/${itemId}/status`,
      { status: targetStatus }
    );
    return data;
  } catch (err) {
    throw new Error(
      err.response?.data?.detail ||
        `Failed to update item (${err.response?.status ?? "network error"})`
    );
  }
}

/**
 * Fetches the full fresh order from the backend.
 * Used after any mutation to get up-to-date items.
 */
async function fetchOrder(orderId) {
  const { data } = await api.get(`/api/deliveryman/orders/${orderId}`);
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const STATUS_META = {
  pending:    { label: "Pending",    cls: "bg-amber-100  text-amber-700  border border-amber-200"    },
  processing: { label: "In Transit", cls: "bg-blue-100   text-blue-700   border border-blue-200"     },
  shipped:    { label: "Shipped",    cls: "bg-indigo-100 text-indigo-700 border border-indigo-200"   },
  delivered:  { label: "Delivered",  cls: "bg-emerald-100 text-emerald-700 border border-emerald-200"},
  canceled:   { label: "Canceled",   cls: "bg-slate-100  text-slate-500  border border-slate-200"    },
  problem:    { label: "Problem",    cls: "bg-rose-100   text-rose-700   border border-rose-200"     },
  partial:    { label: "Partial",    cls: "bg-orange-100 text-orange-700 border border-orange-200"   },
};

export const TRANSITIONS = {
  pending:    "processing",
  processing: "shipped",
  shipped:    "delivered",
};

export const TERMINAL = new Set(["delivered", "canceled", "problem", "partial"]);

export const ITEM_TERMINAL = new Set(["delivered", "canceled"]);

export const PROBLEM_REASONS = [
  "Customer not reachable",
  "Wrong address",
  "Product damaged",
  "Traffic delay",
  "Other",
];

// ─────────────────────────────────────────────────────────────────────────────
// Small shared components
// ─────────────────────────────────────────────────────────────────────────────

export function StatusBadge({ status }) {
  const meta = STATUS_META[status?.toLowerCase()] || {
    label: status,
    cls: "bg-slate-100 text-slate-500 border border-slate-200",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

export function StarRating({ rating, size = "sm" }) {
  const r  = parseFloat(rating) || 0;
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`${sz} ${i <= Math.round(r) ? "text-amber-400" : "text-slate-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export function StatCard({ icon, value, label, accent }) {
  return (
    <div className="flex-1 min-w-[140px] bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm border border-slate-100">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent + "18" }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xl font-extrabold text-slate-800 leading-none">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{label}</div>
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 flex items-center gap-3">
      <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p className="text-sm text-rose-700 flex-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs font-semibold text-rose-600 hover:underline">
          Retry
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ItemRow
// ─────────────────────────────────────────────────────────────────────────────

function ItemRow({ item, orderId, isOrderTerminal, onItemMutated }) {
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState(null);

  const itemStatus = (item.status || "pending").toLowerCase();
  const isTerminal = ITEM_TERMINAL.has(itemStatus);
  const canAct     = !isOrderTerminal && !isTerminal;

  async function act(targetStatus) {
    setBusy(true);
    setError(null);
    try {
      const res = await updateItemStatus(orderId, item.id, targetStatus);
      // res = { order_id, item_id, item_status, order_status }
      onItemMutated(item.id, res.item_status, res.order_status);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">{item.product_name}</p>
          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
        </div>
        <p className="text-sm font-semibold text-slate-700 shrink-0">
          {(item.price * item.quantity).toFixed(2)}DA
        </p>
        <StatusBadge status={itemStatus} />
      </div>

      {canAct && (
        <div className="flex border-t border-slate-100">
          <button
            onClick={() => act("delivered")}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50 border-r border-slate-100"
          >
            {busy ? (
              <span className="w-3 h-3 rounded-full border border-emerald-400 border-t-transparent animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            Delivered
          </button>
          <button
            onClick={() => act("canceled")}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-500 bg-white hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {busy ? (
              <span className="w-3 h-3 rounded-full border border-slate-400 border-t-transparent animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            Cancel Item
          </button>
        </div>
      )}

      {error && <p className="text-xs text-rose-600 px-3 pb-2">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OrderModal
// ─────────────────────────────────────────────────────────────────────────────

export function OrderModal({ order, onClose, onMutated }) {
  const [localOrder, setLocalOrder] = useState(order);
  const [showProblem, setShowProblem] = useState(false);
  const [reason,      setReason]      = useState(PROBLEM_REASONS[0]);
  const [notes,       setNotes]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  const status     = localOrder.status?.toLowerCase();
  const isTerminal = TERMINAL.has(status);
  const isPartial  = status === "partial";
  const nextStatus = TRANSITIONS[status];

  // ── Shared helper: refetch order then sync state + parent ─────────────────
  // This is the KEY fix — instead of building a stale local copy, we always
  // pull the fresh order (with updated items) straight from the backend.
  async function syncFromServer() {
    try {
      const fresh = await fetchOrder(localOrder.id_raw);
      setLocalOrder(fresh);
      onMutated(fresh);
      return fresh;
    } catch {
      // Non-fatal: at minimum the order-level status was already updated.
      // Fall back to optimistic local state — parent will still get updated
      // on the next natural refetch.
    }
  }

  // ── Order-level mutations ──────────────────────────────────────────────────

  async function handleAdvance() {
    if (!nextStatus) return;
    setLoading(true);
    setError(null);
    try {
      await updateOrderStatus(localOrder.id_raw, nextStatus);
      // Refetch so items reflect the new status immediately
      await syncFromServer();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    setError(null);
    try {
      await cancelOrder(localOrder.id_raw);
      // Refetch so all items show "canceled" immediately
      await syncFromServer();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleProblem() {
    setLoading(true);
    setError(null);
    try {
      await reportProblem(localOrder.id_raw, reason, notes);
      // Refetch so items reflect "problem" status immediately
      await syncFromServer();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Item-level mutation callback ───────────────────────────────────────────
  // After a single item is updated, refetch the whole order so the items list
  // and order-level status badge are always in perfect sync with the DB.
  async function handleItemMutated(itemId, newItemStatus, newOrderStatus) {
    // Optimistic update first — feels instant to the user
    const optimisticItems = localOrder.items.map((it) =>
      it.id === itemId ? { ...it, status: newItemStatus } : it
    );
    const optimistic = { ...localOrder, items: optimisticItems, status: newOrderStatus };
    setLocalOrder(optimistic);
    onMutated(optimistic);

    // Then confirm with a real refetch to catch any discrepancy
    await syncFromServer();
  }

  const advanceLabel = {
    processing: "Mark as In Transit",
    shipped:    "Mark as Shipped",
    delivered:  "Mark as Delivered",
  }[nextStatus];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,15,30,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-800">{localOrder.id}</span>
              <StatusBadge status={localOrder.status} />
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{localOrder.customer}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* ── Info strip ── */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-slate-700">{localOrder.address}</span>
            </div>

            <div className="flex items-center gap-5">
              {localOrder.eta > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                  </svg>
                  {localOrder.eta} min
                </span>
              )}
              {localOrder.km > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {localOrder.km} km
                </span>
              )}
              <span className="ml-auto font-bold text-violet-700 text-base">
                {Number(localOrder.amount).toFixed(2)}DA
              </span>
            </div>

            {localOrder.date && (
              <p className="text-xs text-slate-400">
                📅{" "}
                {new Date(localOrder.date + "T00:00").toLocaleDateString("en-US", {
                  weekday: "short", month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* ── Items ── */}
          {localOrder.items?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Items</p>
                {!isTerminal && (
                  <p className="text-xs text-slate-400">Tap to mark each item</p>
                )}
              </div>
              <div className="space-y-2">
                {localOrder.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    orderId={localOrder.id_raw}
                    isOrderTerminal={isTerminal && !isPartial}
                    onItemMutated={handleItemMutated}
                  />
                ))}
              </div>

              {isPartial && (
                <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
                  <svg className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-orange-700">
                    Some items were delivered and others canceled — this order is marked as{" "}
                    <strong>Partial</strong>. You can still update any remaining items above.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Rating ── */}
          {localOrder.rating && (
            <div className="flex items-center gap-2">
              <StarRating rating={localOrder.rating} />
              <span className="text-sm text-slate-500">{localOrder.rating} / 5</span>
            </div>
          )}

          {/* ── Problem details ── */}
          {localOrder.problem_reason && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-rose-700 mb-1">Problem Reported</p>
              <p className="text-sm text-rose-600">{localOrder.problem_reason}</p>
              {localOrder.problem_notes && (
                <p className="text-xs text-rose-500 mt-1">{localOrder.problem_notes}</p>
              )}
            </div>
          )}

          {/* ── Error ── */}
          {error && <ErrorBanner message={error} />}

          {/* ── Problem form ── */}
          {showProblem && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-rose-700">Report a Problem</p>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-sm border border-rose-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                {PROBLEM_REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes…"
                rows={2}
                className="w-full text-sm border border-rose-200 rounded-lg px-3 py-2 bg-white text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowProblem(false); setError(null); }}
                  className="flex-1 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProblem}
                  disabled={loading}
                  className="flex-1 py-2 text-sm text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors font-medium disabled:opacity-60"
                >
                  {loading ? "Submitting…" : "Submit Report"}
                </button>
              </div>
            </div>
          )}

          {/* ── Order-level actions ── */}
          {!isTerminal && !isPartial && !showProblem && (
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowProblem(true); setError(null); }}
                  className="flex-1 py-2.5 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors font-medium"
                >
                  Report Problem
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 py-2.5 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium disabled:opacity-60"
                >
                  Cancel Order
                </button>
              </div>
              {nextStatus && (
                <button
                  onClick={handleAdvance}
                  disabled={loading}
                  className="w-full py-2.5 text-sm text-white rounded-xl font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                >
                  {loading ? "Updating…" : advanceLabel}
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OrderRow
// ─────────────────────────────────────────────────────────────────────────────

export function OrderRow({ order, onClick, showDate = false, showRating = false }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0 group"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "rgba(124,58,237,0.08)" }}
      >
        <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{order.id}</span>
          <span className="text-slate-300">·</span>
          <span className="text-sm text-slate-600 truncate">{order.customer}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="text-xs text-slate-500 truncate">{order.address}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {showDate && order.date && (
          <span className="hidden sm:block text-xs text-slate-400">
            📅{" "}
            {new Date(order.date + "T00:00").toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            })}
          </span>
        )}
        {order.eta > 0 && !showDate && (
          <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
            {order.eta} min
          </span>
        )}
        {order.km > 0 && !showDate && (
          <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {order.km} km
          </span>
        )}
        {showRating && order.rating && <StarRating rating={order.rating} />}
        <span className="font-bold text-sm text-violet-700">
          {Number(order.amount).toFixed(2)}DA
        </span>
        <StatusBadge status={order.status} />
        <svg
          className="w-4 h-4 text-slate-300 group-hover:text-violet-400 transition-colors"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}