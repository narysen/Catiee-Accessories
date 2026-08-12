import React, { useState } from 'react';
import { db } from '../lib/firebaseClients';
import { collection, addDoc } from 'firebase/firestore';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Combines the country code with the user input on submit
      const fullPhoneNumber = phone ? `+855 ${phone}` : '';
      
      await addDoc(collection(db, "messages"), {
        name,
        email,
        phone: fullPhoneNumber,
        subject,
        message,
        createdAt: new Date()
      });
      alert('Thank you for reaching out! Your message has been sent successfully. We will get back to you shortly.');
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error("Error saving message:", error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-pink-50/30 via-white to-white py-16 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-pink-600 font-semibold tracking-widest uppercase text-xs">Get in Touch</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">We'd Love to Hear From You</h1>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Have a question about our collections, orders, or custom styling? Drop us a line or connect with us below.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Send Us a Message</h3>
                <p className="text-xs text-gray-500 mt-1">Fill out the form and our team will get back to you within 24 hours.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Your Name</label>
                  <input 
                    type="text"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="w-full border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50/50 transition" 
                    placeholder="Enter your name" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Phone Number</label>
                  <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-pink-400 bg-gray-50/50 transition">
                    <span className="bg-gray-100 text-gray-600 px-3.5 py-3 text-sm font-medium border-r border-gray-200 flex items-center select-none">
                      +855
                    </span>
                    <input 
                      type="tel"
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="w-full px-4 py-3 text-sm focus:outline-none bg-transparent" 
                      placeholder="XX XXX XXX" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Email Address</label>
                  <input 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="w-full border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50/50 transition" 
                    placeholder="Enter your email" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Subject</label>
                  <input 
                    type="text"
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)} 
                    required 
                    className="w-full border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50/50 transition" 
                    placeholder="Order Inquiry / Support" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Message</label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  required 
                  rows="4"
                  className="w-full border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50/50 resize-none transition" 
                  placeholder="How can we help you today?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3.5 rounded-xl transition disabled:bg-gray-300 shadow-sm text-sm"
              >
                {loading ? "Sending Message..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Right Column: Info, Socials & Hours (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Quick Contact Info */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-5">
              <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
              
              <div className="flex flex-col gap-4 text-sm">
                {/* Location */}
                <a 
                  href="https://maps.google.com/?q=Ou+Bek+K'am,+Sen+Sok,+Phnom+Penh,+Cambodia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl group-hover:bg-pink-100 transition shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition">Our Location</p>
                    <p className="text-gray-500 text-xs mt-0.5">Ou Bek K'am, Sen Sok, Phnom Penh, Cambodia</p>
                  </div>
                </a>

                {/* Phone */}
                <a 
                  href="tel:+85515479408" 
                  className="flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl group-hover:bg-pink-100 transition shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition">Phone Contact</p>
                    <p className="text-gray-500 text-xs mt-0.5">+855 15 479 408</p>
                  </div>
                </a>

                {/* Email */}
                <a 
                  href="mailto:catie_accessories@gmail.com" 
                  className="flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl group-hover:bg-pink-100 transition shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-pink-600 transition">Email Address</p>
                    <p className="text-gray-500 text-xs mt-0.5">catie_accessories@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Social Platforms Links */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-gray-900">Our Social Platform</h3>
              
              <div className="grid grid-cols-3 gap-3">
                {/* Facebook */}
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl transition border border-blue-100/50"
                  title="Facebook"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-xs font-semibold">Facebook</span>
                </a>

                {/* Instagram */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-2xl transition border border-pink-100/50"
                  title="Instagram"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="text-xs font-semibold">Instagram</span>
                </a>

                {/* Telegram */}
                <a 
                  href="https://t.me/+85515479408" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-sky-50 hover:bg-sky-100 text-sky-500 rounded-2xl transition border border-sky-100/50"
                  title="Telegram"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.534.26l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.195 1.006.131.832.943z"/>
                  </svg>
                  <span className="text-xs font-semibold">Telegram</span>
                </a>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <h3 className="text-lg font-bold text-gray-900">Business Hours</h3>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex justify-between pb-2 border-b border-gray-50">
                  <span>Monday – Saturday:</span> 
                  <span className="font-semibold text-gray-800">9:00 AM – 8:00 PM</span>
                </li>
                <li className="flex justify-between pt-0.5">
                  <span>Sunday:</span> 
                  <span className="font-semibold text-gray-800">10:00 AM – 6:00 PM</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}