/**
 * FavoritePage.jsx - User's Favorites/Wishlist
 * ================================================
 * Displays products the user has saved as favorites.
 *   - Each card shows product name + price with a link to the product page
 *   - "Remove" button to unfavorite a product
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

  useEffect(() => { fetchFavorites(); }, []);

  const removeFavorite = async (favId) => {
    try {
      await api.delete(`/api/favorites/${favId}`);
      fetchFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-surface font-body">
      <div className="flex flex-col items-center gap-4 text-on-surface-variant">
        <span className="material-symbols-outlined text-5xl text-primary animate-bounce-subtle">favorite</span>
        <p className="font-label font-medium text-lg">Loading favorites...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">

      {/* ── Top Navigation ── */}
      <header className="w-full sticky top-0 z-50 flex justify-between items-center px-6 py-4 bg-surface-container-low">
        <div className="flex items-center gap-4">
          <button className="hover:bg-surface-container transition-colors p-2 rounded-full active:scale-95 duration-200">
            <span className="material-symbols-outlined text-primary">menu</span>
          </button>
          <h1 className="text-2xl font-black tracking-tighter text-primary font-headline">ARoomX</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container">
            <img
              alt="User"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAfLm_tCMuMcyNm4b6mdYxH2P0ufBBXO5nLjvRd4dCmSYedtVNtvmK-_XtXrkfI3HyaxLf1fs3yxnWytltZmvlPSCl8G2vkl8mKpOE5P6D5cmZbw50Q6DEM2C4VJ9xo0_BnKiXGX0fuQ427gIRXrVYG2TrbFi32Q-6VGaWwDH1k6N_dQyvFG1CpL_k9YcxMpT66nYvnURMvlOvMCubJVT2H2kbZ_tzlC3uG8S46wpLNd5pp_yycYfEyysQEWGthnPhGqGUtbg1R8s"
            />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-6 pt-8 pb-32">

        {/* Editorial Header */}
        <div className="mb-12">
          <h2 className="font-headline font-bold text-5xl tracking-tight text-on-surface mb-2">Your Favorites</h2>
          <p className="text-on-surface-variant text-lg">A curated gallery of your saved pieces.</p>
        </div>

        {/* ── Empty State ── */}
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span
              className="material-symbols-outlined text-8xl text-primary-container mb-6"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            <h3 className="font-headline font-bold text-3xl text-on-surface mb-3">No favorites yet</h3>
            <p className="text-on-surface-variant text-lg mb-8 max-w-sm">
              Start saving pieces you love and they'll appear here.
            </p>
            <Link
              to="/furniture"
              className="px-10 py-4 bg-primary text-on-primary rounded-full font-semibold text-lg hover:bg-primary-dim transition-colors"
            >
              Browse Furniture
            </Link>
          </div>
        ) : (
          /* ── Favorites Grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="group relative bg-surface-container-lowest rounded-xl p-6 shadow-[0px_20px_40px_rgba(45,47,48,0.06)] transition-all hover:-translate-y-2"
              >
                {/* Remove / Unfavorite button */}
                <div className="absolute top-8 right-8 z-10">
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-error active:scale-90 transition-transform"
                    aria-label="Remove from favorites"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>

                {/* Product image / placeholder */}
                <Link to={`/product/${fav.product_id}`}>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-surface-container-lowest to-primary-container/10 mb-6 flex items-center justify-center overflow-hidden">
                    {fav.product?.image ? (
                      <img
                        src={fav.product.image}
                        alt={fav.product?.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-6xl text-primary-container">chair</span>
                    )}
                  </div>

                  {/* Name & Price */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline font-bold text-xl text-on-surface">
                        {fav.product?.name}
                      </h3>
                      <p className="text-on-surface-variant text-sm font-medium">
                        {fav.product?.brand ?? "ARoomX"}
                      </p>
                    </div>
                    <span className="font-headline font-bold text-lg text-primary whitespace-nowrap">
                      {fav.product?.price} DA
                    </span>
                  </div>
                </Link>

                {/* Add to Bag CTA */}
                <button className="mt-6 w-full py-4 bg-primary text-on-primary rounded-full font-semibold hover:bg-primary-dim transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">shopping_bag</span>
                  Add to Bag
                </button>
              </div>
            ))}

            {/* Inspiration bento card (always shown alongside results) */}
            <div className="sm:col-span-2 lg:col-span-3 bg-secondary-container rounded-xl p-10 flex flex-col justify-center items-center text-center overflow-hidden relative">
              <div className="absolute -bottom-10 -right-10 opacity-20 rotate-12">
                <span className="material-symbols-outlined text-[12rem]">auto_stories</span>
              </div>
              <h3 className="font-headline font-black text-3xl text-on-secondary-container mb-4">Want more oddity?</h3>
              <p className="text-on-secondary-container max-w-md text-lg mb-8 leading-relaxed">
                Check out our latest Journal entries on unconventional living spaces.
              </p>
              <button className="px-10 py-4 bg-on-secondary-container text-secondary-container rounded-full font-bold text-lg hover:scale-105 transition-transform">
                Read Journal
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-8 bg-white/80 backdrop-blur-xl shadow-[0px_-10px_40px_rgba(45,47,48,0.06)]">
        <button className="flex flex-col items-center justify-center text-zinc-400 px-4 py-2 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">storefront</span>
          <span className="font-label font-medium text-[10px] tracking-wide">Shop</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-400 px-4 py-2 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">auto_stories</span>
          <span className="font-label font-medium text-[10px] tracking-wide">Journal</span>
        </button>
        {/* Active — Favorites */}
        <button className="flex flex-col items-center justify-center bg-primary text-on-primary rounded-full px-5 py-2 scale-105 animate-bounce-subtle">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
          <span className="font-label font-medium text-[10px] tracking-wide">Favorites</span>
        </button>
        <Link to="/orders" className="flex flex-col items-center justify-center text-zinc-400 px-4 py-2 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">package_2</span>
          <span className="font-label font-medium text-[10px] tracking-wide">Orders</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center justify-center text-zinc-400 px-4 py-2 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">person</span>
          <span className="font-label font-medium text-[10px] tracking-wide">Profile</span>
        </Link>
      </nav>

      {/* ── FAB ── */}
      <div className="fixed bottom-24 right-6 md:right-12 z-40">
        <button className="w-16 h-16 bg-tertiary-container text-on-tertiary-container rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform group">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-45 transition-transform">add</span>
        </button>
      </div>
    </div>
  );
}