import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebaseClients';
import { collection, getDocs } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ManageUsers() {
  const [usersList, setUsersList] = useState([]);
  const [resetMessage, setResetMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const userSnapshot = await getDocs(collection(db, 'users'));
      setUsersList(userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSendResetEmail = async (email) => {
    if (!window.confirm(`Send password reset email to ${email}?`)) return;
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage(`Password reset email successfully sent to ${email}`);
    } catch (error) {
      setResetMessage("Error: " + error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Registered Users & Password Reset Requests</h2>
      {resetMessage && <p className="text-xs font-medium text-pink-600 bg-pink-50 p-3 rounded-lg">{resetMessage}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b text-gray-500 bg-gray-50">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {usersList.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{u.fullName || u.name || 'N/A'}</td>
                <td className="p-3 text-gray-600">{u.email}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {u.role || 'customer'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button 
                    onClick={() => handleSendResetEmail(u.email)}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm"
                  >
                    Send Reset Password
                  </button>
                </td>
              </tr>
            ))}
            {usersList.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-400">
                  No users found. Make sure your Firestore rules allow reading the users collection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}