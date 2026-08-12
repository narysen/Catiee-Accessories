import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="bg-purple-50/50 min-h-[80vh] py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Hero Banner Section */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <span className="text-pink-600 font-semibold tracking-widest uppercase text-xs">Our Story</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Shine Your Style with Catie Accessories
            </h1>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              Catie Accessories offers cute, aesthetic, and affordable accessories for everyone. We carefully select each product with a focus on quality and detail, helping you find the perfect piece to express your style.
            </p>
            <div className="pt-2">
              <Link 
                to="/shop" 
                className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm text-sm"
              >
                Explore Collections
              </Link>
            </div>
          </div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center">
            {/* Fixed static asset path for GitHub Pages subpath */}
            <img 
              src={`${import.meta.env.BASE_URL}Catie.png`} 
              alt="Catie Accessories Brand" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        {/* Core Values Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Aesthetic & Trendy</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Handpicked designs that match the latest fashion trends while keeping a unique, cute charm.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Quality Assured</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We prioritize detail and durability so your favorite accessories stay sparkling and beautiful.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Affordable Luxury</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Look your best for every occasion without breaking the bank. Premium styling accessible to all.
            </p>
          </div>
        </div>

        {/* Mission Statement Callout */}
        <div className="bg-gray-900 text-white rounded-3xl p-8 md:p-12 text-center space-y-4 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold">Ready to find your next favorite accessory?</h2>
          <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base">
            Browse through our wide selection of necklaces, bracelets, hair clips, and more today.
          </p>
          <div className="pt-2">
            <Link 
              to="/contact" 
              className="inline-block bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-3 rounded-xl transition text-sm"
            >
              Get in Touch With Us
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}