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

  if (loading) return <div className="text-center mt-10">Loading favorites...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Favorites</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No favorites yet</p>
          <Link to="/furniture" className="bg-black text-white px-6 py-2 rounded-lg">Browse Furniture</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-white shadow rounded-lg p-4">
              <Link to={`/product/${fav.product_id}`}>
                <h3 className="font-semibold">{fav.product?.name}</h3>
                <p className="text-gray-500">{fav.product?.price} DA</p>
              </Link>
              <button onClick={() => removeFavorite(fav.id)} className="text-red-500 text-sm mt-2">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
