import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPopup from '../components/AuthPopup';
import { getImageUrl } from '../utils/imageUtils';

export default function ProductCard({ product, addToCart, user }) {
  const [authErrorPopup, setAuthErrorPopup] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!user) {
      setAuthErrorPopup(true);
      return;
    }
    // Adds item silently to the cart without showing any text toast
    addToCart({
      id: product.id,
      name: product.title || product.name,
      price: product.price,
      image: product.img || product.image,
      quantity: 1
    });
  };

  const rawImage = product.img || product.image || '';
  const imageSrc = getImageUrl(rawImage);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm transition hover:shadow-lg">
      <Link to={`/product/${product.id}`} state={{ product }} className="aspect-square w-full overflow-hidden bg-gray-50 relative">
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white">
            {product.badge}
          </span>
        )}
        <img src={imageSrc} alt={product.title || product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </Link>
      
      <div className="flex flex-grow flex-col p-5">
        <Link to={`/product/${product.id}`} state={{ product }}>
          <h3 className="text-md font-bold text-gray-900 line-clamp-1">{product.title || product.name}</h3>
          <span className="text-sm font-semibold text-pink-600 mt-1 block">
            {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : product.price}
          </span>
        </Link>
        <button 
          onClick={handleAddToCart}
          className="mt-4 w-full rounded-lg bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 text-sm font-medium transition shadow-sm cursor-pointer"
        >
          Add to Cart
        </button>
      </div>

      {/* Authentication Required Popup Modal */}
      {authErrorPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fadeIn p-4"
          onClick={() => setAuthErrorPopup(false)}
        >
          <div 
            className="bg-white text-gray-900 p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-4 max-w-sm w-full border border-gray-100 transform animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner">
              ✕
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-gray-900">Authentication Required</h4>
              <p className="text-xs text-gray-500 font-medium px-2">Please log in or sign up before adding items to your cart.</p>
            </div>
            <div className="flex items-center gap-3 w-full pt-2">
              <button 
                onClick={() => setAuthErrorPopup(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 rounded-xl transition text-xs shadow-sm cursor-pointer"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}