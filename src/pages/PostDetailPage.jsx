import React, { useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import AuthPopup from '../components/AuthPopup';

export default function PostDetailPage({ products = [], addToCart, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Safely ensure products is an array
  const safeProducts = Array.isArray(products) ? products : [];

  const productFromState = location.state?.product;
  const product = productFromState || safeProducts.find((p) => String(p.id) === String(id));

  const [authErrorPopup, setAuthErrorPopup] = useState(false);

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Product not found.</p>
        <button onClick={() => navigate('/shop')} className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg">
          Back to Shop
        </button>
      </div>
    );
  }

  const productImage = product.img || product.image || product.imgUrl || product.imageUrl || product.thumbnail || '';

  const relatedProducts = safeProducts.filter(
    (item) => item.cat === product.cat && String(item.id) !== String(product.id)
  ).slice(0, 4);

  const handleAddToCart = () => {
    if (!user) {
      setAuthErrorPopup(true);
      return;
    }
    if (addToCart) {
      addToCart(product);
    }
  };

  const handleQuickAddToCart = (e, item) => {
    e.preventDefault(); // Prevents clicking the card link from navigating away
    if (!user) {
      setAuthErrorPopup(true);
      return;
    }
    if (addToCart) {
      addToCart(item);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 min-h-screen relative space-y-12">
      <div>
        <button onClick={() => navigate(-1)} className="mb-6 text-sm font-semibold text-pink-600 hover:underline">
          &larr; Back
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100">
            {productImage ? (
              <img src={productImage} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">No Image Available</span>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <p className="text-2xl font-black text-[#ff2d88] mt-4">{product.price}</p>
            <p className="text-sm text-gray-500 mt-2">Category: {product.cat}</p>
            <p className="text-sm text-gray-400 mt-1">{product.reviews || '80 sold'}</p>
            <button 
              onClick={handleAddToCart}
              className="mt-8 w-full bg-[#ff2d88] hover:bg-[#e02577] text-white font-bold py-4 px-6 rounded-full transition shadow-md text-center text-base tracking-wide cursor-pointer"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">You Might Also Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((item) => {
              const itemImage = item.img || item.image || item.imgUrl || item.imageUrl || item.thumbnail || '';
              return (
                <div key={item.id} className="group flex flex-col overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm transition hover:shadow-lg">
                  <Link 
                    to={`/product/${item.id}`} 
                    state={{ product: item }} 
                    className="aspect-square w-full overflow-hidden bg-gray-50 relative"
                  >
                    <img src={itemImage} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </Link>
                  <div className="flex flex-grow flex-col p-4 justify-between space-y-3">
                    <div>
                      <Link to={`/product/${item.id}`} state={{ product: item }}>
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                        <span className="text-xs font-semibold text-[#ff2d88] mt-1 block">{item.price}</span>
                      </Link>
                    </div>
                    <button
                      onClick={(e) => handleQuickAddToCart(e, item)}
                      className="w-full bg-pink-50 hover:bg-pink-100 text-[#ff2d88] font-semibold py-3 px-4 rounded-xl transition text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer"
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
        </div>
      )}

      {/* Reusable Authentication Required Popup Modal */}
      <AuthPopup 
        show={authErrorPopup} 
        onClose={() => setAuthErrorPopup(false)} 
      />
    </main>
  );
}