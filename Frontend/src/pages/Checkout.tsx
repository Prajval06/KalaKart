import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  CheckCircle, ChevronRight, MapPin, CreditCard,
  Smartphone, Banknote, Loader2, ShieldCheck,
  ArrowLeft, CircleCheck, ShoppingBag, Truck,
} from 'lucide-react';
import { products } from '../data/products';
import { useAppContext, type AddressData } from '../context/AppContext';
import { calculateShipping, calculatePlatformFee, type DeliveryZone, ZONE_LABELS } from '../utils/shipping';

/* ─────────────────────────── Progress Stepper ───────────────────────────── */
const PROGRESS_STEPS = ['Cart', 'Login', 'Address', 'Payment'];

function ProgressBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {PROGRESS_STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  backgroundColor: done
                    ? '#4A8C4A'
                    : active
                    ? 'var(--saffron)'
                    : 'var(--beige)',
                  color: done || active ? 'white' : 'var(--text-gray)',
                  border: active ? '3px solid rgba(180,140,90,0.3)' : 'none',
                }}
              >
                {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className="text-xs mt-1 whitespace-nowrap"
                style={{
                  color: active ? 'var(--saffron)' : done ? '#4A8C4A' : 'var(--text-gray)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </span>
            </div>
            {i < PROGRESS_STEPS.length - 1 && (
              <div
                className="h-0.5 w-12 sm:w-16 mx-1 mb-5 rounded-full transition-all"
                style={{ backgroundColor: i < current ? '#4A8C4A' : 'var(--beige)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Order Success Screen ──────────────────────── */
function OrderSuccess({
  orderNumber, itemCount,
}: {
  orderNumber: string;
  itemCount: number;
}) {
  const navigate = useNavigate();
  return (
    <div className="text-center py-12 px-4 max-w-md mx-auto">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: 'rgba(74,140,74,0.12)' }}
      >
        <CircleCheck className="w-12 h-12" style={{ color: '#4A8C4A' }} />
      </div>
      <h2 className="mb-2" style={{ color: 'var(--dark-brown)' }}>Order Placed! 🎉</h2>
      <p className="mb-1 text-sm" style={{ color: 'var(--text-gray)' }}>Order #{orderNumber}</p>
      <p className="mb-8" style={{ color: 'var(--text-gray)' }}>
        Your <strong style={{ color: 'var(--dark-brown)' }}>{itemCount} item{itemCount > 1 ? 's are' : ' is'}</strong> on the way. The artisan{itemCount > 1 ? 's have' : ' has'} been notified and will begin crafting your order shortly.
      </p>

      <div
        className="p-4 rounded-2xl mb-8 text-left space-y-2"
        style={{ backgroundColor: 'rgba(74,140,74,0.07)', border: '1px solid rgba(74,140,74,0.2)' }}
      >
        {[
          { icon: '📦', text: 'Order confirmation sent to your email' },
          { icon: '🧑‍🎨', text: 'Artisan will begin crafting within 24 hours' },
          { icon: '🚚', text: 'Expected delivery in 5–8 business days' },
        ].map(item => (
          <div key={item.text} className="flex items-start gap-3">
            <span>{item.icon}</span>
            <p className="text-sm" style={{ color: '#4A8C4A' }}>{item.text}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--saffron)' }}
        >
          Continue Shopping
        </button>
        <Link
          to="/"
          className="flex-1 py-3 rounded-xl font-semibold text-center border-2 hover:opacity-80 transition-opacity"
          style={{ borderColor: 'var(--saffron)', color: 'var(--saffron)' }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Checkout ──────────────────────────────── */
type CheckoutStep = 'address' | 'payment' | 'success';
type PaymentMethod = 'upi' | 'card' | 'cod';

const EMPTY_ADDRESS: AddressData = {
  name: '', phone: '', address: '', pincode: '', city: '', state: '',
};

export default function Checkout() {
  const navigate = useNavigate();
  const {
    cartItems, clearCart, currentUser, isLoggedIn,
    savedAddress, setSavedAddress,
  } = useAppContext();

  // Guard: not logged in → go back to cart
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--cream-bg)' }}>
        <div className="text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--saffron)' }} />
          <h2 className="mb-3">Login Required</h2>
          <p className="mb-6" style={{ color: 'var(--text-gray)' }}>Please login from your cart to place an order.</p>
          <button
            onClick={() => navigate('/cart')}
            className="px-6 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: 'var(--saffron)' }}
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  // Guard: empty cart → go browse
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--cream-bg)' }}>
        <div className="text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-gray)' }} />
          <h2 className="mb-3">Your Cart is Empty</h2>
          <p className="mb-6" style={{ color: 'var(--text-gray)' }}>Add some products before checking out.</p>
          <Link to="/" className="px-6 py-3 rounded-xl text-white font-semibold inline-block" style={{ backgroundColor: 'var(--saffron)' }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CheckoutInner
      currentUser={currentUser}
      savedAddress={savedAddress}
      onSaveAddress={setSavedAddress}
      onClearCart={clearCart}
    />
  );
}

/* ─── Inner component keeps hooks unconditional ──────────────────────────── */
function CheckoutInner({
  currentUser, savedAddress, onSaveAddress, onClearCart,
}: {
  currentUser: { email: string; name: string } | null;
  savedAddress: AddressData | null;
  onSaveAddress: (addr: AddressData) => void;
  onClearCart: () => void;
}) {
  const navigate = useNavigate();
  const { cartItems } = useAppContext();

  /* ── Cart products with quantities ── */
  const cartProducts = cartItems.map(item => ({
    ...products.find(p => p.id === item.productId)!,
    quantity: item.quantity,
  })).filter(item => item.id);

  /* ── Zone & pricing ── */
  const [zone, setZone] = useState<DeliveryZone>('regional');

  const subtotal = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping  = cartProducts.reduce((sum, item) => sum + calculateShipping(item.category, item.price, zone), 0);
  const platformFee = cartProducts.reduce((sum, item) => sum + calculatePlatformFee(item.price) * item.quantity, 0);

  /* ── Steps ── */
  const [step, setStep]                   = useState<CheckoutStep>('address');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [placing, setPlacing]             = useState(false);
  const [orderNumber, setOrderNumber]     = useState('');
  const [addressErrors, setAddressErrors] = useState<Partial<AddressData>>({});
  const [saveAddr, setSaveAddr]           = useState(false);

  /* ── Address form — pre-fill from saved address ── */
  const [form, setForm] = useState<AddressData>(() =>
    savedAddress
      ? { ...savedAddress }
      : { ...EMPTY_ADDRESS, name: currentUser?.name ?? '' }
  );

  /* ── Payment fields ── */
  const [upiId, setUpiId]     = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Progress index: address=2, payment=3
  const progressIndex = step === 'address' ? 2 : step === 'payment' ? 3 : 4;

  const codExtra = paymentMethod === 'cod' ? 25 : 0;
  const total    = subtotal + shipping + codExtra;

  const updateForm = (field: keyof AddressData, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (addressErrors[field]) setAddressErrors(e => ({ ...e, [field]: '' }));
  };

  const validateAddress = () => {
    const errs: Partial<AddressData> = {};
    if (!form.name.trim())    errs.name    = 'Name is required';
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Enter a valid 10-digit phone number';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode';
    if (!form.city.trim())    errs.city    = 'City is required';
    if (!form.state.trim())   errs.state   = 'State is required';
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddressContinue = () => {
    if (!validateAddress()) return;
    if (saveAddr) onSaveAddress(form);
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    await new Promise(r => setTimeout(r, 1200)); // mock payment processing
    const num = `KK${Date.now().toString().slice(-8).toUpperCase()}`;
    setOrderNumber(num);
    onClearCart();            // clear cart after successful order
    setStep('success');
    setPlacing(false);
  };

  /* ── Input style helper ── */
  const inputStyle: React.CSSProperties = {
    border: '1.5px solid var(--beige)',
    backgroundColor: 'white',
    color: 'var(--dark-brown)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    width: '100%',
    fontSize: '0.875rem',
    outline: 'none',
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--cream-bg)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Back link */}
        {step !== 'success' && (
          <button
            onClick={() => step === 'payment' ? setStep('address') : navigate('/cart')}
            className="flex items-center gap-2 mb-6 text-sm hover:opacity-70 transition-opacity"
            style={{ color: 'var(--saffron)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 'payment' ? 'Back to Address' : 'Back to Cart'}
          </button>
        )}

        {/* Progress */}
        <ProgressBar current={step === 'success' ? 4 : progressIndex} />

        {step === 'success' ? (
          <OrderSuccess
            orderNumber={orderNumber}
            itemCount={cartProducts.reduce((s, i) => s + i.quantity, 0)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ── Left: Form (3/5) ── */}
            <div className="lg:col-span-3">

              {/* ── ADDRESS STEP ── */}
              {step === 'address' && (
                <div
                  className="bg-white rounded-2xl p-7"
                  style={{ border: '1.5px solid var(--beige)' }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(180,140,90,0.1)' }}>
                      <MapPin className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
                    </div>
                    <div>
                      <h3 style={{ color: 'var(--dark-brown)' }}>Delivery Address</h3>
                      {savedAddress && (
                        <p className="text-xs" style={{ color: '#4A8C4A' }}>✔ Pre-filled from your saved address</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--dark-brown)' }}>Full Name *</label>
                      <input
                        style={inputStyle}
                        value={form.name}
                        onChange={e => updateForm('name', e.target.value)}
                        placeholder="Priya Sharma"
                        onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
                        onBlur={e => (e.target.style.borderColor = addressErrors.name ? '#C03030' : 'var(--beige)')}
                      />
                      {addressErrors.name && <p className="text-xs mt-1" style={{ color: '#C03030' }}>{addressErrors.name}</p>}
                    </div>

                    {/* Phone */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--dark-brown)' }}>Phone Number *</label>
                      <input
                        style={inputStyle}
                        value={form.phone}
                        onChange={e => updateForm('phone', e.target.value)}
                        placeholder="9876543210"
                        type="tel"
                        maxLength={10}
                        onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
                        onBlur={e => (e.target.style.borderColor = addressErrors.phone ? '#C03030' : 'var(--beige)')}
                      />
                      {addressErrors.phone && <p className="text-xs mt-1" style={{ color: '#C03030' }}>{addressErrors.phone}</p>}
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--dark-brown)' }}>Address *</label>
                      <textarea
                        style={{ ...inputStyle, resize: 'none', height: 80 }}
                        value={form.address}
                        onChange={e => updateForm('address', e.target.value)}
                        placeholder="House / Flat No., Street, Locality"
                        onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
                        onBlur={e => (e.target.style.borderColor = addressErrors.address ? '#C03030' : 'var(--beige)')}
                      />
                      {addressErrors.address && <p className="text-xs mt-1" style={{ color: '#C03030' }}>{addressErrors.address}</p>}
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--dark-brown)' }}>Pincode *</label>
                      <input
                        style={inputStyle}
                        value={form.pincode}
                        onChange={e => updateForm('pincode', e.target.value)}
                        placeholder="400001"
                        maxLength={6}
                        onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
                        onBlur={e => (e.target.style.borderColor = addressErrors.pincode ? '#C03030' : 'var(--beige)')}
                      />
                      {addressErrors.pincode && <p className="text-xs mt-1" style={{ color: '#C03030' }}>{addressErrors.pincode}</p>}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--dark-brown)' }}>City *</label>
                      <input
                        style={inputStyle}
                        value={form.city}
                        onChange={e => updateForm('city', e.target.value)}
                        placeholder="Mumbai"
                        onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
                        onBlur={e => (e.target.style.borderColor = addressErrors.city ? '#C03030' : 'var(--beige)')}
                      />
                      {addressErrors.city && <p className="text-xs mt-1" style={{ color: '#C03030' }}>{addressErrors.city}</p>}
                    </div>

                    {/* State */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--dark-brown)' }}>State *</label>
                      <input
                        style={inputStyle}
                        value={form.state}
                        onChange={e => updateForm('state', e.target.value)}
                        placeholder="Maharashtra"
                        onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
                        onBlur={e => (e.target.style.borderColor = addressErrors.state ? '#C03030' : 'var(--beige)')}
                      />
                      {addressErrors.state && <p className="text-xs mt-1" style={{ color: '#C03030' }}>{addressErrors.state}</p>}
                    </div>
                  </div>

                  {/* Save address checkbox */}
                  <label className="flex items-center gap-3 mt-5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveAddr}
                      onChange={e => setSaveAddr(e.target.checked)}
                      className="w-4 h-4 rounded accent-orange-500"
                      style={{ accentColor: 'var(--saffron)' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--dark-brown)' }}>
                      Save this address for future use
                    </span>
                  </label>

                  {/* Zone selector for shipping estimate */}
                  <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--beige)' }}>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--dark-brown)' }}>
                      <Truck className="w-4 h-4" style={{ color: 'var(--saffron)' }} />
                      Delivery Zone (for shipping estimate)
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {(Object.keys(ZONE_LABELS) as DeliveryZone[]).map(z => (
                        <button
                          key={z}
                          onClick={() => setZone(z)}
                          className="px-3 py-1.5 rounded-full text-sm transition-all"
                          style={
                            zone === z
                              ? { backgroundColor: 'var(--saffron)', color: 'white', fontWeight: 600 }
                              : { backgroundColor: 'var(--beige)', color: 'var(--dark-brown)' }
                          }
                        >
                          {ZONE_LABELS[z]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAddressContinue}
                    className="mt-6 w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--saffron)' }}
                  >
                    Continue to Payment <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── PAYMENT STEP ── */}
              {step === 'payment' && (
                <div
                  className="bg-white rounded-2xl p-7"
                  style={{ border: '1.5px solid var(--beige)' }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(180,140,90,0.1)' }}>
                      <CreditCard className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
                    </div>
                    <h3 style={{ color: 'var(--dark-brown)' }}>Payment Method</h3>
                  </div>

                  {/* Confirmed address strip */}
                  <div
                    className="flex items-start gap-3 p-3 rounded-xl mb-6 text-sm"
                    style={{ backgroundColor: 'rgba(74,140,74,0.07)', border: '1px solid rgba(74,140,74,0.18)' }}
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#4A8C4A' }} />
                    <div style={{ color: '#3A6A3A' }}>
                      <p className="font-semibold">{form.name} · {form.phone}</p>
                      <p>{form.address}, {form.city}, {form.state} — {form.pincode}</p>
                    </div>
                  </div>

                  {/* Method Selector */}
                  <div className="space-y-3 mb-6">
                    {[
                      { id: 'upi' as PaymentMethod, icon: <Smartphone className="w-5 h-5" />, label: 'UPI', sub: 'Pay via any UPI app — GPay, PhonePe, Paytm' },
                      { id: 'card' as PaymentMethod, icon: <CreditCard className="w-5 h-5" />, label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay accepted' },
                      { id: 'cod' as PaymentMethod, icon: <Banknote className="w-5 h-5" />, label: 'Cash on Delivery', sub: 'Pay when your order arrives (₹25 extra charge)' },
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                        style={{
                          border: paymentMethod === method.id
                            ? '2px solid var(--saffron)'
                            : '1.5px solid var(--beige)',
                          backgroundColor: paymentMethod === method.id
                            ? 'rgba(180,140,90,0.05)'
                            : 'white',
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: paymentMethod === method.id ? 'var(--saffron)' : 'var(--text-gray)' }}
                        >
                          {paymentMethod === method.id && (
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--saffron)' }} />
                          )}
                        </div>
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: 'rgba(180,140,90,0.1)', color: 'var(--saffron)' }}
                        >
                          {method.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--dark-brown)' }}>{method.label}</p>
                          <p className="text-xs" style={{ color: 'var(--text-gray)' }}>{method.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic payment detail fields */}
                  {paymentMethod === 'upi' && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--dark-brown)' }}>UPI ID</label>
                      <input
                        style={inputStyle}
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--beige)')}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-gray)' }}>You'll receive a payment request on your UPI app.</p>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-3 mb-6">
                      <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--dark-brown)' }}>Card Number</label>
                        <input
                          style={inputStyle}
                          value={cardNum}
                          onChange={e => setCardNum(e.target.value.replace(/\D/g, '').slice(0, 16))}
                          placeholder="1234 5678 9012 3456"
                          onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--beige)')}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--dark-brown)' }}>Expiry Date</label>
                          <input
                            style={inputStyle}
                            value={cardExp}
                            onChange={e => setCardExp(e.target.value)}
                            placeholder="MM / YY"
                            maxLength={7}
                            onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
                            onBlur={e => (e.target.style.borderColor = 'var(--beige)')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--dark-brown)' }}>CVV</label>
                          <input
                            style={inputStyle}
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            placeholder="•••"
                            maxLength={3}
                            type="password"
                            onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
                            onBlur={e => (e.target.style.borderColor = 'var(--beige)')}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div
                      className="mb-6 p-3 rounded-xl text-sm"
                      style={{ backgroundColor: 'rgba(180,140,90,0.08)', color: 'var(--dark-brown)' }}
                    >
                      💵 Pay ₹{total.toLocaleString('en-IN')} in cash when your order arrives. No prepayment needed.
                    </div>
                  )}

                  {/* Security note */}
                  <div
                    className="flex items-center gap-2 text-xs mb-5"
                    style={{ color: '#4A8C4A' }}
                  >
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    All transactions are encrypted and secure.
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70 transition-all"
                    style={{ backgroundColor: 'var(--saffron)' }}
                  >
                    {placing
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing Payment…</>
                      : <>Place Order · ₹{total.toLocaleString('en-IN')}</>
                    }
                  </button>
                </div>
              )}
            </div>

            {/* ── Right: Order Summary (2/5) ── */}
            <div className="lg:col-span-2">
              <div
                className="bg-white rounded-2xl p-6 sticky top-24"
                style={{ border: '1.5px solid var(--beige)' }}
              >
                <h3 className="mb-4" style={{ color: 'var(--dark-brown)' }}>
                  Order Summary
                  <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-gray)' }}>
                    ({cartProducts.reduce((s, i) => s + i.quantity, 0)} item{cartProducts.reduce((s, i) => s + i.quantity, 0) > 1 ? 's' : ''})
                  </span>
                </h3>

                {/* Product list */}
                <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                  {cartProducts.map(item => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs mb-0.5" style={{ color: 'var(--saffron)' }}>{item.category}</p>
                        <p className="text-sm font-semibold line-clamp-1" style={{ color: 'var(--dark-brown)' }}>{item.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-gray)' }}>by {item.artisan}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs" style={{ color: 'var(--text-gray)' }}>×{item.quantity}</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--dark-brown)' }}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing breakdown */}
                <div className="space-y-2 mb-4 pt-3" style={{ borderTop: '1px solid var(--beige)' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-gray)' }}>Product Total</span>
                    <span className="font-semibold" style={{ color: 'var(--dark-brown)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-gray)' }}>🚚 Shipping ({ZONE_LABELS[zone]})</span>
                    <span className="font-semibold" style={{ color: 'var(--dark-brown)' }}>₹{shipping.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: 'var(--text-gray)' }}>
                    <span>🏪 Platform fee (10%)</span>
                    <span>₹{platformFee.toLocaleString('en-IN')}</span>
                  </div>
                  {paymentMethod === 'cod' && step === 'payment' && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-gray)' }}>COD Charge</span>
                      <span className="font-semibold" style={{ color: 'var(--dark-brown)' }}>₹25</span>
                    </div>
                  )}
                  <div className="h-px" style={{ backgroundColor: 'var(--beige)' }} />
                  <div className="flex justify-between">
                    <span className="font-semibold" style={{ color: 'var(--dark-brown)' }}>Total Payable</span>
                    <span style={{ color: 'var(--saffron)', fontWeight: 700, fontSize: '1.1rem' }}>
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Trust badges */}
                <div
                  className="rounded-xl p-3 space-y-2"
                  style={{ backgroundColor: 'rgba(74,140,74,0.06)', border: '1px solid rgba(74,140,74,0.15)' }}
                >
                  {[
                    { emoji: '🔒', text: '100% Secure Payments' },
                    { emoji: '🎨', text: '100% Authentic Handmade' },
                    { emoji: '↩️', text: 'Easy Returns & Refunds' },
                  ].map(b => (
                    <div key={b.text} className="flex items-center gap-2">
                      <span className="text-sm">{b.emoji}</span>
                      <span className="text-xs" style={{ color: '#4A8C4A' }}>{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}