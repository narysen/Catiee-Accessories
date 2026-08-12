import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ShoppingBag({ cart, setCart, isOpen, onClose }) {
  const navigate = useNavigate();

  // Handle incrementing or decrementing item quantities
  const updateQuantity = (id, delta) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id) {
          const currentQty = item.quantity || 1;
          const newQty = currentQty + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean); // Remove items if quantity drops below 1
    });
  };

  // Handle removing an item completely
  const removeItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Calculate subtotal safely (handles both numbers and string prices with '$')
  const subtotal = cart.reduce((sum, item) => {
    let priceNum = item.price;
    if (typeof priceNum === 'string') {
      priceNum = parseFloat(priceNum.replace(/[^0-9.-]+/g, ""));
    }
    const qty = item.quantity || 1;
    return sum + (isNaN(priceNum) ? 0 : priceNum * qty);
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between p-6">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-extrabold text-gray-900">Preview Items</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm font-medium">
                  Your shopping bag is empty.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50/60 rounded-2xl border border-gray-100 items-center">
                    <img 
                      src={item.image || item.img} 
                      alt={item.name || item.title} 
                      className="w-16 h-16 object-cover rounded-xl border border-gray-200" 
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name || item.title}</h4>
                      <span className="text-pink-600 font-semibold text-xs mt-0.5 block">
                        {typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : item.price}
                      </span>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-2xs">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2.5 py-0.5 text-gray-600 hover:bg-gray-100 rounded-l-lg cursor-pointer text-xs"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-800">{item.quantity || 1}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2.5 py-0.5 text-gray-600 hover:bg-gray-100 rounded-r-lg cursor-pointer text-xs"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-gray-400 hover:text-red-500 font-medium transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Subtotal & Checkout */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Subtotal:</span>
              <span className="text-pink-600 font-extrabold text-base">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Delivery fee ($1.50) will included.</p>
            
            <button 
              onClick={() => {
                onClose();
                navigate('/cart');
              }}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3.5 rounded-2xl transition text-sm shadow-sm cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}