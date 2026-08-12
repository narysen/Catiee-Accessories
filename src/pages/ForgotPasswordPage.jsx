import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../lib/firebaseClients';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset request sent! Check your email inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 min-h-[70vh] flex flex-col justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-xs text-gray-500">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50"
              required
            />
          </div>

          {message && <p className="text-xs font-medium text-green-600 bg-green-50 p-3 rounded-lg">{message}</p>}
          {error && <p className="text-xs font-medium text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition shadow-sm text-sm"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center text-xs pt-2">
          <Link to="/login" className="text-pink-600 font-semibold hover:underline">
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}