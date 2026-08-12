import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../lib/firebaseClients";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("+885 ");
  const [location, setLocation] = useState("");
  const [showMapModal, setShowMapModal] = useState(false);
  
  const [selectedAddress, setSelectedAddress] = useState(
    "Street 13B, Sangkat Ou Baek K'am, Khan Sen Sokh, Phnom Penh"
  );
  
  const [isLocating, setIsLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleOpenGoogleMapsPicker = () => {
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

          if (data && data.display_name) {
            setSelectedAddress(data.display_name);
            setLocation(data.display_name);
          } else {
            const fallbackCoordStr = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
            setSelectedAddress(fallbackCoordStr);
            setLocation(fallbackCoordStr);
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          const fallbackCoordStr = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
          setSelectedAddress(fallbackCoordStr);
          setLocation(fallbackCoordStr);
        } finally {
          setIsLocating(false);
        }
      },
      (geoError) => {
        console.error("Geolocation error:", geoError);
        setIsLocating(false);
        setError("Unable to retrieve your location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirmMapLocation = () => {
    setLocation(selectedAddress);
    setShowMapModal(false);
  };

  // Handler to enforce the +885 prefix requirement
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    // Ensure it always starts with '+885 '
    if (!input.startsWith("+885 ")) {
      setPhone("+885 ");
      return;
    }
    setPhone(input);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please double-check.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (fullName) {
          await updateProfile(user, {
            displayName: fullName
          });
        }
        
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          fullName: fullName,
          email: email,
          // Save empty string if only the prefix was left untouched
          phone: phone === "+885 " ? "" : phone,
          location: location,
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/"); 
    } catch (authError) {
      console.error("Firebase Auth error:", authError);
      
      let friendlyMsg = authError.message.replace("Firebase: ", "");
      if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/wrong-password' || authError.code === 'auth/user-not-found') {
        friendlyMsg = "Invalid email or password. Please try again.";
      } else if (authError.code === 'auth/email-already-in-use') {
        friendlyMsg = "An account with this email already exists. Try signing in instead.";
      }
      
      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex-1 flex items-center justify-center bg-purple-50 px-4 py-12 relative">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isRegistering ? "Join Catie Accessories to start shopping" : "Sign in to your Catiee Accessories account"}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Jane Doe"
                value={fullName}
                disabled={loading}
                onChange={(e) => setFullName(e.target.value)}
                required={isRegistering}
                autoComplete="name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50/50 transition"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50/50 transition"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Password</label>
              {!isRegistering && (
                <Link to="/forgot-password" className="text-xs font-bold text-pink-600 hover:underline">
                  Forgot Password?
                </Link>
              )}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isRegistering ? "new-password" : "current-password"}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50/50 transition"
            />
          </div>

          {isRegistering && (
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                disabled={loading}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={isRegistering}
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50/50 transition"
              />
            </div>
          )}

          {isRegistering && (
            <>
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Phone Number <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+885 15 479 408"
                  value={phone}
                  disabled={loading}
                  onChange={handlePhoneChange}
                  autoComplete="tel"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50/50 transition"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="location" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Location / Address <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenGoogleMapsPicker}
                    className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 focus:outline-none transition"
                  >
                    <span>📍</span>
                  </button>
                </div>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Street, Sangkat, Khan, City or pick on map"
                  value={location}
                  disabled={loading}
                  onChange={(e) => setLocation(e.target.value)}
                  autoComplete="street-address"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50/50 transition"
                />
              </div>
            </>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
              <p className="text-xs font-semibold text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-pink-500 py-3.5 text-white font-semibold hover:bg-pink-600 active:scale-[0.99] transition-all disabled:bg-gray-400 shadow-sm text-sm mt-2"
          >
            {loading ? (isRegistering ? "Creating account..." : "Signing in...") : (isRegistering ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-600">
          {isRegistering ? (
            <p>
              Already have an account?{" "}
              <button 
                type="button" 
                onClick={() => { setIsRegistering(false); setError(null); }} 
                className="font-bold text-pink-600 hover:underline focus:outline-none"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button 
                type="button" 
                onClick={() => { setIsRegistering(true); setError(null); }} 
                className="font-bold text-pink-600 hover:underline focus:outline-none"
              >
                Register
              </button>
            </p>
          )}
        </div>
      </div>

      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Pin Location on Google Map</h3>
                <p className="text-[11px] text-gray-500">Pan and zoom the map to center the pin icon on your exact location</p>
              </div>
              <button 
                onClick={() => setShowMapModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center justify-between bg-pink-50 border border-pink-100 rounded-xl px-4 py-2.5">
              <div className="text-xs text-pink-900 font-medium">
                Use your device's current GPS position automatically:
              </div>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="px-3 py-1.5 rounded-lg bg-pink-600 text-white text-xs font-bold hover:bg-pink-700 transition disabled:bg-gray-400 shadow-sm whitespace-nowrap flex items-center gap-1.5"
              >
                <span>📍</span>
                <span>{isLocating ? "Detecting GPS..." : "Catch My GPS"}</span>
              </button>
            </div>
            
            <div className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-300 shadow-inner">
              <iframe
                title="Google Map Pin Selector"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.123456789!2d104.9282!3d11.5564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109513e5f5f5f5f%3A0x5f5f5f5f5f5f5f5f!2sPhnom%20Penh!5e0!3m2!1sen!2skh!4v1650000000000!5m2!1sen!2skh"
              ></iframe>

              <div className="absolute inset-0 pointer-events-none flex items-center justify-center pb-6">
                <div className="text-3xl filter drop-shadow-md animate-bounce">
                  📍
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modalAddress" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Confirm Pinned Address:
              </label>
              <input
                id="modalAddress"
                type="text"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400 bg-gray-50 font-medium text-pink-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMapLocation}
                className="px-4 py-2 rounded-xl bg-pink-500 text-xs font-semibold text-white hover:bg-pink-600 shadow-sm"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}