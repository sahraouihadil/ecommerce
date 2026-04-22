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
const BASE = "http://127.0.0.1:8000";
const img  = (path) => (path ? `${BASE}/${path}` : null);

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent2 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm">Loading favorites...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream text-text">
      <main className="max-w-7xl mx-auto px-6 pt-36 pb-32">

        <p className="text-[0.8125rem] uppercase tracking-[0.2em] font-semibold text-muted mb-4">Saved</p>
        <h1 className="font-serif font-bold text-5xl tracking-tight mb-16">
          Favorites
        </h1>

        {favorites.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-[48px] text-accent2/50 mb-4 block">favorite</span>
            <p className="text-muted text-lg mb-6">No saved pieces yet.</p>
            <Link to="/furniture" className="btn-pill btn-pill-black">
              Browse the Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((fav) => (
              <div key={fav.id} className="group relative">
                {/* Remove button */}
                <button
                  onClick={() => removeFavorite(fav.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center
                    text-muted hover:text-danger transition-colors duration-300 bg-white/80 rounded-full"
                  aria-label="Remove from favorites"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>

                <Link to={`/product/${fav.product_id}`}
                  className="block bg-white rounded-lg overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                  <div className="aspect-[3/4] bg-surface overflow-hidden">
                    {fav.product?.image_url ? (
                      <img
                      src={img(fav.product.image_url)}
                      alt={fav.product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
    
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[48px] text-muted/20">image</span>
                      </div>
                    )}
                  </div>
                  <div className="px-5 pt-5 pb-6">
                    <h3 className="font-serif text-lg text-primary leading-snug mb-2
                      group-hover:text-accent2 transition-colors duration-300">
                      {fav.product?.name}
                    </h3>
                    <p className="font-serif font-semibold text-primary text-lg">
                      {fav.product?.price} DA
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
