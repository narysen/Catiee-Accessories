import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { auth, db } from './lib/firebaseClients';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ShoppingBag from './components/ShoppingBag';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import PostDetailPage from './pages/PostDetailPage';
import CartPage from './pages/Cart';
import PaymentPage from './pages/PaymentPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Admin Imports
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrders from './pages/admin/ManageOrders';

// Helper component to handle conditional layout based on current route path
function MainLayout({ user, userRole, handleLogout, cart, setCart, products, addToCart }) {
  const [isBagOpen, setIsBagOpen] = useState(false);
  const location = useLocation();

  const totalCartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Show shopping bag ONLY on Home ('/'), Shop ('/shop'), and Product Detail pages ('/product/:id')
  const isHomePage = location.pathname === '/';
  const isShopPage = location.pathname === '/shop';
  const isProductDetail = location.pathname.startsWith('/product/');
  const showShoppingBag = isHomePage || isShopPage || isProductDetail;

  return (
    <div className="bg-purple-50 text-gray-800 min-h-screen flex flex-col justify-between font-sans relative">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
      />

      {showShoppingBag && (
        <>
          <ShoppingBag 
            cart={cart} 
            setCart={setCart} 
            isOpen={isBagOpen} 
            onClose={() => setIsBagOpen(false)} 
          />

          <button
            onClick={() => setIsBagOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-pink-500 hover:bg-pink-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 cursor-pointer border-2 border-white"
            aria-label="Shopping Bag"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                {totalCartCount}
              </span>
            )}
          </button>
        </>
      )}
      
      <Routes>
        <Route path="/" element={<HomePage products={products} addToCart={addToCart} user={user} />} />
        <Route path="/shop" element={<ShopPage products={products} addToCart={addToCart} user={user} />} />
        <Route path="/product/:id" element={<PostDetailPage products={products} addToCart={addToCart} user={user} />} />
        <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} user={user} />} />
        <Route path="/payment" element={<PaymentPage setCart={setCart} user={user} />} />
        <Route path="/profile" element={<ProfilePage user={user} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={userRole === 'admin' ? <AdminDashboard /> : <AdminLoginPage />} />
        <Route path="/admin/products" element={userRole === 'admin' ? <ManageProducts /> : <AdminLoginPage />} />
        <Route path="/admin/orders" element={userRole === 'admin' ? <ManageOrders /> : <AdminLoginPage />} />
        <Route path="/admin/users" element={userRole === 'admin' ? <ManageUsers /> : <AdminLoginPage />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'customer');
          } else {
            setUserRole('customer');
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setUserRole('customer');
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
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
    };

    fetchProducts();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const currentQty = updated[existingIndex].quantity || 1;
        updated[existingIndex] = { ...updated[existingIndex], quantity: currentQty + 1 };
        return updated;
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <MainLayout 
        user={user}
        userRole={userRole}
        handleLogout={handleLogout}
        cart={cart}
        setCart={setCart}
        products={products}
        addToCart={addToCart}
      />
    </Router>
  );
}