import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthPopup from '../components/AuthPopup';

export default function ShopPage({ products = [], addToCart, user }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [authErrorPopup, setAuthErrorPopup] = useState(false);

  // Sync search query whenever the URL query params change (from Navbar search)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryParam = params.get('search');
    if (queryParam) {
      setSearchQuery(queryParam);
    } else {
      setSearchQuery('');
    }
  }, [location.search]);

  // Helper to fix image paths for GitHub Pages subpath vs local (supports Base64 & external URLs)
  const getImageUrl = (imgPath) => {
    if (!imgPath) return '';
    if (
      imgPath.startsWith('data:image/') || 
      imgPath.startsWith('http://') || 
      imgPath.startsWith('https://')
    ) {
      return imgPath;
    }
    // Clean leading slashes and append Vite BASE_URL
    const cleanPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
    return `${import.meta.env.BASE_URL}${cleanPath}`;
  };

  // Ensure products is a valid array and filter out any dummy logo placeholders if needed
  const safeProducts = Array.isArray(products) ? products : [];

  // Filter products based on search input (checks title or category)
  const filteredProducts = safeProducts.filter(item => {
    // Optional: skip items that are just the site logo/banner if they accidentally got into products list
    if (item.img === '/Catie.png' || item.image === '/Catie.png') return false;

    const query = searchQuery.toLowerCase();
    const title = item.title?.toLowerCase() || '';
    const category = item.cat?.toLowerCase() || item.category?.toLowerCase() || '';
    return title.includes(query) || category.includes(query);
  });

  const handleQuickAddToCart = (e, item) => {
    e.preventDefault(); // Prevents card link navigation when clicking the button
    if (!user) {
      setAuthErrorPopup(true);
      return;
    }
    if (addToCart) {
      addToCart(item);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 min-h-screen space-y-8 relative">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop All Accessories'}
        </h1>
        <p className="text-sm text-gray-500">
          {searchQuery ? `Found ${filteredProducts.length} matching item(s)` : 'Explore our collection of stylish pieces for every look.'}
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm font-medium">No products found matching "{searchQuery}".</p>
          <Link 
            to="/shop"
            onClick={() => setSearchQuery('')}
            className="mt-4 inline-block text-xs font-bold text-pink-600 hover:underline"
          >
            Clear search & view all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((item) => {
            const rawImage = item.img || item.image || item.imgUrl || item.imageUrl || item.thumbnail || '';
            const itemImage = getImageUrl(rawImage);
            
            return (
              <div 
                key={item.id} 
                className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition hover:shadow-lg"
              >
                <Link 
                  to={`/product/${item.id}`} 
                  state={{ product: item }} 
                  className="aspect-square w-full overflow-hidden bg-gray-50 relative"
                >
                  {itemImage ? (
                    <img 
                      src={itemImage} 
                      alt={item.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                  )}
                </Link>

                <div className="flex flex-grow flex-col justify-between p-5 space-y-4">
                  <div className="space-y-1.5">
                    <Link to={`/product/${item.id}`} state={{ product: item }}>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-1 hover:text-pink-600 transition">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-base font-black text-pink-600">{item.price}</p>
                  </div>

                  <button
                    onClick={(e) => handleQuickAddToCart(e, item)}
                    className="w-full bg-pink-50 hover:bg-pink-500 text-pink-600 hover:text-white font-semibold py-2.5 px-4 rounded-xl transition text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Authentication Required Popup Modal */}
      <AuthPopup 
        show={authErrorPopup} 
        onClose={() => setAuthErrorPopup(false)} 
      />
    </main>
  );
}