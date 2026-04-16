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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 via-white to-purple-50">
        <span className="material-symbols-outlined text-5xl text-purple-500 animate-pulse">
          favorite
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 text-gray-800">

      <main className="max-w-7xl mx-auto px-6 pt-10 pb-32">

        {/* HEADER */}
        <div className="mb-10">
          <h2 className="text-5xl font-bold text-purple-700">
            Your Favorites
          </h2>
          <p className="text-gray-500 mt-2">
            A curated gallery of your saved pieces.
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex gap-3 mb-10 overflow-x-auto">

          <button className="px-5 py-2 bg-purple-600 text-white rounded-full">
            All Saved
          </button>

          <button className="px-5 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200">
            Seating
          </button>

          <button className="px-5 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200">
            Lighting
          </button>

          <button className="px-5 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200">
            Eccentricities
          </button>
        </div>

        {/* EMPTY STATE */}
        {favorites.length === 0 ? (
          <div className="text-center py-24">
            <h3 className="text-2xl font-bold mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-500 mb-6">
              Save pieces you love and they'll appear here.
            </p>

            <Link
              to="/furniture"
              className="px-8 py-4 bg-purple-600 text-white rounded-full hover:bg-purple-700"
            >
              Browse Furniture
            </Link>
          </div>
        ) : (
          /* PINTEREST STYLE */
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8">

            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="inline-block w-full break-inside-avoid mb-8 bg-white/70 backdrop-blur-md border border-purple-100 rounded-xl p-6 shadow-sm hover:shadow-[0_10px_30px_rgba(147,51,234,0.2)] transition"
              >

                {/* REMOVE BUTTON */}
                <button
                  onClick={() => removeFavorite(fav.id)}
                  className="absolute top-4 right-4 w-10 h-10 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center text-purple-600"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </button>

                {/* IMAGE */}
                <Link to={`/product/${fav.product_id}`}>
                  <div className="rounded-xl overflow-hidden mb-4 min-h-[240px] flex items-center justify-center bg-purple-50">
                    {fav.product?.image_url ? (
                      <img
                        src={fav.product.image_url}
                        alt={fav.product?.name}
                        className="w-full h-full object-cover hover:scale-[1.03] transition"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-5xl text-purple-300">
                        chair
                      </span>
                    )}
                  </div>
                </Link>

                {/* INFO */}
                <Link to={`/product/${fav.product_id}`}>
                  <h3 className="text-xl font-bold text-gray-800">
                    {fav.product?.name}
                  </h3>

                  <p className="text-gray-500 text-sm">
                    {fav.product?.brand ?? "ARoomX"}
                  </p>

                  <p className="text-purple-600 font-bold mt-1">
                    {fav.product?.price} DA
                  </p>
                </Link>

                {/* BUTTON */}
                <button className="mt-5 w-full py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 active:scale-95 transition">
                  Add to Bag
                </button>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}