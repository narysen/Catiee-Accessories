import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebaseClients';
import { doc, getDoc } from 'firebase/firestore';

export default function Cart({ cart, setCart, user }) {
  const [shippingName, setShippingName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedCoords] = useState({ lat: 11.5564, lng: 104.9282 }); // Default Phnom Penh
  const [geocoding, setGeocoding] = useState(false);
  
  const [modal, setModal] = useState({ show: false, title: '', message: '', type: 'success', onConfirm: null });
  const navigate = useNavigate();

  // Auto-load user profile details (Name, Phone, Address) from Firestore upon login
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setShippingName(user.displayName || user.email?.split('@')[0] || '');
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("Firestore User Data Loaded:", userData);

            if (userData.name || userData.fullName) setShippingName(userData.name || userData.fullName);
            if (userData.phone) setPhone(userData.phone);
            
            const savedAddress = userData.address || userData.shippingAddress || userData.location;
            if (savedAddress) {
              setAddress(savedAddress);
            }
          } else {
            console.log("No user document found in Firestore for UID:", user.uid);
          }
        } catch (error) {
          console.error("Error fetching user profile data:", error);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const subtotal = cart.reduce((sum, item) => {
    let priceNum = item.price;
    if (typeof priceNum === 'string') {
      priceNum = parseFloat(priceNum.replace(/[^0-9.-]+/g, ""));
    }
    const qty = item.quantity || 1;
    return sum + (isNaN(priceNum) ? 0 : priceNum * qty);
  }, 0);

  const shippingFee = cart.length > 0 ? 1.50 : 0.00;
  const totalPrice = (subtotal + shippingFee).toFixed(2);

  const showPopupModal = (title, message, type = 'success', onConfirm = null) => {
    setModal({ show: true, title, message, type, onConfirm });
  };

  const handleIncrease = (indexToIncrease) => {
    setCart(cart.map((item, index) => {
      if (index === indexToIncrease) {
        return { ...item, quantity: (item.quantity || 1) + 1 };
      }
      return item;
    }));
  };

  const handleDecrease = (indexToIncrease) => {
    setCart(cart.map((item, index) => {
      if (index === indexToIncrease) {
        return { ...item, quantity: Math.max(1, (item.quantity || 1) - 1) };
      }
      return item;
    }));
  };

  const handleRemoveItem = (indexToRemove) => {
    const itemName = cart[indexToRemove]?.title || cart[indexToRemove]?.name || 'Item';
    setCart(cart.filter((_, index) => index !== indexToRemove));
    showPopupModal('Item Removed', `"${itemName}" was removed from your bag.`, 'info');
  };

  const handleConfirmMapLocation = async () => {
    setMapOpen(false);
    setGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedCoords.lat}&lon=${selectedCoords.lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        showPopupModal('Location Updated', 'Delivery address pinned successfully.', 'success');
      } else {
        setAddress(`Latitude: ${selectedCoords.lat}, Longitude: ${selectedCoords.lng}`);
      }
    } catch (error) {
      setAddress(`Latitude: ${selectedCoords.lat}, Longitude: ${selectedCoords.lng}`);
    } finally {
      setGeocoding(false);
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!user) {
      showPopupModal('Authentication Required', 'Please log in to complete your checkout.', 'error', () => navigate('/login'));
      return;
    }
    if (cart.length === 0) {
      showPopupModal('Bag Empty', 'Your shopping bag is empty.', 'error');
      return;
    }
    navigate('/payment', {
      state: { 
        shippingName, 
        phone, 
        address, 
        userEmail: user.email, 
        userId: user.uid, 
        cart, 
        totalPrice, 
        shippingFee: shippingFee.toFixed(2) 
      }
    });
  };

  if (mapOpen) {
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${selectedCoords.lng - 0.02},${selectedCoords.lat - 0.02},${selectedCoords.lng + 0.02},${selectedCoords.lat + 0.02}&layer=mapnik&marker=${selectedCoords.lat},${selectedCoords.lng}`;
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Choose Delivery Location</h2>
            <button onClick={() => setMapOpen(false)} className="text-sm text-pink-600 font-semibold cursor-pointer"> Back to Cart</button>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-200">
              <iframe title="Map" width="100%" height="100%" src={mapSrc} frameBorder="0"></iframe>
            </div>
            <button onClick={handleConfirmMapLocation} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2.5 rounded-xl transition cursor-pointer text-xs">
              Confirm Selected Location
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 relative text-gray-800">
      
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-5 text-center space-y-3 border border-gray-100">
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-bold ${
              modal.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-pink-50 text-pink-500'
            }`}>
              {modal.type === 'error' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
            <h3 className="text-sm font-bold text-gray-900">{modal.title}</h3>
            <p className="text-xs text-gray-500">{modal.message}</p>
            <button
              onClick={() => {
                const cb = modal.onConfirm;
                setModal({ show: false, title: '', message: '', type: 'success', onConfirm: null });
                if (cb) cb();
              }}
              className="w-full bg-gray-900 hover:bg-black text-white py-2 rounded-xl text-xs font-medium cursor-pointer transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Header Title Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200/60">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Checkout Items</h1>
            <p className="text-xs text-gray-400 mt-0.5">Preview your bag items and confirm your delivery destination.</p>
          </div>
          <Link to="/shop" className="text-xs font-medium text-pink-600 hover:text-pink-700 bg-pink-50 px-3 py-1.5 rounded-xl transition">
            Back to Shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800">Your shopping bag is empty</h3>
            <p className="text-xs text-gray-400">Explore our exclusive accessories collection for your daily style.</p>
            <Link to="/shop" className="inline-block bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium px-5 py-2.5 rounded-xl transition shadow-sm">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-5 items-start">
            
            {/* Left Column: Unified Single Panel (Shipping Details FIRST, then Review Items) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200/80 space-y-5">
              
              {/* Section 1: Shipping Details Form */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shipping Details</h2>
                </div>

                <form onSubmit={handleProceedToPayment} id="checkout-form" className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-500">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={shippingName} 
                        onChange={(e) => setShippingName(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-pink-500"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-500">Phone Number</label>
                      <input 
                        type="tel" 
                        required 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-pink-500"
                        placeholder="+855 XX XXX XXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] text-gray-500">Delivery Address</label>
                      <button type="button" onClick={() => setMapOpen(true)} className="text-[11px] font-medium text-pink-600 hover:underline cursor-pointer">
                        Choose from Map 
                      </button>
                    </div>
                    <textarea 
                      rows="2" 
                      required 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={geocoding ? "Locating..." : "House number, street, Sangkat, Khan, city"}
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-pink-500 resize-none"
                    ></textarea>
                  </div>
                </form>
              </div>

              <hr className="border-gray-100" />

              {/* Section 2: Bag Items */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Review Items ({cart.length})</h2>
                </div>

                <div className="divide-y divide-gray-100">
                  {cart.map((item, index) => {
                    const qty = item.quantity || 1;
                    let rawPrice = item.price;
                    if (typeof rawPrice === 'string') rawPrice = parseFloat(rawPrice.replace(/[^0-9.-]+/g, ""));
                    const itemSubtotal = (isNaN(rawPrice) ? 0 : rawPrice * qty).toFixed(2);

                    // Image path handling safety matching your other updates
                    const rawImage = item.img || item.image;
                    const imageSrc = rawImage?.startsWith('http')
                      ? rawImage
                      : `${import.meta.env.BASE_URL}${rawImage?.startsWith('Image/') ? rawImage : `Image/${rawImage}`}`;

                    return (
                      <div key={index} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={imageSrc} alt={item.title || item.name} className="w-12 h-12 object-cover rounded-xl bg-gray-50 border border-gray-100 shrink-0" />
                          <div>
                            <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{item.title || item.name}</h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">${Number(rawPrice).toFixed(2)} each</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Qty controls */}
                          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden">
                            <button onClick={() => handleDecrease(index)} className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-xs font-bold cursor-pointer">-</button>
                            <span className="px-2 text-xs font-medium text-gray-800">{qty}</span>
                            <button onClick={() => handleIncrease(index)} className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-xs font-bold cursor-pointer">+</button>
                          </div>

                          <span className="text-xs font-bold text-gray-900 w-14 text-right">${itemSubtotal}</span>

                          <button onClick={() => handleRemoveItem(index)} className="text-gray-300 hover:text-red-500 text-xs font-bold transition cursor-pointer p-1" title="Remove">
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Clean Sticky Summary Card */}
            <div className="lg:col-span-5 sticky top-5">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 space-y-4">
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">Order Summary</h2>

                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Bag Subtotal</span>
                    <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="font-medium text-gray-800">${shippingFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-pink-600 text-base">${totalPrice}</span>
                </div>

                <button 
                  type="submit" 
                  form="checkout-form"
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-xl transition shadow-sm text-xs cursor-pointer"
                >
                  Proceed to Payment (${totalPrice})
                </button>

                <div className="text-center pt-1">
                  <span className="text-[10px] text-gray-400">Powered by Catiee Accessories</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}