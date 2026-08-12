import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebaseClients';
import { collection, getDocs } from 'firebase/firestore';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-500 font-medium text-sm animate-pulse">Loading products from Firebase...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition hover:shadow-lg relative">
            {product.badge && (
              <span className="absolute top-3 left-3 z-10 rounded-full bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white">
                {product.badge}
              </span>
            )}
            
            <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
              <img 
                src={product.img || product.image} 
                alt={product.title} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            </div>

            <div className="flex flex-grow flex-col justify-between p-5 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{product.title}</h3>
              <div className="flex justify-between items-center">
                <span className="text-base font-black text-[#ff2d88]">{product.price}</span>
                <span className="text-gray-400 text-xs">{product.reviews || '80 sold'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}