import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { db } from "../lib/firebaseClients";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user]);

  // Close mobile menu and automatically clear search input when route/query changes
  useEffect(() => {
    setMobileMenuOpen(false);

    // Check if current URL contains a search query parameter
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');

    // If there's no search query in the URL, clear the navbar input text
    if (!searchParam) {
      setSearchQuery('');
    } else {
      setSearchQuery(searchParam);
    }
  }, [location.pathname, location.search]);

  // Handle Search submit / Enter key press
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  // If user is an admin and currently inside the admin panel, render a specialized Admin Navbar
  const isInAdminPanel = isAdmin && location.pathname.startsWith('/admin');

  if (isInAdminPanel) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-xl text-pink-600 tracking-tight cursor-pointer flex items-center gap-2.5" onClick={() => navigate("/")}>
            <img src={`${import.meta.env.BASE_URL}Catie.png`} alt="Logo" className="w-8 h-8 object-contain rounded-xl shadow-xs" />
            Catie Accessories
          </span>
        </div>

        <nav className="flex items-center gap-6 text-sm font-semibold text-gray-700">
          <Link to="/" className="hover:text-purple-600 transition text-gray-500 hover:underline flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            View Live Store
          </Link>
        </nav>
      </header>
    );
  }

  // Helper function to determine if a link is active
  const isActive = (path) => location.pathname === path;

  // Standard Customer / Guest Navbar
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 px-6 sm:px-8 flex items-center justify-between shadow-xs gap-4">
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-extrabold text-xl text-pink-600 tracking-tight cursor-pointer flex items-center gap-2.5" onClick={() => navigate("/")}>
          <img src={`${import.meta.env.BASE_URL}Catie.png`} alt="Logo" className="w-8 h-8 object-contain rounded-xl shadow-xs" />
          <span className="hidden sm:inline">Catie Accessories</span>
        </span>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs sm:max-w-sm mx-2">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </span>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200/80 rounded-2xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all shadow-inner"
        />
      </form>

      {/* Desktop Navigation Links */}
      <nav className="hidden lg:flex items-center gap-3 text-sm font-semibold text-gray-700 shrink-0">
        <Link 
          to="/" 
          className={`relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 ${
            isActive('/') ? 'text-pink-600 bg-pink-50/80 shadow-xs' : 'text-gray-600 hover:text-pink-600 hover:bg-gray-50'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={`w-4 h-4 transition-transform duration-300 ${isActive('/') ? 'scale-110 text-pink-600' : 'text-gray-400'}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Home
        </Link>

        <Link 
          to="/shop" 
          className={`relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 ${
            isActive('/shop') ? 'text-pink-600 bg-pink-50/80 shadow-xs' : 'text-gray-600 hover:text-pink-600 hover:bg-gray-50'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={`w-4 h-4 transition-transform duration-300 ${isActive('/shop') ? 'scale-110 text-pink-600' : 'text-gray-400'}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Shop
        </Link>

        <Link 
          to="/about" 
          className={`relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 ${
            isActive('/about') ? 'text-pink-600 bg-pink-50/80 shadow-xs' : 'text-gray-600 hover:text-pink-600 hover:bg-gray-50'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={`w-4 h-4 transition-transform duration-300 ${isActive('/about') ? 'scale-110 text-pink-600' : 'text-gray-400'}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          About
        </Link>

        <Link 
          to="/contact" 
          className={`relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 ${
            isActive('/contact') ? 'text-pink-600 bg-pink-50/80 shadow-xs' : 'text-gray-600 hover:text-pink-600 hover:bg-gray-50'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={`w-4 h-4 transition-transform duration-300 ${isActive('/contact') ? 'scale-110 text-pink-600' : 'text-gray-400'}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          Contact
        </Link>

        {/* Dynamic Auth Button / Profile Icon */}
        {user ? (
          <button
            onClick={() => navigate("/profile")}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 shadow-sm focus:outline-none cursor-pointer ${
              isActive('/profile') ? 'bg-pink-200 text-pink-700 ring-2 ring-pink-400 scale-105' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
            }`}
            title="View Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.75 20.165a7.5 7.5 0 0 1 16.5 0 .75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="rounded-full bg-pink-500 px-5 py-2.5 text-white font-semibold hover:bg-pink-600 active:scale-95 transition-all shadow-sm text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign In
          </button>
        )}
      </nav>

      {/* Mobile Hamburger Button */}
      <div className="flex lg:hidden items-center gap-2">
        {user && (
          <button
            onClick={() => navigate("/profile")}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all shadow-sm ${
              isActive('/profile') ? 'bg-pink-200 text-pink-700 ring-2 ring-pink-400' : 'bg-pink-100 text-pink-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.75 20.165a7.5 7.5 0 0 1 16.5 0 .75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2.5 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition focus:outline-none cursor-pointer"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-xl border-b border-gray-100 shadow-xl py-5 px-6 flex flex-col gap-3 lg:hidden animate-slideDown z-50">
          <Link 
            to="/" 
            className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
              isActive('/') ? 'bg-pink-50 text-pink-600 shadow-xs' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-pink-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Home
          </Link>

          <Link 
            to="/shop" 
            className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
              isActive('/shop') ? 'bg-pink-50 text-pink-600 shadow-xs' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-pink-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Shop
          </Link>

          <Link 
            to="/about" 
            className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
              isActive('/about') ? 'bg-pink-50 text-pink-600 shadow-xs' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-pink-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            About
          </Link>

          <Link 
            to="/contact" 
            className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
              isActive('/contact') ? 'bg-pink-50 text-pink-600 shadow-xs' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-pink-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Contact
          </Link>

          {!user && (
            <div className="pt-2">
              <button
                onClick={() => navigate("/login")}
                className="w-full rounded-2xl bg-pink-500 px-5 py-3 text-white font-bold hover:bg-pink-600 transition shadow-md shadow-pink-500/20 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}