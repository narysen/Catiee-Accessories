import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebaseClients';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const [modalMode, setModalMode] = useState(null); 
  const [editingId, setEditingId] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [formData, setFormData] = useState({ 
    title: '', 
    price: '', 
    cat: 'bracelet', 
    badge: '', 
    img: '', 
    forSale: true 
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3500);
  };

  const fetchProducts = async () => {
    try {
      const prodSnapshot = await getDocs(collection(db, 'products'));
      setProducts(prodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setImageBase64(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = imageBase64 ? imageBase64 : formData.img;

      const productPayload = {
        ...formData,
        img: imageUrl,
        reviews: formData.reviews || '100 sold',
      };

      if (modalMode === 'edit' && editingId) {
        const docRef = doc(db, 'products', editingId);
        await updateDoc(docRef, productPayload);
        showNotification("Product updated successfully!");
      } else if (modalMode === 'add') {
        productPayload.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'products'), productPayload);
        showNotification("New product added successfully!");
      }

      closeModal();
      fetchProducts();
    } catch (error) {
      showNotification("Error saving product: " + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setImageBase64('');
    setFormData({ title: '', price: '', cat: 'bracelet', badge: '', img: '', forSale: true });
  };

  const handleEditClick = (product) => {
    setModalMode('edit');
    setEditingId(product.id);
    setImageBase64('');
    setFormData({
      title: product.title || '',
      price: product.price || '',
      cat: product.cat || 'bracelet',
      badge: product.badge || '',
      img: product.img || '',
      forSale: product.forSale ?? true
    });
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
    setImageBase64('');
    setFormData({ title: '', price: '', cat: 'bracelet', badge: '', img: '', forSale: true });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      showNotification("Product deleted.");
      fetchProducts();
    } catch (error) {
      showNotification("Error deleting product: " + error.message, 'error');
    }
  };

  const filteredProducts = products.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.cat?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {notification.message && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl shadow-xl text-white font-medium text-sm transition-all transform animate-bounce ${notification.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
          {notification.message}
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Product Inventory ({filteredProducts.length} / {products.length})</h2>
          <p className="text-sm text-gray-500">Management System analysis</p>
        </div>
        <div>
          <button 
            onClick={handleOpenAddModal}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
        <svg className="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by title or category..." 
          className="w-full bg-transparent focus:outline-none text-sm text-gray-800 placeholder-gray-400"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 bg-gray-100 rounded-lg cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Product Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b text-gray-500 bg-gray-50">
                <th className="p-3">Image</th>
                <th className="p-3">Title</th>
                <th className="p-3">Price</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <img 
                      src={item.img || 'https://via.placeholder.com/150?text=No+Image'} 
                      alt={item.title} 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                      className="w-10 h-10 object-cover rounded-lg bg-gray-100 border" 
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-900 line-clamp-1">{item.title}</td>
                  <td className="p-3 text-pink-600 font-semibold">{item.price}</td>
                  <td className="p-3 text-gray-500">{item.cat}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.forSale !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {item.forSale !== false ? 'For Sale' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button onClick={() => handleEditClick(item)} className="text-blue-600 hover:underline font-medium cursor-pointer">Edit</button>
                    <button onClick={() => handleDeleteProduct(item.id)} className="text-red-600 hover:underline font-medium cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">No matching products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Pearl Butterfly Necklace"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Price</label>
                  <input 
                    type="text" 
                    value={formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., $24.99"
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Category</label>
                  <select 
                    value={formData.cat} 
                    onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50"
                  >
                    <option value="bracelet">Bracelet</option>
                    <option value="necklace">Necklace</option>
                    <option value="hairclip">Hairclip</option>
                    <option value="hairtie">Hairtie</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Badge (Optional)</label>
                <input 
                  type="text" 
                  value={formData.badge} 
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g., New Arrival, Trending"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50" 
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Product Image File</label>
                <div className="flex items-center gap-4">
                  {(imageBase64 || formData.img) && (
                    <img src={imageBase64 || formData.img} alt="Current" className="w-14 h-14 object-cover rounded-xl border bg-gray-100 shrink-0" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 cursor-pointer border rounded-xl bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                <div>
                  <span className="font-semibold text-gray-900 block">Available for Sale</span>
                  <span className="text-xs text-gray-500">Uncheck to hide this product from the public shop page.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.forSale} 
                  onChange={(e) => setFormData({ ...formData, forSale: e.target.checked })}
                  className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold transition text-sm shadow-sm cursor-pointer"
                >
                  {loading ? 'Saving...' : modalMode === 'edit' ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}