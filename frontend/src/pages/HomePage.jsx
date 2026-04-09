import axios from 'axios';
import React, {useEffect,useState} from 'react';
import { Search } from '../component/Search';

export function HomePage(){
   const [products,setProducts] = useState([]);
   const [loading,setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/').then(response =>{
      setProducts(response.data.products || []);
      setLoading(false);
    })
    .catch(error => {
      console.error("Error fetching furniture:", error);
      setLoading(false);
    });
  },[])
 return (
    <div className="p-8">
      <h1 className="text-3xl font-bold underline mb-8 text-center">
        Furniture Store - Home Page
      </h1>
      <Search/>
      {loading ? (
        <p className="text-center">Loading furniture...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((item) => (
            <div key={item.id} className="border p-4 rounded-lg shadow-md hover:shadow-xl transition">
              <img 
                src={item.image || "https://via.placeholder.com/150"} 
                alt={item.name} 
                className="w-full h-48 object-cover rounded-md"
              />
              <h2 className="text-xl font-semibold mt-4">{item.name}</h2>
              <p className='text-2xl'>{item.description}</p>
              <p className="text-gray-600">{item.price} DA</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}