import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../lib/firebaseClients";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  async function handleAdminSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify if the account actually has admin privileges in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === "admin") {
        navigate("/admin"); // Redirects directly to the main admin route in App.jsx
      } else {
        // If they are a normal customer trying to use the admin portal, block them
        setError("Access denied. Admin credentials required.");
        await auth.signOut();
      }
    } catch (authError) {
      console.error("Admin Login Error:", authError);
      
      let friendlyMsg = "Invalid email or password. Please try again.";
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
        friendlyMsg = "Incorrect admin email or password.";
      }
      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex-1 flex items-center justify-center bg-gray-900 px-4 py-12 min-h-screen">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 p-8 shadow-xl">
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 mb-3 shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Admin Portal
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Restricted access. Sign in with your admin credentials.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleAdminSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
               Email
            </label>
            <input
              id="admin-email"
              type="email"
              placeholder="Enter email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-gray-50/50 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-gray-50/50 transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
              <p className="text-xs font-semibold text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gray-900 py-3.5 text-white font-semibold hover:bg-black active:scale-[0.99] transition-all disabled:bg-gray-400 shadow-sm text-sm mt-2"
          >
            {loading ? "Authenticating..." : "Sign In "}
          </button>
        </form>
      </div>
    </section>
  );
}