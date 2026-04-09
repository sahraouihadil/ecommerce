import React, { useState } from 'react';
import axios from 'axios';

export function Search(){
  const [keyword,setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (event) =>{
   if (event) event.preventDefault();
   console.log("Searching for:",keyword);

   try{
    const response = await axios.get(`http://127.0.0.1:8000/search?keyword=${keyword}`);

    setResults(response.data);
   }catch(error){
    console.error("Error during search:",error);
   }
  };

  return(
    <div className='search-container'>
      <form onSubmit={handleSearch}>
        <input type="text" placeholder='Search for furniture.... ' onChange={(e)=>(setKeyword(e.target.value))} className='border p-2 rounded' />
        <button type='submit' className='bg-blue-500 text-white p-2 ml-2 rounded'>Search</button>
      </form>

      {/* results */}
      <div className="results-grid mt-4">
        {results.length > 0 ? (
          results.map((product) => (
            <div key={product.id} className="border p-4 mb-2">
              <h3>{product.name}</h3>
              <p>{product.price} DA</p>
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  )

}