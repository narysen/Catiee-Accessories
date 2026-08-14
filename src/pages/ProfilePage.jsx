import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebaseClients';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, or } from 'firebase/firestore';
import { getImageUrl } from '../utils/imageUtils'; // <--- Import helper

export default function ProfilePage({ user }) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Map Modal State
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Invoice / Order Details Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      if (user && user.uid) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileData(data);
            setPhone(data.phone || '');
            setLocation(data.location || '');
          }

          const ordersRef = collection(db, "orders");
          let userOrders = [];

          try {
            const q = query(
              ordersRef, 
              or(
                where("userId", "==", user.uid),
                where("userEmail", "==", user.email)
              )
            );
            const querySnapshot = await getDocs(q);
            userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          } catch (queryErr) {
            const qFallback = query(ordersRef, where("userId", "==", user.uid));
            const snapFallback = await getDocs(qFallback);
            userOrders = snapFallback.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }

          setOrders(userOrders);
        } catch (err) {
          console.error("Error fetching user data:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [user]);

  const handleOpenGoogleMapsPicker = () => {
    setSelectedAddress(location || "Street 13B, Sangkat Ou Baek K'am, Khan Sen Sokh, Phnom Penh");
    setShowMapModal(true);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          setSelectedAddress(data?.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        } catch (err) {
          setSelectedAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setError("Unable to retrieve your location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirmMapLocation = () => {
    setLocation(selectedAddress);
    setShowMapModal(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { phone, location });
      setProfileData(prev => ({ ...prev, phone, location }));
      setIsEditing(false);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError("Failed to update profile. Please check permissions.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-[#faf8f5] px-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-pink-950/5 border border-pink-100 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome to Catiee</h2>
            <p className="text-gray-500 text-xs leading-relaxed">Sign in to check your accessory orders, manage saved addresses, and track your style collection.</p>
          </div>
          <button 
            onClick={() => navigate('/login')} 
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3.5 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-pink-500/25 cursor-pointer active:scale-98"
          >
            Sign In to Account
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin"></div>
      </div>
    );
  }

  const displayName = profileData?.fullName || user.displayName || "Member";
  const displayPhone = profileData?.phone || "Not provided";
  const displayLocation = profileData?.location || "Not provided";

  return (
    <div className="min-h-screen bg-[#faf8f5] py-12 px-4 sm:px-6 lg:px-8">
      <main className="w-full max-w-5xl mx-auto space-y-8">
        
        {/* Aesthetic Soft Minimalist Header Card */}
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-pink-950/5 border border-pink-100/80 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-100/40 via-rose-50/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-6 z-10 w-full sm:w-auto text-center sm:text-left flex-col sm:flex-row">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-300 text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-pink-500/25 ring-8 ring-pink-50">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{displayName}</h1>
              <p className="text-xs text-gray-400 font-medium">{user.email}</p>
            </div>
          </div>

          <div className="z-10 w-full sm:w-auto flex justify-center">
            <button 
              onClick={handleLogout}
              className="px-6 py-3 rounded-2xl bg-gray-50 hover:bg-rose-50 hover:text-rose-600 text-gray-600 font-bold transition-all text-xs flex items-center justify-center gap-2 border border-gray-200/60 cursor-pointer shadow-xs active:scale-98"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold text-center shadow-sm">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs font-bold text-center shadow-sm">
            {error}
          </div>
        )}

        {/* Tab Navigation Segmented Control */}
        <div className="flex justify-center">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-pink-100/80 inline-flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-pink-500 text-white shadow-md shadow-pink-500/25'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              My Profile & Address
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-pink-500 text-white shadow-md shadow-pink-500/25'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Order History
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-600'}`}>
                {orders.length}
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Content Panel */}
        {activeTab === 'overview' ? (
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-pink-950/5 border border-pink-100/80 space-y-8">
            <div className="flex justify-between items-center border-b border-pink-50 pb-5">
              <div>
                <h2 className="text-lg font-black text-gray-900">Account Details</h2>
                <p className="text-xs text-gray-400">Update your phone number or shipping location for smooth deliveries.</p>
              </div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="text-xs font-bold bg-pink-50 text-pink-600 hover:bg-pink-100 px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Edit Profile
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 px-4 py-2 cursor-pointer transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div className="space-y-1.5 bg-[#faf8f5] p-5 rounded-2xl border border-pink-100/40">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Full Name</span>
                    <p className="font-bold text-gray-900 text-sm">{displayName}</p>
                  </div>

                  <div className="space-y-1.5 bg-[#faf8f5] p-5 rounded-2xl border border-pink-100/40">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Email Address</span>
                    <p className="font-bold text-gray-900 text-sm truncate">{user.email}</p>
                  </div>

                  <div className="space-y-1.5 bg-[#faf8f5] p-5 rounded-2xl border border-pink-100/40">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Phone Number</span>
                    <p className="font-bold text-gray-900 text-sm">{displayPhone}</p>
                  </div>

                  <div className="space-y-1.5 bg-[#faf8f5] p-5 rounded-2xl border border-pink-100/40">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Customer Reference ID</span>
                    <p className="font-bold text-gray-900 font-mono text-[11px] truncate">{user.uid}</p>
                  </div>
                </div>

                <div className="space-y-2 bg-gradient-to-r from-pink-50/60 to-rose-50/40 p-6 rounded-3xl border border-pink-100">
                  <div className="flex items-center justify-between">
                    <span className="text-pink-900 font-black uppercase tracking-wider text-[10px]">Primary Delivery Address</span>
                    <span className="text-[10px] bg-pink-200/70 text-pink-800 font-extrabold px-2.5 py-0.5 rounded-full">Default</span>
                  </div>
                  <p className="font-medium text-pink-950 text-xs leading-relaxed">{displayLocation}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="editPhone" className="block text-xs font-extrabold text-gray-700 uppercase tracking-wide">Phone Number</label>
                  <input 
                    id="editPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+855 15 479 408"
                    className="w-full rounded-2xl border border-pink-200/80 px-4 py-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400 bg-[#faf8f5] font-medium transition"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="editLocation" className="block text-xs font-extrabold text-gray-700 uppercase tracking-wide">Delivery Address</label>
                    <button
                      type="button"
                      onClick={handleOpenGoogleMapsPicker}
                      className="text-xs font-bold text-pink-600 hover:text-pink-700 transition cursor-pointer inline-flex items-center gap-1.5 bg-pink-50 px-3 py-1 rounded-xl"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      Pick on Map
                    </button>
                  </div>
                  <textarea 
                    id="editLocation"
                    rows="3"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter street, sangkat, khan, or city"
                    className="w-full rounded-2xl border border-pink-200/80 px-4 py-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400 bg-[#faf8f5] font-medium transition"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-7 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all shadow-lg shadow-pink-500/25 disabled:bg-gray-300 cursor-pointer"
                  >
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-pink-950/5 border border-pink-100/80 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-gray-900">Your Accessory Orders</h2>
                <p className="text-xs text-gray-400">Track and review all your past accessory purchases.</p>
              </div>
              <span className="text-xs font-bold bg-pink-50 text-pink-600 px-3 py-1.5 rounded-xl">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>

            {orders.length > 0 ? (
              orders.map((order) => {
                const orderDate = order.createdAt?.toDate 
                  ? order.createdAt.toDate().toLocaleDateString() 
                  : (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent');
                
                const displayTotal = order.totalPrice || order.totalAmount || '0.00';
                const statusValue = order.status || 'Pending Verification';

                return (
                  <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-xl shadow-pink-950/5 border border-pink-100/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 transition-all hover:border-pink-300">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">Order ID: {order.id}</span>
                      <p className="text-base font-black text-gray-900">${displayTotal}</p>
                      <p className="text-xs text-gray-500 font-medium">Placed on {orderDate}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        {statusValue}
                      </span>

                      <button
                        onClick={() => setSelectedInvoice(order)}
                        className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                      >
                        View Invoice
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-pink-950/5 border border-pink-100/80 text-center space-y-4">
                <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-gray-900 text-base">No Orders Yet</h3>
                  <p className="text-gray-500 text-xs max-w-sm mx-auto">Your cart looks empty! Explore our beautiful accessory collection and find your new favorite piece.</p>
                </div>
                <button 
                  onClick={() => navigate('/shop')} 
                  className="bg-pink-500 hover:bg-pink-600 text-white px-7 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-pink-500/25 cursor-pointer"
                >
                  Explore Shop
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Order Details / Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-pink-100 max-h-[90vh] overflow-y-auto">
            <div className="relative flex flex-col items-center text-center border-b border-pink-50 pb-5">
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="absolute right-0 top-0 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition"
              >
                ✕
              </button>
              <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Catiee Accessories</span>
              <h3 className="text-lg font-black text-gray-900 mt-0.5">Order Invoice</h3>
              <p className="text-[11px] text-gray-400 font-mono">ID: {selectedInvoice.id}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Status</span>
                <span className="text-xs font-extrabold text-amber-900 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
                  {selectedInvoice.status || 'Pending Verification'}
                </span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed pt-1">
                We are verifying your payment slip. Your items will be prepared for delivery shortly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-[#faf8f5] p-4 rounded-2xl border border-pink-100/40">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Recipient Name</span>
                <p className="font-bold text-gray-900">{selectedInvoice.shippingName || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Phone</span>
                <p className="font-bold text-gray-900">{selectedInvoice.phone || 'N/A'}</p>
              </div>
              <div className="col-span-2 space-y-1 pt-1 border-t border-gray-200/40">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Delivery Address</span>
                <p className="font-medium text-gray-700 leading-snug">{selectedInvoice.address || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Items</h4>
              <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
                {selectedInvoice.cart && selectedInvoice.cart.map((item, idx) => {
                  const qty = item.quantity || 1;
                  let rawPrice = item.price;
                  if (typeof rawPrice === 'string') rawPrice = parseFloat(rawPrice.replace(/[^0-9.-]+/g, ""));
                  const itemTotal = (isNaN(rawPrice) ? 0 : rawPrice * qty).toFixed(2);

                  // Use getImageUrl helper for safe path resolution on GitHub Pages
                  const imageSrc = getImageUrl(item.img || item.image);

                  return (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-2.5">
                        <img src={imageSrc} alt="" className="w-10 h-10 object-cover rounded-xl bg-gray-100 border shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{item.title || item.name}</p>
                          <p className="text-[11px] text-gray-400">Qty: {qty} × ${Number(rawPrice).toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="font-black text-gray-900">${itemTotal}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-pink-50 pt-4 text-gray-500">
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-semibold text-gray-800 uppercase">{selectedInvoice.paymentMethod || 'Bakong QR'}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-gray-800">${selectedInvoice.shippingFee || '1.50'}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-pink-50 text-sm font-black text-gray-900">
                <span>Total Amount</span>
                <span className="text-pink-600 text-lg">${selectedInvoice.totalPrice || selectedInvoice.totalAmount || '0.00'}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl transition text-xs cursor-pointer shadow-sm"
              >
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5 border border-pink-100">
            <div className="flex justify-between items-center border-b border-pink-50 pb-4">
              <div>
                <h3 className="font-black text-gray-900 text-base">Select Delivery Location</h3>
                <p className="text-[11px] text-gray-400">Use GPS detection or adjust your address below</p>
              </div>
              <button 
                onClick={() => setShowMapModal(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 text-base font-bold cursor-pointer flex items-center justify-center transition"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center justify-between bg-pink-50/70 border border-pink-100 rounded-2xl px-4 py-3">
              <span className="text-xs text-pink-900 font-medium">Auto-detect device GPS location:</span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold hover:bg-pink-700 transition disabled:bg-gray-400 shadow-sm cursor-pointer whitespace-nowrap"
              >
                {isLocating ? "Detecting GPS..." : "Detect GPS"}
              </button>
            </div>
            
            <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
              <iframe
                title="Google Map Pin Selector"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wide">Selected Address</label>
              <textarea
                rows="2"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full rounded-2xl border border-pink-200/80 px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400 bg-[#faf8f5] font-medium transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-pink-50">
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="px-5 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMapLocation}
                className="px-6 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all shadow-md shadow-pink-500/25 cursor-pointer"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}