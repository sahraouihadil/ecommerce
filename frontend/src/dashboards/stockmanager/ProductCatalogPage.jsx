import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Boxes, Truck, RotateCcw, Search, Plus, Pencil,
  Trash2, X, Package, Tag, Palette, DollarSign, Layers, Hash,
  ImagePlus, AlignLeft, AlertTriangle, AlertCircle, Bot, TriangleAlert,
  SendHorizonal, CheckCircle2, Clock, ShieldCheck, Hourglass, XCircle,
} from "lucide-react";

import Header from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api from "../../services/api";

// ─── FIELD WRAPPER ────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
        {Icon && <Icon size={12} />} {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function getInputCls(errors, field) {
  return `w-full h-10 px-3 rounded-lg bg-gray-50 text-sm border outline-none focus:ring-2 focus:border-transparent transition ${errors[field]
      ? "border-red-300 focus:ring-red-400 bg-red-50/40"
      : "border-gray-200 focus:ring-indigo-500"
    }`;
}

// ─── PREDEFINED COLORS ────────────────────────────────────────────────────────
export const PRESET_COLORS = [
  { name: "Black", hex: "#111827" },
  { name: "White", hex: "#F9FAFB", border: true },
  { name: "Gray", hex: "#6B7280" },
  { name: "Charcoal", hex: "#374151" },
  { name: "Beige", hex: "#D4B896" },
  { name: "Ivory", hex: "#FFFFF0", border: true },
  { name: "Brown", hex: "#92400E" },
  { name: "Red", hex: "#EF4444" },
  { name: "Orange", hex: "#F97316" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Green", hex: "#22C55E" },
  { name: "Teal", hex: "#14B8A6" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Navy", hex: "#1E3A5F" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Cream", hex: "#FFF5E1", border: true },
  { name: "Sand", hex: "#EADBC8" },
  { name: "Taupe", hex: "#8B7D7B" },
  { name: "Mocha", hex: "#7B4B3A" },
  { name: "Chocolate", hex: "#5C3317" },
  { name: "Coffee", hex: "#6F4E37" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Olive", hex: "#6B8E23" },
  { name: "Mint", hex: "#98FF98" },
  { name: "Forest Green", hex: "#14532D" },
  { name: "Sage", hex: "#9CAF88" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Sky Blue", hex: "#38BDF8" },
  { name: "Royal Blue", hex: "#1D4ED8" },
  { name: "Steel Blue", hex: "#4682B4" },
  { name: "Baby Blue", hex: "#BFDBFE" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Lavender", hex: "#C4B5FD" },
  { name: "Plum", hex: "#7E22CE" },
  { name: "Violet", hex: "#8B5CF6" },
  { name: "Indigo", hex: "#4F46E5" },
  { name: "Rose", hex: "#F43F5E" },
  { name: "Coral", hex: "#FF7F50" },
  { name: "Salmon", hex: "#FA8072" },
  { name: "Burgundy", hex: "#7F1D1D" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Mustard", hex: "#D97706" },
  { name: "Peach", hex: "#FFDAB9" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Bronze", hex: "#CD7F32" },
  { name: "Copper", hex: "#B87333" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Transparent", hex: "transparent", border: true },
];

// ─── COLOR DOT ────────────────────────────────────────────────────────────────
function ColorDot({ hex }) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full border border-gray-300 shrink-0"
      style={{ background: hex ?? "#d1d5db" }}
    />
  );
}

// ─── COLOR PICKER ─────────────────────────────────────────────────────────────
function ColorPicker({ selected, onChange }) {
  const toggle = (name) => {
    onChange(
      selected.includes(name)
        ? selected.filter((c) => c !== name)
        : [...selected, name]
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
        {PRESET_COLORS.map(({ name, hex, border }) => {
          const active = selected.includes(name);
          return (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => toggle(name)}
              className={`relative w-7 h-7 rounded-full transition-transform hover:scale-110 cursor-pointer focus:outline-none ${border ? "border border-gray-300" : ""
                } ${active ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : ""}`}
              style={{ background: hex }}
            >
              {active && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke={["White", "Ivory", "Beige", "Yellow"].includes(name) ? "#374151" : "#fff"}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((name) => {
            const preset = PRESET_COLORS.find((c) => c.name === name);
            return (
              <span
                key={name}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-medium text-gray-700"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-gray-200 shrink-0"
                  style={{ background: preset?.hex ?? "#d1d5db" }}
                />
                {name}
                <button
                  type="button"
                  onClick={() => toggle(name)}
                  className="ml-0.5 text-gray-400 hover:text-red-500 transition cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── APPROVAL BADGE ───────────────────────────────────────────────────────────
function ApprovalBadge({ status }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
        <ShieldCheck size={11} /> Approved
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 w-fit">
        <XCircle size={11} /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 w-fit">
      <Hourglass size={11} /> Pending
    </span>
  );
}

// ─── DELETE REQUEST BADGE ─────────────────────────────────────────────────────
function DeleteRequestBadge({ status }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 w-fit">
        <Trash2 size={10} /> Delete Pending
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 w-fit">
        <XCircle size={10} /> Delete Rejected
      </span>
    );
  }
  return null;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const EMPTY_FILES = [null, null, null];
const EMPTY_PREVIEWS = [null, null, null];

const BLANK_PRODUCT = {
  name: "", description: "", category: "", sku: "",
  price: "", quantity: "", min_stock: 10, badge: "new",
  model_src: "", model_3d: "", ios_src: "",
  able_3d: false, able_ar: false,
};

// ─── HELPERS (pure, defined outside component so they're stable) ──────────────
const getStockStatus = (qty) => {
  if (qty === 0) return "Out of Stock";
  if (qty < 10)  return "Low Stock";
  return "In Stock";
};

const stockStatusStyle = (s) => {
  if (s === "In Stock")  return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (s === "Low Stock") return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-red-50 text-red-600 border border-red-200";
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function ProductCatalogPage() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [imageFiles, setImageFiles] = useState([...EMPTY_FILES]);
  const [imagePreviews, setImagePreviews] = useState([...EMPTY_PREVIEWS]);
  const [colorTags, setColorTags] = useState([]);

  const [newProduct, setNewProduct] = useState({ ...BLANK_PRODUCT });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [errors, setErrors] = useState({});

<<<<<<< HEAD
  // ── Delete-request modal ───────────────────────────────────────────────────
  const [showDeleteRequestModal, setShowDeleteRequestModal] = useState(false);
  const [deleteRequestProduct,   setDeleteRequestProduct]   = useState(null);
  const [deleteRequestLoading,   setDeleteRequestLoading]   = useState(false);
  const [deleteRequestError,     setDeleteRequestError]     = useState("");
=======
  const [showWindow, setShowWindow] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
>>>>>>> 403f51d1f34d80c3e09fcb8bb491c29c5149b532

  const [filters, setFilters] = useState({
    search: "", category: "all", color: "all", status: "all", approval: "all",
    priceMin: 0, priceMax: 100000,
  });

  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);

  // ── Submit-for-Validation state ────────────────────────────────────────────
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationProduct, setValidationProduct] = useState(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  // ── Tracks whether the validation modal was opened after an edit ───────────
  // When true, the submit call uses /upsert so it overwrites any existing
  // pending request instead of throwing a 400 "already pending" error.
  const [validationIsEdit, setValidationIsEdit] = useState(false);

  // ── Validation maps ────────────────────────────────────────────────────────
  const [validationMap,       setValidationMap]       = useState({});
  const [deleteValidationMap, setDeleteValidationMap] = useState({});

  // ── Currently edited product snapshot ─────────────────────────────────────
  const [editingProduct, setEditingProduct] = useState(null);

  // ── FIX: stable callbacks so useMemo deps are correct ─────────────────────

  const getApprovalStatus = useCallback((p) => {
    if (p.is_active) return "approved";
    if (validationMap[p.id]?.status === "Rejected") return "rejected";
    return "pending";
  }, [validationMap]);

  const getDeleteRequestStatus = useCallback((p) => {
    const rec = deleteValidationMap[p.id];
    if (!rec) return null;
    if (rec.status === "Pending")  return "pending";
    if (rec.status === "Rejected") return "rejected";
    return null;
  }, [deleteValidationMap]);

  // ── fetch products ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/products/all");
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── fetch validation records ───────────────────────────────────────────────
  const fetchValidations = useCallback(async () => {
    try {
      const [resProducts, resDelete] = await Promise.all([
        api.get("/api/validation/", { params: { item_type: "Products", limit: 200 } }),
        api.get("/api/validation/", { params: { item_type: "Products_Delete", limit: 200 } }),
      ]);

      const map = {};
      resProducts.data.forEach((v) => {
        const existing = map[v.item_id];
        if (!existing || new Date(v.submitted_at) > new Date(existing.submitted_at)) {
          map[v.item_id] = v;
        }
      });
      setValidationMap(map);

      const delMap = {};
      resDelete.data.forEach((v) => {
        if (v.status === "Approved") return;
        const existing = delMap[v.item_id];
        if (!existing || new Date(v.submitted_at) > new Date(existing.submitted_at)) {
          delMap[v.item_id] = v;
        }
      });
      setDeleteValidationMap(delMap);
    } catch (err) {
      console.error("Failed to load validations:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchValidations();
  }, [fetchProducts, fetchValidations]);

<<<<<<< HEAD
=======
  // ── helpers ────────────────────────────────────────────────────────────────
  const getStockStatus = (qty) => {
    if (qty === 0) return "Out of Stock";
    if (qty < 10) return "Low Stock";
    return "In Stock";
  };

  const stockStatusStyle = (s) => {
    if (s === "In Stock") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (s === "Low Stock") return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-red-50 text-red-600 border border-red-200";
  };

  const getApprovalStatus = (p) => {
    if (p.is_active) return "approved";
    if (validationMap[p.id]?.status === "Rejected") return "rejected";
    return "pending";
  };

>>>>>>> 403f51d1f34d80c3e09fcb8bb491c29c5149b532
  const categories = useMemo(
    () => ["all", ...new Set(products.map((p) => p.category))], [products]);

  const allColors = useMemo(() => {
    const set = new Set();
    products.forEach((p) => (p.colors || []).forEach((c) => set.add(c)));
    return ["all", ...set];
  }, [products]);

  const filteredProducts = useMemo(() => products.filter((p) => {
    const stockStatus = getStockStatus(p.quantity);
    const approvalStatus = getApprovalStatus(p);
<<<<<<< HEAD
    const colorMatch     = filters.color === "all" || (p.colors || []).includes(filters.color);

=======
    const colorMatch = filters.color === "all" || (p.colors || []).includes(filters.color);
>>>>>>> 403f51d1f34d80c3e09fcb8bb491c29c5149b532
    const approvalMatch =
      filters.approval === "all" ||
      (filters.approval === "approved" && approvalStatus === "approved") ||
      (filters.approval === "rejected" && approvalStatus === "rejected") ||
<<<<<<< HEAD
      (filters.approval === "pending"  && approvalStatus === "pending");

=======
      (filters.approval === "pending" && approvalStatus === "pending");
>>>>>>> 403f51d1f34d80c3e09fcb8bb491c29c5149b532
    return (
      p.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.category === "all" || p.category === filters.category) &&
      colorMatch &&
      approvalMatch &&
      (filters.status === "all" || stockStatus === filters.status) &&
      p.price >= filters.priceMin &&
      p.price <= filters.priceMax
    );
<<<<<<< HEAD
  }), [products, filters, getApprovalStatus]);
=======
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [products, filters, validationMap]);
>>>>>>> 403f51d1f34d80c3e09fcb8bb491c29c5149b532

  // ── summary strip stats ────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: products.length,
    approved: products.filter((p) => p.is_active).length,
    pending: products.filter((p) => !p.is_active && validationMap[p.id]?.status !== "Rejected").length,
    rejected: products.filter((p) => !p.is_active && validationMap[p.id]?.status === "Rejected").length,
  }), [products, validationMap]);

  // ── flash ──────────────────────────────────────────────────────────────────
  const showFlash = (msg, type) => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => { setMessage(""); setMessageType(""); }, 4000);
  };

  // ── form validation ────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!newProduct.name?.trim()) e.name = "Product name is required";
    if (!newProduct.category) e.category = "Please select a category";
    if (!newProduct.sku?.trim()) e.sku = "SKU is required";
    if (!newProduct.price || Number(newProduct.price) <= 0)
      e.price = "Price must be greater than 0";
    if (newProduct.quantity === "" || Number(newProduct.quantity) < 0)
      e.quantity = "Stock cannot be negative";
    return e;
  };

  const clearError = (field) =>
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  // ── image slots ────────────────────────────────────────────────────────────
  const handleImageChange = (idx, file) => {
    if (!file) return;
    setImageFiles((p) => { const n = [...p]; n[idx] = file; return n; });
    setImagePreviews((p) => { const n = [...p]; n[idx] = URL.createObjectURL(file); return n; });
  };

  const removeImage = (idx) => {
    setImageFiles((p) => { const n = [...p]; n[idx] = null; return n; });
    setImagePreviews((p) => { const n = [...p]; n[idx] = null; return n; });
  };

  // ── reset modal ────────────────────────────────────────────────────────────
  const resetModal = () => {
    setShowModal(false); setEditMode(false); setSelectedProductId(null);
    setImageFiles([...EMPTY_FILES]); setImagePreviews([...EMPTY_PREVIEWS]);
    setColorTags([]); setErrors({});
    setNewProduct({ ...BLANK_PRODUCT });
    setEditingProduct(null);
  };

  // ── edit ───────────────────────────────────────────────────────────────────
  const handleEdit = (p) => {
    setNewProduct({
      name: p.name, description: p.description || "", category: p.category || "",
      sku: p.sku || "", price: p.price, quantity: p.quantity,
      min_stock: p.min_stock, badge: p.badge || "new",
      model_src: p.model_src || "", model_3d: p.model_3d || "",
      ios_src: p.ios_src || "", able_3d: p.able_3d, able_ar: p.able_ar,
    });

    const previews = [null, null, null];
    (p.images || []).slice(0, 3).forEach((url, i) => {
      previews[i] = `http://127.0.0.1:8000/${url}`;
    });
    setImagePreviews(previews);
    setImageFiles([...EMPTY_FILES]);
    setColorTags(p.colors || []);
    setSelectedProductId(p.id);
    setErrors({});
    setEditMode(true);
    setEditingProduct(p);
    setShowModal(true);
  };

  // ── delete → opens delete-request modal ───────────────────────────────────
  const handleDelete = (p) => {
    setDeleteRequestProduct(p);
    setDeleteRequestError("");
    setShowDeleteRequestModal(true);
  };

  const closeDeleteRequestModal = () => {
    setShowDeleteRequestModal(false);
    setDeleteRequestProduct(null);
    setDeleteRequestError("");
  };

  const handleSubmitDeleteRequest = async () => {
    if (!deleteRequestProduct) return;
    setDeleteRequestLoading(true);
    setDeleteRequestError("");
    try {
      await api.post("/api/validation/", {
        item_type: "Products_Delete",
        item_id:   deleteRequestProduct.id,
        title:     deleteRequestProduct.name,
      });
      showFlash(`Delete request for "${deleteRequestProduct.name}" submitted for admin review.`, "success");
      await fetchValidations();
      closeDeleteRequestModal();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setDeleteRequestError(detail || "Failed to submit delete request. Please try again.");
    } finally {
      setDeleteRequestLoading(false);
    }
  };

  // ── save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaveLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", newProduct.name);
      fd.append("description", newProduct.description || "");
      fd.append("category", newProduct.category || "");
      fd.append("sku", newProduct.sku);
      fd.append("price", newProduct.price);
      fd.append("quantity", newProduct.quantity);
      fd.append("min_stock", newProduct.min_stock);
      fd.append("model_src", newProduct.model_src || "");
      fd.append("model_3d", newProduct.model_3d || "");
      fd.append("ios_src", newProduct.ios_src || "");
      fd.append("able_3d", newProduct.able_3d);
      fd.append("able_ar", newProduct.able_ar);
      fd.append("colors", JSON.stringify(colorTags));
      imageFiles.forEach((file, i) => {
        if (file instanceof File) fd.append(`image_${i + 1}`, file);
      });

      let savedProduct = null;

      if (editMode) {
        // ── FIX: is_active is a required Form field on the PUT endpoint.
        // Always send false so the product is reset to pending re-approval
        // after any edit — it will only go live again once the admin approves.
        fd.append("is_active", "false");

        const res = await api.put(`/api/products/${selectedProductId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        savedProduct = res.data;
        showFlash("Product updated — it's now pending re-approval.", "success");
      } else {
        const res = await api.post("/api/products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        savedProduct = res.data;
        showFlash("Product created — submit it for admin approval to make it live.", "success");
      }

      await fetchProducts();
      await fetchValidations();
      resetModal();

      if (savedProduct) {
        setValidationProduct(savedProduct);
        // ── FIX: flag so the submit uses /upsert when called after an edit.
        // Upsert resets any existing pending/rejected validation record instead
        // of throwing a 400 "already pending" error.
        setValidationIsEdit(editMode);
        setValidationError("");
        setShowValidationModal(true);
      }
    } catch (err) {
      console.error(err.response?.data || err);
      showFlash("Something went wrong. Please try again.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Submit for Validation ──────────────────────────────────────────────────
  const openValidationModal = (product) => {
    setValidationProduct(product);
    setValidationIsEdit(false);
    setValidationError("");
    setShowValidationModal(true);
  };

  const closeValidationModal = () => {
    setShowValidationModal(false);
    setValidationProduct(null);
    setValidationError("");
    setValidationIsEdit(false);
  };

  const handleSubmitForValidation = async () => {
    if (!validationProduct) return;
    setValidationLoading(true);
    setValidationError("");

    try {
      // ── FIX: After an edit, use /upsert so that an already-pending (or
      // previously rejected) validation record is reset to Pending rather
      // than the API returning 400 "already has a pending request".
      // For brand-new products there is no existing record, so upsert also
      // works fine — it simply creates one.
      const endpoint = validationIsEdit
        ? "/api/validation/upsert"
        : "/api/validation/";

      await api.post(endpoint, {
        item_type: "Products",
        item_id: validationProduct.id,
        title: validationProduct.name,
      });

      showFlash(`"${validationProduct.name}" submitted for admin review`, "success");
      await fetchValidations();
      closeValidationModal();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setValidationError(detail || "Failed to submit. Please try again.");
    } finally {
      setValidationLoading(false);
    }
  };

  // ── nav ────────────────────────────────────────────────────────────────────
  const stockManagerLinks = [
    { to: "/stock-manager-dash", label: "Dashboard", icon: <LayoutDashboard />, end: true },
    { to: "/stock-manager-dash/inventories", label: "Product's Catalog", icon: <Boxes /> },
    { to: "/stock-manager-dash/ar", label: "AR/3D Management", icon: <Bot size={18} /> },
    { to: "/stock-manager-dash/deliveries", label: "Delivery", icon: <Truck /> },
    { to: "/stock-manager-dash/problems", label: "Problems", icon: <TriangleAlert /> },
    { to: "/stock-manager-dash/returns", label: "Returns", icon: <RotateCcw /> },
  ];

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar openBar={openBar} setOpenBar={setOpenBar} links={stockManagerLinks}
        title="StockManagerCore" subtitle="Enterprise Suite" role="Manager" profilePath="/stock-manager-dash/profile" />

      <main className="flex-1">
        <Header concept="Product's Catalog" />

        <div className="p-6 space-y-5">

          {/* PAGE HEADER */}
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">
              Manage inventory — only <span className="font-medium text-emerald-600">approved</span> products appear on the storefront.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition text-sm font-medium cursor-pointer"
            >
              <Plus size={15} /> Add Product
            </button>
          </div>

          {/* APPROVAL SUMMARY STRIP */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <Package size={16} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Total Products</p>
                <p className="text-xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Approved & Live</p>
                <p className="text-xl font-bold text-emerald-600">{stats.approved}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-amber-100 px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <Hourglass size={16} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Pending Approval</p>
                <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-red-100 px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <XCircle size={16} className="text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Rejected</p>
                <p className="text-xl font-bold text-red-500">{stats.rejected}</p>
              </div>
            </div>
          </div>

          {/* FLASH */}
          {message && (
            <div className={`p-3 rounded-lg border-l-4 text-sm font-medium transition-all ${messageType === "success"
                ? "bg-green-50 text-green-800 border-green-500"
                : "bg-red-50 text-red-800 border-red-500"}`}>
              {message}
            </div>
          )}

          {/* FILTERS */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex items-center gap-2 h-10 border border-gray-200 bg-gray-50 px-3 rounded-xl w-full md:w-72 focus-within:ring-2 focus-within:ring-indigo-500">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                className="outline-none w-full text-sm bg-transparent"
                placeholder="Search product..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {[
                { key: "category", options: categories },
                { key: "color", options: allColors },
              ].map(({ key, options }) => (
                <select key={key}
                  className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none capitalize"
                  value={filters[key]}
                  onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}>
                  {options.map((o, i) => <option key={i} value={o}>{o}</option>)}
                </select>
              ))}

              <select
                className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filters.approval}
                onChange={(e) => setFilters({ ...filters, approval: e.target.value })}>
                <option value="all">All Approvals</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="all">All Stock</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm">
                <span className="text-gray-400 text-xs">$</span>
                <input type="number" placeholder="0" className="w-16 bg-transparent outline-none text-sm"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({ ...filters, priceMin: +e.target.value })} />
                <span className="text-gray-300">—</span>
                <input type="number" placeholder="100000" className="w-20 bg-transparent outline-none text-sm"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: +e.target.value })} />
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-9 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-400 tracking-widest uppercase border-b border-gray-100">
              <span className="col-span-2">Product</span>
              <span>Category</span>
              <span>SKU</span>
              <span>Stock</span>
              <span>Price</span>
              <span>Stock Status</span>
              <span>Approval</span>
              <span>Actions</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading products…</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No products found</div>
            ) : (
              filteredProducts.map((p) => {
<<<<<<< HEAD
                const stockStatus      = getStockStatus(p.quantity);
                const approvalStatus   = getApprovalStatus(p);
                const deleteReqStatus  = getDeleteRequestStatus(p);
                const isRejected       = approvalStatus === "rejected";
                const hasPendingDelete = deleteReqStatus === "pending";
=======
                const stockStatus = getStockStatus(p.quantity);
                const approvalStatus = getApprovalStatus(p);
                const isRejected = approvalStatus === "rejected";
>>>>>>> 403f51d1f34d80c3e09fcb8bb491c29c5149b532

                return (
                  <div
                    key={p.id}
<<<<<<< HEAD
                    className={`grid grid-cols-9 px-4 py-3 border-t border-gray-50 hover:bg-gray-50 transition items-center ${
                      hasPendingDelete ? "bg-orange-50/30" :
                      isRejected       ? "bg-red-50/20"   :
                      !p.is_active     ? "bg-amber-50/20" : ""
                    }`}
=======
                    className={`grid grid-cols-9 px-4 py-3 border-t border-gray-50 hover:bg-gray-50 transition items-center ${isRejected ? "bg-red-50/20" : !p.is_active ? "bg-amber-50/20" : ""
                      }`}
>>>>>>> 403f51d1f34d80c3e09fcb8bb491c29c5149b532
                  >
                    {/* Product — col-span-2 */}
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={`http://127.0.0.1:8000/${p.image_url}`}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        />
                        {hasPendingDelete && (
                          <span
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-400 border-2 border-white"
                            title="Delete request pending admin review"
                          />
                        )}
                        {!hasPendingDelete && isRejected && (
                          <span
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-400 border-2 border-white"
                            title="Rejected by admin"
                          />
                        )}
                        {!hasPendingDelete && !p.is_active && !isRejected && (
                          <span
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white"
                            title="Pending approval"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-800 truncate">{p.name}</p>
                        {(p.colors || []).length > 0 && (
                          <div className="flex gap-1 mt-0.5">
                            {(p.colors || []).map((name) => {
                              const preset = PRESET_COLORS.find((c) => c.name === name);
                              return <ColorDot key={name} hex={preset?.hex} />;
                            })}
                          </div>
                        )}
                        {deleteReqStatus && (
                          <div className="mt-1">
                            <DeleteRequestBadge status={deleteReqStatus} />
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-sm text-gray-500 capitalize">{p.category}</span>
                    <span className="text-xs text-gray-400 font-mono">{p.sku || "—"}</span>
                    <span className="text-sm font-medium">{p.quantity}</span>
                    <span className="text-sm font-semibold text-gray-800">${p.price}</span>

                    <span className={`text-xs px-2.5 py-1 rounded-full w-fit font-medium ${stockStatusStyle(stockStatus)}`}>
                      {stockStatus}
                    </span>

                    <div>
                      <ApprovalBadge status={approvalStatus} />
                    </div>

                    <div className="flex gap-3 text-gray-300">
                      <button onClick={() => handleEdit(p)} title="Edit"
                        className="hover:text-indigo-500 transition cursor-pointer">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => !hasPendingDelete && handleDelete(p)}
                        title={hasPendingDelete ? "Delete request already pending" : "Request deletion"}
                        className={`transition ${hasPendingDelete ? "text-orange-300 cursor-not-allowed" : "hover:text-red-500 cursor-pointer"}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </main>

      {/* ─── ADD / EDIT MODAL ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={resetModal} />

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Package size={16} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {editMode ? "Edit Product" : "New Product"}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {editMode
                      ? "Changes require re-approval before going live"
                      : "Requires admin approval before appearing on the storefront"}
                  </p>
                </div>
              </div>
              <button onClick={resetModal}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer">
                <X size={15} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

              {editMode && editingProduct && (() => {
                const approvalStatus = getApprovalStatus(editingProduct);
                const validation = validationMap[editingProduct.id];
                const isRejected = approvalStatus === "rejected";

                return (
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 p-3 bg-gray-50">
                      <img
                        src={`http://127.0.0.1:8000/${editingProduct.image_url}`}
                        alt={editingProduct.name}
                        className="w-14 h-14 rounded-lg object-cover bg-gray-200 shrink-0 border border-gray-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{editingProduct.name}</p>
                        <p className="text-xs text-gray-400 capitalize mt-0.5">
                          {editingProduct.category} · SKU {editingProduct.sku || "—"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-semibold text-gray-700">${editingProduct.price}</span>
                          <span className="text-gray-300">·</span>
                          <ApprovalBadge status={approvalStatus} />
                        </div>
                      </div>
                    </div>

                    {isRejected && validation?.rejection_note && (
                      <div className="flex items-start gap-2.5 bg-red-50 border-t border-red-100 px-4 py-3">
                        <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-red-700 mb-0.5">
                            Rejected — please fix before resubmitting
                          </p>
                          <p className="text-xs text-red-600 leading-relaxed">
                            {validation.rejection_note}
                          </p>
                        </div>
                      </div>
                    )}

                    {!isRejected && (
                      <div className="flex items-center gap-2 bg-amber-50 border-t border-amber-100 px-4 py-2.5">
                        <Hourglass size={12} className="text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-700">
                          After saving you'll be prompted to submit for admin review.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {!editMode && (
                <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                  <Hourglass size={13} className="text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">
                    After saving you'll be prompted to submit for admin review. The product stays hidden until approved.
                  </p>
                </div>
              )}

              {Object.keys(errors).length > 0 && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-0.5">Please fix the following errors</p>
                    <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                      {Object.values(errors).map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              <Field label="Product Images (up to 3)" icon={ImagePlus}>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="relative group">
                      {imagePreviews[idx] ? (
                        <>
                          <img
                            src={imagePreviews[idx]}
                            alt={`preview-${idx + 1}`}
                            className="w-full h-24 object-cover rounded-xl border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center gap-2">
                            <label className="cursor-pointer w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center hover:bg-white transition" title="Change">
                              <ImagePlus size={13} className="text-indigo-600" />
                              <input type="file" accept="image/*" className="hidden"
                                onChange={(e) => { const f = e.target.files[0]; if (f) handleImageChange(idx, f); }} />
                            </label>
                            <button type="button" onClick={() => removeImage(idx)}
                              className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center hover:bg-white transition cursor-pointer" title="Remove">
                              <X size={13} className="text-red-500" />
                            </button>
                          </div>
                          <span className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                            {idx + 1}
                          </span>
                        </>
                      ) : (
                        <label className="block cursor-pointer">
                          <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1.5 hover:border-indigo-300 hover:bg-indigo-50/40 transition">
                            <ImagePlus size={16} className="text-gray-300" />
                            <span className="text-[10px] text-gray-400 font-medium">Photo {idx + 1}</span>
                          </div>
                          <input type="file" accept="image/*" className="hidden"
                            onChange={(e) => { const f = e.target.files[0]; if (f) handleImageChange(idx, f); }} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">First image is used as the main product photo.</p>
              </Field>

              <Field label="Product Name *" icon={Package} error={errors.name}>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={newProduct.name || ""}
                  className={getInputCls(errors, "name")}
                  onChange={(e) => { setNewProduct({ ...newProduct, name: e.target.value }); clearError("name"); }}
                />
              </Field>

              <Field label="Description" icon={AlignLeft}>
                <textarea
                  placeholder="Brief product description…"
                  value={newProduct.description || ""}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-50 text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Category *" icon={Tag} error={errors.category}>
                  <select
                    value={newProduct.category || ""}
                    className={getInputCls(errors, "category")}
                    onChange={(e) => { setNewProduct({ ...newProduct, category: e.target.value }); clearError("category"); }}>
                    <option value="">Select…</option>
                    <option value="sofas">Sofas</option>
                    <option value="tables">Tables</option>
                    <option value="chandeliers">Chandeliers</option>
                    <option value="chairs">Chairs</option>
                    <option value="set">SET</option>
                  </select>
                </Field>

                <Field label="SKU *" icon={Hash} error={errors.sku}>
                  <input
                    placeholder="SKU-000"
                    value={newProduct.sku || ""}
                    className={getInputCls(errors, "sku")}
                    onChange={(e) => { setNewProduct({ ...newProduct, sku: e.target.value }); clearError("sku"); }}
                  />
                </Field>
              </div>

              <Field label="Colors" icon={Palette}>
                <ColorPicker selected={colorTags} onChange={setColorTags} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Price ($) *" icon={DollarSign} error={errors.price}>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newProduct.price}
                    className={getInputCls(errors, "price")}
                    onChange={(e) => { setNewProduct({ ...newProduct, price: e.target.value }); clearError("price"); }}
                  />
                </Field>

                <Field label="Stock Level *" icon={Layers} error={errors.quantity}>
                  <input
                    type="number"
                    placeholder="0"
                    value={newProduct.quantity}
                    className={getInputCls(errors, "quantity")}
                    onChange={(e) => { setNewProduct({ ...newProduct, quantity: e.target.value }); clearError("quantity"); }}
                  />
                </Field>
              </div>

            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5 bg-gray-50/60">
              <button onClick={resetModal}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-sm text-gray-600 transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saveLoading}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition cursor-pointer flex items-center gap-2 disabled:opacity-60">
                {saveLoading ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    {editMode ? "Updating…" : "Creating…"}
                  </>
                ) : editMode
                  ? <><Pencil size={14} /> Save & Request Re-approval</>
                  : <><Plus size={14} /> Create & Submit for Approval</>
                }
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─── DELETE REQUEST MODAL ─────────────────────────────────────────────── */}
      {showDeleteRequestModal && deleteRequestProduct && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDeleteRequestModal} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden">
            <div className="h-1 w-full bg-red-500" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 size={18} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Request Product Deletion</h2>
                    <p className="text-xs text-gray-400">Requires admin approval before removal</p>
                  </div>
                </div>
                <button onClick={closeDeleteRequestModal}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer">
                  <X size={15} />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 mb-4">
                <img
                  src={`http://127.0.0.1:8000/${deleteRequestProduct.image_url}`}
                  alt={deleteRequestProduct.name}
                  className="w-12 h-12 rounded-lg object-cover bg-gray-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{deleteRequestProduct.name}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {deleteRequestProduct.category} · SKU {deleteRequestProduct.sku || "—"}
                  </p>
                </div>
                <span className="ml-auto text-xs font-semibold text-gray-700 shrink-0">
                  ${deleteRequestProduct.price}
                </span>
              </div>

              <div className="rounded-xl border border-red-100 bg-red-50/50 px-4 py-3 mb-4 space-y-1.5">
                <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
                  <AlertTriangle size={11} /> What happens next?
                </p>
                <ul className="text-xs text-red-600 space-y-0.5 pl-4 list-disc">
                  <li>A deletion request is sent to the admin queue.</li>
                  <li>The product remains on the catalog until the admin approves the deletion.</li>
                  <li>If the admin rejects it, you will see a rejection note here.</li>
                </ul>
              </div>

              {deleteRequestError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600">{deleteRequestError}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button onClick={closeDeleteRequestModal} disabled={deleteRequestLoading}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 transition cursor-pointer disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSubmitDeleteRequest} disabled={deleteRequestLoading}
                  className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition cursor-pointer flex items-center gap-2 disabled:opacity-60">
                  {deleteRequestLoading ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <><SendHorizonal size={14} /> Submit for Admin Review</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SUBMIT FOR VALIDATION MODAL ──────────────────────────────────────── */}
      {showValidationModal && validationProduct && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeValidationModal} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden">
            <div className="h-1 w-full bg-violet-500" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <SendHorizonal size={18} className="text-violet-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Submit for Admin Review</h2>
                    <p className="text-xs text-gray-400">Product stays hidden until approved</p>
                  </div>
                </div>
                <button onClick={closeValidationModal}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer">
                  <X size={15} />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 mb-4">
                <img
                  src={`http://127.0.0.1:8000/${validationProduct.image_url}`}
                  alt={validationProduct.name}
                  className="w-12 h-12 rounded-lg object-cover bg-gray-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{validationProduct.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{validationProduct.category} · SKU {validationProduct.sku || "—"}</p>
                </div>
                <span className="ml-auto text-xs font-semibold text-gray-700 shrink-0">${validationProduct.price}</span>
              </div>

              <div className="rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3 mb-4 space-y-1.5">
                <p className="text-xs font-semibold text-violet-700 flex items-center gap-1.5">
                  <Clock size={11} /> What happens next?
                </p>
                <ul className="text-xs text-violet-600 space-y-0.5 pl-4 list-disc">
                  <li>Product enters the admin queue with status <strong>Pending</strong>.</li>
                  <li>It stays hidden on the storefront until the admin approves it.</li>
                  {validationIsEdit && (
                    <li>Any previous pending or rejected review is replaced with this fresh submission.</li>
                  )}
                  {!validationIsEdit && (
                    <li>Duplicate pending submissions for the same product are rejected.</li>
                  )}
                </ul>
              </div>

              {validationError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600">{validationError}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button onClick={closeValidationModal} disabled={validationLoading}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 transition cursor-pointer disabled:opacity-50">
                  Later
                </button>
                <button onClick={handleSubmitForValidation} disabled={validationLoading}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition cursor-pointer flex items-center gap-2 disabled:opacity-60">
                  {validationLoading ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <><CheckCircle2 size={14} /> Confirm & Submit</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}