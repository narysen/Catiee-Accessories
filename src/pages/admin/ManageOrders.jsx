import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebaseClients';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const orderList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(orderList);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
        setOrders(orders.filter(o => o.id !== orderId));
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading orders...</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Manage Orders</h1>
          <p className="text-xs text-gray-500">View and track customer purchases and payments.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xs border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b border-gray-100 font-bold uppercase tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-mono text-[11px] text-gray-500">{order.id.slice(0, 8)}...</td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{order.shippingName || 'Guest'}</p>
                      <p className="text-[11px] text-gray-400">{order.phone}</p>
                    </td>
                    <td className="p-4">
                      <div className="max-h-20 overflow-y-auto space-y-1.5 pr-2">
                        {order.cart?.map((item, idx) => {
                          const itemName = item.title || item.name || 'Unnamed Product';
                          return (
                            <div key={idx} className="flex items-center gap-2 text-[11px]">
                              {item.img || item.image ? (
                                <img 
                                  src={item.img || item.image} 
                                  alt={itemName} 
                                  className="w-6 h-6 object-cover rounded border border-gray-200 shrink-0" 
                                />
                              ) : null}
                              <div className="truncate">
                                <span className="font-bold text-gray-800">{itemName}</span>{' '}
                                <span className="text-pink-600 font-extrabold">(x{item.quantity || 1})</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-4 font-black text-gray-900">${order.totalPrice || order.totalAmount || '0.00'}</td>
                    <td className="p-4 uppercase font-semibold text-[10px] text-gray-500">{order.paymentMethod || 'BAKONGQR'}</td>
                    <td className="p-4">
                      <select 
                        value={order.status || 'Pending Verification'}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 font-semibold text-[11px] text-gray-700 focus:outline-pink-500 cursor-pointer"
                      >
                        <option value="Pending Verification">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-xl transition cursor-pointer"
                        title="Delete Order"
                      >
                        remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}