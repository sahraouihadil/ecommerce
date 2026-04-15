/**
 * FavoritePage.jsx - User's Favorites/Wishlist
 * ================================================
 * Displays products the user has saved as favorites.
 *   - Each card shows product name + price with a link to the product page
 *   - Heart button removes the product from favorites
 *   - Shows "No favorites yet" with a browse link if empty
 *
 * API ENDPOINTS USED:
 *   GET    /api/favorites          - Fetch user's favorites
 *   DELETE /api/favorites/:favId   - Remove from favorites
 */

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export function FavoritePage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    try {
      const res = await api.get("/api/favorites");
      setFavorites(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (favId) => {
    try {
      await api.delete(`/api/favorites/${favId}`);
      fetchFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f6f8]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-[#6448b2] animate-pulse">
            favorite
          </span>
          <p className="text-[#5b5b5d] font-medium">Loading your favorites…</p>
        </div>
      </div>
    );
  }

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <>
      {/* Bounce animation for active nav tab */}
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0) scale(1.05); }
          50%       { transform: translateY(-4px) scale(1.05); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2s infinite; }
      `}</style>

      <div className="bg-[#f7f6f8] text-[#2d2f30] min-h-screen">

        {/* ── Main Content ── */}
        <main className="max-w-7xl mx-auto px-6 pt-8 pb-32">

          {/* Editorial Header */}
          <div className="mb-12">
            <h2 className="font-bold text-5xl tracking-tight text-[#2d2f30] mb-2">
              Your Favorites
            </h2>
            <p className="text-[#5b5b5d] text-lg">
              A curated gallery of your saved oddities and future heirlooms.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-3 mb-10 overflow-x-auto pb-4">
            <button className="px-6 py-3 bg-[#6448b2] text-[#f7f0ff] rounded-full font-semibold text-sm scale-105 transition-all whitespace-nowrap">
              All Saved
            </button>
            <button className="px-6 py-3 bg-[#f1f0f3] text-[#5b5b5d] rounded-full font-semibold text-sm hover:bg-[#e2e2e5] transition-all whitespace-nowrap">
              Seating
            </button>
            <button className="px-6 py-3 bg-[#f1f0f3] text-[#5b5b5d] rounded-full font-semibold text-sm hover:bg-[#e2e2e5] transition-all whitespace-nowrap">
              Lighting
            </button>
            <button className="px-6 py-3 bg-[#f1f0f3] text-[#5b5b5d] rounded-full font-semibold text-sm hover:bg-[#e2e2e5] transition-all whitespace-nowrap">
              Eccentricities
            </button>
          </div>

          {/* ── Empty State ── */}
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-[6rem] text-[#adadaf] mb-6">
                heart_broken
              </span>
              <h3 className="font-bold text-2xl text-[#2d2f30] mb-2">
                No favorites yet
              </h3>
              <p className="text-[#5b5b5d] mb-8 max-w-xs">
                Save pieces that speak to you and they'll live here.
              </p>
              <Link
                to="/furniture"
                className="px-10 py-4 bg-[#6448b2] text-[#f7f0ff] rounded-full font-bold text-lg hover:bg-[#583ba5] transition-colors"
              >
                Browse Furniture
              </Link>
            </div>
          ) : (
            /* ── Favorites Grid ── */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favorites.map((fav, index) => (
                <div
                  key={fav.id}
                  className={`group relative rounded-xl p-6 transition-all duration-300 hover:-translate-y-2 ${index % 2 === 0
                    ? "bg-white shadow-[0px_20px_40px_rgba(45,47,48,0.06)]"
                    : "bg-[#f1f0f3] hover:bg-white hover:shadow-[0px_20px_40px_rgba(45,47,48,0.06)]"
                    }`}
                >
                  {/* Remove (Heart) Button */}
                  <div className="absolute top-8 right-8 z-10">
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      title="Remove from favorites"
                      className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-[#b41340] active:scale-90 transition-transform hover:bg-white"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                    </button>
                  </div>

                  {/* Product Image */}
                  <Link to={`/product/${fav.product_id}`}>
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-white to-[#ab8ffe]/10 mb-6 flex items-center justify-center overflow-hidden">
                      {fav.product?.image_url ? (
                        <img
                          src={fav.product.image_url}
                          alt={fav.product?.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-6xl text-[#adadaf]">
                          chair
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <Link to={`/product/${fav.product_id}`} className="block">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xl text-[#2d2f30] group-hover:text-[#6448b2] transition-colors">
                          {fav.product?.name}
                        </h3>
                        <p className="text-[#5b5b5d] text-sm font-medium">
                          {fav.product?.brand ?? "ARoomX"}
                        </p>
                      </div>
                      <span className="font-bold text-lg text-[#6448b2]">
                        {fav.product?.price} DA
                      </span>
                    </div>
                  </Link>

                  {/* CTA */}
                  <button className="mt-6 w-full py-4 bg-[#6448b2] text-[#f7f0ff] rounded-full font-semibold hover:bg-[#583ba5] transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">shopping_bag</span>
                    Add to Bag
                  </button>
                </div>
              ))}

              {/* Inspiration Bento Card */}
              <div className="lg:col-span-2 bg-[#fed01b] rounded-xl p-10 flex flex-col justify-center items-center text-center overflow-hidden relative">
                <div className="absolute -bottom-10 -right-10 opacity-20 rotate-12">
                  <span className="material-symbols-outlined text-[12rem]">auto_stories</span>
                </div>
                <h3 className="font-black text-3xl text-[#594700] mb-4">
                  Want more oddity?
                </h3>
                <p className="text-[#594700] max-w-md text-lg mb-8 leading-relaxed">
                  Check out our latest Journal entries on unconventional living
                  spaces and curate your next favorite.
                </p>
                <button className="px-10 py-4 bg-[#594700] text-[#fed01b] rounded-full font-bold text-lg hover:scale-105 transition-transform">
                  Read Journal
                </button>
              </div>
            </div>
          )}
        </main>


      </div>
    </>
    //coment to pushh////////////////////////////
  );
}