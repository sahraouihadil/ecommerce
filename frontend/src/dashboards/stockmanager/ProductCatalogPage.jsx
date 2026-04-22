import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Boxes, Truck, RotateCcw, Search, Plus, Pencil,
  Trash2, X, Package, Tag, Palette, DollarSign, Layers, Hash,
  ImagePlus, AlignLeft, AlertTriangle, AlertCircle,Bot
} from "lucide-react";

import Header  from "../ui/Header";
import Sidebar from "../ui/Sidebar";
import api     from "../../services/api";

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
  return `w-full h-10 px-3 rounded-lg bg-gray-50 text-sm border outline-none focus:ring-2 focus:border-transparent transition ${
    errors[field]
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

// ─── COLOR DOT (used in table rows) ──────────────────────────────────────────
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
      {/* swatch grid */}
      <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
        {PRESET_COLORS.map(({ name, hex, border }) => {
          const active = selected.includes(name);
          return (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => toggle(name)}
              className={`relative w-7 h-7 rounded-full transition-transform hover:scale-110 cursor-pointer focus:outline-none ${
                border ? "border border-gray-300" : ""
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

      {/* selected pills */}
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

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const EMPTY_FILES    = [null, null, null];
const EMPTY_PREVIEWS = [null, null, null];

const BLANK_PRODUCT = {
  name: "", description: "", category: "", sku: "",
  price: "", quantity: "", min_stock: 10, badge: "new",
  model_src: "", model_3d: "", ios_src: "",
  able_3d: false, able_ar: false, is_active: true,
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function ProductCatalogPage() {
  const navigate = useNavigate();

  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode,  setEditMode]  = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [imageFiles,    setImageFiles]    = useState([...EMPTY_FILES]);
  const [imagePreviews, setImagePreviews] = useState([...EMPTY_PREVIEWS]);
  const [colorTags,     setColorTags]     = useState([]);

  const [newProduct, setNewProduct] = useState({ ...BLANK_PRODUCT });

  const [message,     setMessage]     = useState("");
  const [messageType, setMessageType] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [errors,      setErrors]      = useState({});

  const [showWindow,    setShowWindow]    = useState(false);
  const [selectedId,    setSelectedId]    = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "", category: "all", color: "all", status: "all",
    priceMin: 0, priceMax: 100000,
  });

  const [openBar, setOpenBar] = useState(window.innerWidth >= 600);

  // ── auth ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const verify = async () => {
      if (!localStorage.getItem("token")) { navigate("/login"); return; }
      try { await api.get("/stock-manager-dash"); }
      catch { localStorage.removeItem("token"); navigate("/"); }
    };
    verify();
  }, [navigate]);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── helpers ────────────────────────────────────────────────────────────────
  const getStatus = (qty) => {
    if (qty === 0) return "Out of Stock";
    if (qty < 10)  return "Low Stock";
    return "In Stock";
  };

  const statusStyle = (s) => {
    if (s === "In Stock")  return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (s === "Low Stock") return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-red-50 text-red-600 border border-red-200";
  };

  const categories = useMemo(
    () => ["all", ...new Set(products.map((p) => p.category))], [products]);

  const allColors = useMemo(() => {
    const set = new Set();
    products.forEach((p) => (p.colors || []).forEach((c) => set.add(c)));
    return ["all", ...set];
  }, [products]);

  const filteredProducts = useMemo(() => products.filter((p) => {
    const status     = getStatus(p.quantity);
    const colorMatch = filters.color === "all" || (p.colors || []).includes(filters.color);
    return (
      p.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.category === "all" || p.category === filters.category) &&
      colorMatch &&
      (filters.status === "all" || status === filters.status) &&
      p.price >= filters.priceMin &&
      p.price <= filters.priceMax
    );
  }), [products, filters]);

  // ── flash ──────────────────────────────────────────────────────────────────
  const showFlash = (msg, type) => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => { setMessage(""); setMessageType(""); }, 3000);
  };

  // ── validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!newProduct.name?.trim())   e.name     = "Product name is required";
    if (!newProduct.category)       e.category = "Please select a category";
    if (!newProduct.sku?.trim())    e.sku      = "SKU is required";
    if (!newProduct.price || Number(newProduct.price) <= 0)
                                    e.price    = "Price must be greater than 0";
    if (newProduct.quantity === "" || Number(newProduct.quantity) < 0)
                                    e.quantity = "Stock cannot be negative";
    return e;
  };

  const clearError = (field) =>
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  // ── image slots ────────────────────────────────────────────────────────────
  const handleImageChange = (idx, file) => {
    if (!file) return;
    setImageFiles((p)    => { const n = [...p]; n[idx] = file;                      return n; });
    setImagePreviews((p) => { const n = [...p]; n[idx] = URL.createObjectURL(file); return n; });
  };

  const removeImage = (idx) => {
    setImageFiles((p)    => { const n = [...p]; n[idx] = null; return n; });
    setImagePreviews((p) => { const n = [...p]; n[idx] = null; return n; });
  };

  // ── reset ──────────────────────────────────────────────────────────────────
  const resetModal = () => {
    setShowModal(false); setEditMode(false); setSelectedProductId(null);
    setImageFiles([...EMPTY_FILES]); setImagePreviews([...EMPTY_PREVIEWS]);
    setColorTags([]); setErrors({});
    setNewProduct({ ...BLANK_PRODUCT });
  };

  // ── edit ───────────────────────────────────────────────────────────────────
  const handleEdit = (p) => {
    setNewProduct({
      name: p.name, description: p.description || "", category: p.category || "",
      sku: p.sku || "", price: p.price, quantity: p.quantity,
      min_stock: p.min_stock, badge: p.badge || "new",
      model_src: p.model_src || "", model_3d: p.model_3d || "",
      ios_src: p.ios_src || "", able_3d: p.able_3d, able_ar: p.able_ar,
      is_active: p.is_active,
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
    setShowModal(true);
  };

  // ── delete ─────────────────────────────────────────────────────────────────
  const handleDelete = (id) => { setSelectedId(id); setShowWindow(true); };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/api/products/${selectedId}`);
      showFlash(res.data.message, res.data.success ? "success" : "error");
      if (res.data.success) await fetchProducts();
    } catch (err) {
      showFlash(err.response?.data?.detail || "Server error", "error");
    } finally {
      setDeleteLoading(false); setShowWindow(false); setSelectedId(null);
    }
  };

  const cancelDelete = () => { setShowWindow(false); setSelectedId(null); };

  // ── save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaveLoading(true);
    try {
      const fd = new FormData();
      fd.append("name",        newProduct.name);
      fd.append("description", newProduct.description || "");
      fd.append("category",    newProduct.category    || "");
      fd.append("sku",         newProduct.sku);
      fd.append("price",       newProduct.price);
      fd.append("quantity",    newProduct.quantity);
      fd.append("min_stock",   newProduct.min_stock);
      fd.append("model_src",   newProduct.model_src || "");
      fd.append("model_3d",    newProduct.model_3d  || "");
      fd.append("ios_src",     newProduct.ios_src   || "");
      fd.append("able_3d",     newProduct.able_3d);
      fd.append("able_ar",     newProduct.able_ar);
      fd.append("colors",      JSON.stringify(colorTags));
      imageFiles.forEach((file, i) => {
        if (file instanceof File) fd.append(`image_${i + 1}`, file);
      });

      if (editMode) {
        await api.put(`/api/products/${selectedProductId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showFlash("Product updated successfully", "success");
      } else {
        await api.post("/api/products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showFlash("Product created successfully", "success");
      }

      await fetchProducts();
      resetModal();
    } catch (err) {
      console.error(err.response?.data || err);
      showFlash("Something went wrong", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // ── nav ────────────────────────────────────────────────────────────────────
  const stockManagerLinks = [
    { to: "/stock-manager-dash", label: "Dashboard", icon: <LayoutDashboard />, end: true },
    { to: "/stock-manager-dash/inventories", label: "Product's Catalog", icon: <Boxes /> },
    { to: "/stock-manager-dash/ar",          label: "AR/3D Management", icon: <Bot size={18} /> },
    { to: "/stock-manager-dash/deliveries", label: "Delivery", icon: <Truck /> },
    { to: "/stock-manager-dash/returns", label: "Returns", icon: <RotateCcw /> }
  ];

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar openBar={openBar} setOpenBar={setOpenBar} links={stockManagerLinks}
        title="StockManagerCore" subtitle="Enterprise Suite" role="Manager" />

      <main className="flex-1">
        <Header concept="Product's Catalog" />

        <div className="p-6 space-y-5">

          {/* PAGE HEADER */}
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">Manage inventory efficiently and track stock levels.</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition text-sm font-medium cursor-pointer"
            >
              <Plus size={15} /> Add Product
            </button>
          </div>

          {/* FLASH */}
          {message && (
            <div className={`p-3 rounded-lg border-l-4 text-sm font-medium transition-all ${
              messageType === "success"
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
                { key: "color",    options: allColors  },
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
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="all">All Status</option>
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
            <div className="grid grid-cols-7 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-400 tracking-widest uppercase border-b border-gray-100">
              <span>Product</span><span>Category</span><span>SKU</span>
              <span>Stock</span><span>Price</span><span>Status</span><span>Actions</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading products…</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No products found</div>
            ) : (
              filteredProducts.map((p) => {
                const status = getStatus(p.quantity);
                return (
                  <div key={p.id} className="grid grid-cols-7 px-4 py-3 border-t border-gray-50 hover:bg-gray-50 transition items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src={`http://127.0.0.1:8000/${p.image_url}`}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      />
                      <div>
                        <p className="font-medium text-sm text-gray-800 truncate">{p.name}</p>
                        {(p.colors || []).length > 0 && (
                          <div className="flex gap-1 mt-0.5">
                            {(p.colors || []).map((name) => {
                              const preset = PRESET_COLORS.find((c) => c.name === name);
                              return <ColorDot key={name} hex={preset?.hex} />;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 capitalize">{p.category}</span>
                    <span className="text-xs text-gray-400 font-mono">{p.sku || "—"}</span>
                    <span className="text-sm font-medium">{p.quantity}</span>
                    <span className="text-sm font-semibold text-gray-800">${p.price}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full w-fit font-medium ${statusStyle(status)}`}>
                      {status}
                    </span>
                    <div className="flex gap-3 text-gray-300">
                      <button onClick={() => handleEdit(p)} className="hover:text-indigo-500 transition cursor-pointer">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="hover:text-red-500 transition cursor-pointer">
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

            {/* header */}
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
                    {editMode ? "Update product details" : "Fill in the product information"}
                  </p>
                </div>
              </div>
              <button onClick={resetModal}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer">
                <X size={15} />
              </button>
            </div>

            {/* validation banner */}
            {Object.keys(errors).length > 0 && (
              <div className="mx-6 mt-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-700 mb-0.5">Please fix the following errors</p>
                  <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                    {Object.values(errors).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {/* scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

              {/* 3 image slots */}
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

              {/* name */}
              <Field label="Product Name *" icon={Package} error={errors.name}>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={newProduct.name || ""}
                  className={getInputCls(errors, "name")}
                  onChange={(e) => { setNewProduct({ ...newProduct, name: e.target.value }); clearError("name"); }}
                />
              </Field>

              {/* description */}
              <Field label="Description" icon={AlignLeft}>
                <textarea
                  placeholder="Brief product description…"
                  value={newProduct.description || ""}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-50 text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </Field>

              {/* category + sku */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category *" icon={Tag} error={errors.category}>
                  <select
                    value={newProduct.category || ""}
                    className={getInputCls(errors, "category")}
                    onChange={(e) => { setNewProduct({ ...newProduct, category: e.target.value }); clearError("category"); }}>
                    <option value="">Select…</option>
                    <option value="sofas">Sofas</option>
                    <option value="tables">Tables</option>
                    <option value="lightings">Lightings</option>
                    <option value="chairs">Chairs</option>
                    <option value="mirrors">Mirrors</option>
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

              {/* colors */}
              <Field label="Colors" icon={Palette}>
                <ColorPicker selected={colorTags} onChange={setColorTags} />
              </Field>

              {/* price + stock */}
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

            {/* footer */}
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
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {editMode ? "Updating…" : "Creating…"}
                  </>
                ) : editMode
                  ? <><Pencil size={14} /> Update Product</>
                  : <><Plus   size={14} /> Create Product</>
                }
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRM ───────────────────────────────────────────────────── */}
      {showWindow && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cancelDelete} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-[360px] overflow-hidden">
            <div className="h-1 w-full bg-red-500" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Delete Product</h2>
                  <p className="text-xs text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6 pl-[52px]">
                Are you sure you want to permanently delete this product from the catalog?
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={cancelDelete} disabled={deleteLoading}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 transition cursor-pointer disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={confirmDelete} disabled={deleteLoading}
                  className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition cursor-pointer flex items-center gap-2 disabled:opacity-50">
                  {deleteLoading ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Deleting…
                    </>
                  ) : <><Trash2 size={14} /> Delete</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}