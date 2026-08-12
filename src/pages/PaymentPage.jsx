import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { db } from '../lib/firebaseClients';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    shippingName, 
    phone, 
    address, 
    userEmail, 
    userId, 
    user, 
    cart, 
    totalPrice, 
    shippingFee 
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('bakongQR');
  const [qrString, setQrString] = useState('');
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [modal, setModal] = useState({ show: false, title: '', message: '', type: 'success' });

  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/cart');
      return;
    }

    // Safe direct string formatting for QR display
    try {
      const amountStr = parseFloat(totalPrice || 0).toFixed(2);
      const standardPayload = `https://bakong.khqr.gov.kh/payment?amount=${amountStr}&phone=${phone || '012345678'}&name=CatieAccessories`;
      setQrString(standardPayload);
    } catch (error) {
      console.error('Failed to generate KHQR string:', error);
    }
  }, [totalPrice, cart, navigate, phone]);

  const handleCompleteOrder = async () => {
    setLoadingOrder(true);
    
    // Resolve user identifiers defensively from multiple possible state shapes
    const finalUserId = userId || user?.uid || null;
    const finalUserEmail = userEmail || user?.email || null;

    try {
      await addDoc(collection(db, 'orders'), {
        userId: finalUserId, // Successfully captures the valid user ID now
        userEmail: finalUserEmail,
        shippingName,
        phone,
        address,
        cart,
        shippingFee,
        totalPrice,
        paymentMethod,
        createdAt: serverTimestamp(),
        status: 'Processing'
      });

      setModal({
        show: true,
        title: 'Order Placed Successfully!',
        message: 'Thank you for shopping with Catiee Accessories. Your order has been confirm.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving order:', error);
      setModal({
        show: true,
        title: 'Error',
        message: 'Failed to place order. Please try again.',
        type: 'error'
      });
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 px-4 sm:px-6 text-gray-800">
      
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 text-center space-y-4 border border-gray-100">
            
            <h3 className="text-base font-bold text-gray-900">{modal.title}</h3>
            <p className="text-xs text-gray-500">{modal.message}</p>
            <button
              onClick={() => {
                setModal({ show: false, title: '', message: '', type: 'success' });
                navigate('/profile', { state: { activeTab: 'orders' } });
              }}
              className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition"
            >
              View My Orders
            </button>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
          <div>
            <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">Secure Checkout</span>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Select Payment Method</h1>
          </div>
          <Link to="/cart" className="text-xs font-semibold text-pink-600 hover:text-pink-700 bg-pink-50 px-3.5 py-2 rounded-xl transition">
             Back to Cart
          </Link>
        </div>

        {/* Summary Box */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 space-y-3 text-xs">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-800">${(parseFloat(totalPrice || 0) - parseFloat(shippingFee || 1.50)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery Fee</span>
            <span className="font-semibold text-gray-800">${shippingFee || '1.50'}</span>
          </div>
          <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm font-black text-gray-900">
            <span>Total Amount</span>
            <span className="text-pink-600 text-xl">${totalPrice}</span>
          </div>
        </div>

        {/* Payment Tabs Selection */}
        <div className="grid grid-cols-3 gap-2 bg-gray-200/60 p-1.5 rounded-2xl">
          <button 
            type="button"
            onClick={() => setPaymentMethod('bakongQR')}
            className={`py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${paymentMethod === 'bakongQR' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Bakong QR
          </button>
          <button 
            type="button"
            onClick={() => setPaymentMethod('cod')}
            className={`py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${paymentMethod === 'cod' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Cash on Delivery
          </button>
          <button 
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${paymentMethod === 'card' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Credit Card
          </button>
        </div>

        {/* Dynamic Payment Content */}
        {paymentMethod === 'bakongQR' && (
          <div className="bg-white rounded-3xl p-8 shadow-xs border border-gray-200/80 text-center space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900">Scan QR Code with Bakong App</h3>
              <p className="text-[11px] text-gray-400">Supports ABA Bank, Acleda, Canadia, and all Bakong member apps.</p>
            </div>

            {/* QR Code container */}
            <div className="w-56 h-56 mx-auto bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner">
              {qrString ? (
                <QRCodeSVG value={qrString} size={180} />
              ) : (
                <div className="text-xs text-gray-400 animate-pulse">Generating KHQR...</div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-pink-600">${totalPrice}</p>
              <p className="text-[10px] text-gray-400">Your order will be verified automatically upon scan confirmation.</p>
            </div>
          </div>
        )}

        {paymentMethod === 'cod' && (
          <div className="bg-white rounded-3xl p-8 shadow-xs border border-gray-200/80 text-center space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Cash on Delivery Selected</h3>
            <p className="text-xs text-gray-500">Please prepare exact cash of <strong>${totalPrice}</strong> for our delivery courier upon receiving your package.</p>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="bg-white rounded-3xl p-8 shadow-xs border border-gray-200/80 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Credit / Debit Card</h3>
            <div className="space-y-3 text-left">
              <input type="text" placeholder="Card Number" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="MM / YY" className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs" />
                <input type="text" placeholder="CVV" className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs" />
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={handleCompleteOrder}
          disabled={loadingOrder}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-2xl transition shadow-xs text-xs cursor-pointer tracking-wide"
        >
          {loadingOrder ? 'Processing...' : `Pay $${totalPrice}`}
        </button>

      </div>
    </div>
  );
}