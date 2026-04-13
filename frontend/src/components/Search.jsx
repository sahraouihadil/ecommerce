/**
 * Search.jsx - Product Search Component
 * ========================================
 * Provides a search bar that lets users find furniture products by keyword.
 *
 * HOW IT WORKS:
 *   1. User types a keyword and clicks "Search" (or presses Enter)
 *   2. Sends GET /search?keyword=... to the backend
 *   3. Backend searches product names and descriptions
 *   4. Results are displayed as a simple list below the search bar
 *
 * USED IN: HomePage.jsx (the "Our Collection" section)
 */

import React, { useState } from 'react';
import api from '../services/api';

export function Search() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (event) => {
    if (event) event.preventDefault();

    try {
      const response = await api.get("/search", { params: { keyword } });
      setResults(response.data);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Search for furniture..." onChange={(e) => setKeyword(e.target.value)} className="border p-2 rounded" />
        <button type="submit" className="bg-blue-500 text-white p-2 ml-2 rounded">Search</button>
      </form>

      <div className="results-grid mt-4">
        {results.length > 0 ? (
          results.map((product) => (
            <div key={product.id} className="border p-4 mb-2">
              <h3>{product.name}</h3>
              <p>{product.price} DA</p>
            </div>
          ))
        ) : (
          keyword && results.length === 0 ? <p>No products found.</p> : null
        )}
      </div>
    </div>
  );
}
