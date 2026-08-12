import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AuthPopup({ show, onClose, title = "Authentication Required", message = "Please log in or sign up before adding items to your cart." }) {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fadeIn p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white text-gray-900 p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-4 max-w-sm w-full border border-gray-100 transform animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner">
          ✕
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-base text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500 font-medium px-2">{message}</p>
        </div>
        <div className="flex items-center gap-3 w-full pt-2">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition text-xs"
          >
            Cancel
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 rounded-xl transition text-xs shadow-sm"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}