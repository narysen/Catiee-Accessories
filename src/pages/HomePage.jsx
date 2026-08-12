import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthPopup from '../components/AuthPopup';

export default function HomePage({ products = [], addToCart, user }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [authErrorPopup, setAuthErrorPopup] = useState(false);

  // Sync search query from the URL if a user navigates with a search parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryParam = params.get('search');
    if (queryParam) {
      setSearchQuery(queryParam);
    } else {
      setSearchQuery('');
    }
  }, [location.search]);

  // Automatically scroll to the top of the page when search query changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchQuery]);

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
    const cleanPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
    return `${import.meta.env.BASE_URL}${cleanPath}`;
  };

  const filteredProducts = searchQuery.trim() === '' 
    ? products.slice(0, 4) 
    : products.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.cat?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleAddToCartClick = (item) => {
    if (!user) {
      setAuthErrorPopup(true);
      return;
    }
    if (addToCart) {
      addToCart(item);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <header className="bg-white py-20 min-h-[70vh] flex items-center">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
          <div className="flex flex-col gap-5 max-w-xl flex-1">
            <span className="text-pink-600 font-semibold tracking-widest uppercase text-3xl md:text-5xl">
              Welcome to Catie
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
              Catie Accessories - Shine Your Style
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              The Best Jewelry And Accessories For Every Occasion.
            </p>

            <div className="flex gap-4 mt-2">
              <Link to="/shop" className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                Shop Now
              </Link>
              <Link to="/about" className="border border-pink-400 text-pink-600 px-6 py-3 rounded-lg hover:bg-pink-50 transition">
                Learn More
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            {/* Fixed static logo asset path */}
            <img 
              src={`${import.meta.env.BASE_URL}Catie.png`} 
              alt="Catie Logo" 
              className="w-full max-w-md rounded-[30px] object-cover" 
            />
          </div>
        </div>
      </header>

      {/* Featured / Search Results Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Accessories'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {searchQuery ? `Found ${filteredProducts.length} matching item(s)` : 'Check out some of our most popular styles'}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No products found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
            {filteredProducts.map((item) => {
              const rawImage = item.img || item.image || item.imgUrl || item.imageUrl || item.thumbnail || '';
              const itemImage = getImageUrl(rawImage);

              return (
                <div key={item.id} className="group flex flex-col overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm transition hover:shadow-lg">
                  <Link to={`/product/${item.id}`} state={{ product: item }} className="aspect-square w-full overflow-hidden bg-gray-50 relative">
                    {item.badge && <span className="absolute top-3 left-3 z-10 rounded-full bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white">{item.badge}</span>}
                    <img src={itemImage} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </Link>
                  <div className="flex flex-grow flex-col p-5 justify-between space-y-4">
                    <div>
                      <Link to={`/product/${item.id}`} state={{ product: item }}>
                        <h3 className="text-md font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                        <span className="text-sm font-semibold text-pink-600 mt-1 block">{item.price}</span>
                      </Link>
                    </div>
                    {addToCart && (
                      <button 
                        onClick={() => handleAddToCartClick(item)}
                        className="w-full bg-pink-50 hover:bg-pink-100 text-pink-600 font-semibold py-3 px-4 rounded-xl transition text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/shop" className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-lg transition">
            View All Products in Shop
          </Link>
        </div>
      </section>

      <AuthPopup 
        show={authErrorPopup} 
        onClose={() => setAuthErrorPopup(false)} 
      />
    </div>
  );
}