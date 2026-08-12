import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebaseClients';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';

export default function ManageMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, title: '', message: '', type: 'success', onConfirm: null });

  const fetchMessages = async () => {
    try {
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const messageList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messageList);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const showPopupModal = (title, message, type = 'success', onConfirm = null) => {
    setModal({ show: true, title, message, type, onConfirm });
  };

  const handleDelete = (id) => {
    showPopupModal(
      'Delete Message',
      'Are you sure you want to delete this customer message?',
      'error',
      async () => {
        try {
          await deleteDoc(doc(db, "messages", id));
          setMessages(messages.filter(msg => msg.id !== id));
          showPopupModal('Deleted', 'The message has been removed.', 'success');
        } catch (error) {
          console.error("Error deleting message:", error);
          showPopupModal('Error', 'Failed to delete message.', 'error');
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-5 text-center space-y-3 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">{modal.title}</h3>
            <p className="text-xs text-gray-500">{modal.message}</p>
            <div className="flex gap-2 pt-2">
              {modal.onConfirm && (
                <button
                  onClick={() => {
                    const cb = modal.onConfirm;
                    setModal({ show: false, title: '', message: '', type: 'success', onConfirm: null });
                    if (cb) cb();
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-xs font-medium cursor-pointer transition"
                >
                  Confirm
                </button>
              )}
              <button
                onClick={() => setModal({ show: false, title: '', message: '', type: 'success', onConfirm: null })}
                className="flex-1 bg-gray-900 hover:bg-black text-white py-2 rounded-xl text-xs font-medium cursor-pointer transition"
              >
                {modal.onConfirm ? 'Cancel' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Customer Messages</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage inquiries and feedback submitted via the Contact page.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 shadow-sm text-xs text-gray-400">
          Loading messages...
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 shadow-sm space-y-2">
          <h3 className="text-sm font-bold text-gray-800">No messages found</h3>
          <p className="text-xs text-gray-400">Customer contact inquiries will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200/60 text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {messages.map((msg) => {
                  const dateStr = msg.createdAt?.seconds 
                    ? new Date(msg.createdAt.seconds * 1000).toLocaleString() 
                    : 'Recent';

                  return (
                    <tr key={msg.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 px-4 font-bold text-gray-900">{msg.name}</td>
                      <td className="py-3 px-4 space-y-0.5">
                        <div className="text-gray-800">{msg.email}</div>
                        <div className="text-gray-400 text-[11px]">{msg.phone || 'No phone'}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-pink-600">{msg.subject}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-gray-500" title={msg.message}>
                        {msg.message}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-[11px]">{dateStr}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}&body=Hello ${encodeURIComponent(msg.name)},%0D%0A%0D%0AThank you for reaching out to Catie Accessories.%0D%0A%0D%0ARegarding your message: "${encodeURIComponent(msg.message)}"%0D%0A%0D%0A`}
                            className="bg-pink-50 hover:bg-pink-100 text-pink-600 px-3 py-1.5 rounded-xl font-medium transition inline-block"
                            title="Reply via Email"
                          >
                            Reply
                          </a>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}