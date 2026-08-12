import React, { useState } from 'react';
import ManageProducts from './ManageProducts';
import ManageUsers from './ManageUsers';
import ManageOrders from './ManageOrders';
import ManageMessages from './ManageMessages';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const logoUrl = `${import.meta.env.BASE_URL}Catie.png`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className={`bg-white border-r border-gray-100 flex flex-col justify-between transition-all duration-300 hidden md:flex ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 space-y-6">
          {/* Logo and Brand Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={logoUrl} 
                alt="Catie Accessories Logo" 
                className="w-9 h-9 object-contain rounded-xl shadow-xs" 
              />
              <div>
                <h1 className="text-base font-extrabold text-gray-900 tracking-tight">Catie Accessories</h1>
                <p className="text-xs text-purple-600 font-semibold">Admin Portal</p>
              </div>
            </div>
            {/* Close Button Inside Sidebar */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              title="Close Sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-1.5 pt-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-pink-50 text-pink-600 shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
              Product Inventory
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-pink-50 text-pink-600 shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Manage Orders
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-pink-50 text-pink-600 shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Users & Security
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-pink-50 text-pink-600 shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Customer Messages
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-gray-100">
          <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700">Logged in as Admin</p>
            <p className="text-gray-400">System operational</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with Open/Show Sidebar Button */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="hidden md:flex bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                Show Sidebar
              </button>
            )}
            
            <div className="flex items-center gap-2 md:hidden">
              <img src={logoUrl} alt="Logo" className="w-7 h-7 object-contain" />
              <span className="font-bold text-gray-900 text-sm">Catie Admin</span>
            </div>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="flex gap-1.5 overflow-x-auto md:hidden">
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'products' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Products
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'orders' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'users' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Users
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'messages' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Messages
            </button>
          </div>
        </header>

        {/* Dynamic Content View Area */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {activeTab === 'products' && <ManageProducts />}
          {activeTab === 'orders' && <ManageOrders />}
          {activeTab === 'users' && <ManageUsers />}
          {activeTab === 'messages' && <ManageMessages />}
        </main>
      </div>
    </div>
  );
}