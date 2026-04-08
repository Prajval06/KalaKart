import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Home, Package, ShoppingBag, IndianRupee, Search, Bell, Plus,
  CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle, Edit2, Trash2,
  Lightbulb, ChevronRight, Menu, X, Truck, Star, ImageIcon, Save,
  Sparkles, ArrowRight, BookOpen, User,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { ArtisanProduct, SellerOrderStatus, SellerOrder } from '../context/types';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { useTranslation } from 'react-i18next';

// ─── Types ────────────────────────────────────────────────────────
type Section = 'home' | 'products' | 'orders' | 'earnings';
type DashboardProduct = ArtisanProduct & {
  readOnly?: boolean;
  sourceLabel?: string;
};

// ─── Product Modal ────────────────────────────────────────────────
interface ProductModalProps {
  editingProduct: ArtisanProduct | null;
  onClose: () => void;
  onSave: (product: ArtisanProduct) => void;
  onCreate: (data: Omit<ArtisanProduct, 'id'>) => void;
}

function ProductModal({ editingProduct, onClose, onSave, onCreate }: ProductModalProps) {
  const { t } = useTranslation();
  const isEdit = !!editingProduct;
  const [form, setForm] = useState({
    name: editingProduct?.name || '',
    price: editingProduct?.price?.toString() || '',
    stock: editingProduct?.stock?.toString() || '',
    category: editingProduct?.category || '',
    description: editingProduct?.description || '',
    status: editingProduct?.status || 'active',
  });

  // ── Image state ──
  const [images, setImages] = useState<string[]>(editingProduct?.images || []);
  const [dragOver, setDragOver] = useState(false);

  const suggestions: string[] = [];
  if (!form.name) suggestions.push(t('dashboard.suggestionClearName'));
  if (Number(form.price) > 5000) suggestions.push(t('dashboard.suggestionHighPrice'));
  if (!form.description || form.description.length < 20) suggestions.push(t('dashboard.suggestionDetailedDescription'));
  if (!form.category) suggestions.push(t('dashboard.suggestionSelectCategory'));
  if (images.length === 0) suggestions.push(t('dashboard.suggestionAddPhoto'));

  // Convert selected File objects → base64 strings and merge into state
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setImages(prev => (prev.includes(result) ? prev : [...prev, result]));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx));

  const setCover = (idx: number) =>
    setImages(prev => [prev[idx], ...prev.filter((_, i) => i !== idx)]);

  const FALLBACK = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400';

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.category) return;
    const primaryImage = images[0] || FALLBACK;
    const base = {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      category: form.category,
      description: form.description,
      image: primaryImage,
      images,
      status: form.status as 'active' | 'draft',
    };
    if (isEdit && editingProduct) {
      onSave({ ...editingProduct, ...base });
    } else {
      onCreate(base);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ color: 'var(--dark-brown)' }}>{isEdit ? t('dashboard.editProduct') : t('dashboard.addNewProduct')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        {suggestions.length > 0 && (
          <div className="mb-5 p-3 rounded-xl" style={{ backgroundColor: '#FFF8E1' }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--rust-red)' }}>
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm" style={{ fontWeight: 600 }}>{t('dashboard.smartSuggestions')}</span>
            </div>
            {suggestions.map((s, i) => <p key={i} className="text-sm text-gray-700 ml-6">• {s}</p>)}
          </div>
        )}

        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('dashboard.productName')} *</label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder={t('dashboard.productNamePlaceholder')}
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('dashboard.price')} (₹) *</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">{t('dashboard.stock')}</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('dashboard.category')} *</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 bg-white"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              <option value="">{t('dashboard.selectCategory')}</option>
              {[
                'Art & Paintings',
                'Pottery & Ceramics',
                'Textiles & Fabrics',
                'Jewelry',
                'Home Decor',
                'Clothing',
                'Crafts & Weaving',
                'Miniatures',
              ].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('dashboard.description')}</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 resize-none"
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder={t('dashboard.describeProduct')}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('dashboard.status')}</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 bg-white"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'draft' })}
            >
              <option value="active">{t('dashboard.activeVisible')}</option>
              <option value="draft">{t('dashboard.draftHidden')}</option>
            </select>
          </div>

          {/* ── Image Upload ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-700">
                {t('dashboard.productPhotos')}
                {images.length > 0 && (
                  <span className="ml-2 text-xs text-gray-600">({t('dashboard.photosAdded', { count: images.length })})</span>
                )}
              </label>
            </div>

            {/* Hidden file input */}
            <input
              id="img-gallery"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => addFiles(e.target.files)}
            />

            {/* Upload button */}
            <div className="mb-3">
              <label
                htmlFor="img-gallery"
                className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all hover:opacity-80 text-sm"
                style={{
                  borderColor: 'var(--sage-green)',
                  color: 'var(--sage-green)',
                  backgroundColor: '#F0FFF4',
                }}
              >
                <span className="text-base">🖼️</span>
                {t('dashboard.addFromPhotos')}
              </label>
            </div>

            {/* Drop zone (shows when no images yet) */}
            {images.length === 0 && (
              <div
                className="rounded-xl border-2 border-dashed p-8 text-center transition-all"
                style={{
                  borderColor: dragOver ? 'var(--sage-green)' : '#e5e7eb',
                  backgroundColor: dragOver ? '#F0FFF4' : '#fafafa',
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragOver(false);
                  addFiles(e.dataTransfer.files);
                }}
              >
                <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-600">{t('dashboard.dragDropPhotos')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('dashboard.photoFormats')}</p>
              </div>
            )}

            {/* Preview grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden group"
                    style={{ aspectRatio: '1', border: idx === 0 ? '2px solid var(--sage-green)' : '2px solid transparent' }}
                  >
                    <ImageWithFallback src={src} alt="" className="w-full h-full object-cover" />

                    {/* Cover badge */}
                    {idx === 0 && (
                      <span
                        className="absolute top-1 left-1 text-white text-xs px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--sage-green)', fontSize: 9, fontWeight: 700 }}
                      >
                        COVER
                      </span>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                      {idx !== 0 && (
                        <button
                          onClick={() => setCover(idx)}
                          className="text-white text-xs px-2 py-1 rounded-lg"
                          style={{ backgroundColor: 'var(--sage-green)', fontSize: 10, fontWeight: 600 }}
                          title={t('dashboard.setAsCover')}
                        >
                          {t('dashboard.cover')}
                        </button>
                      )}
                      <button
                        onClick={() => removeImage(idx)}
                        className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        title={t('dashboard.remove')}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add more tile */}
                {images.length < 10 && (
                  <label
                    htmlFor="img-gallery"
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-gray-400 transition-colors text-gray-300"
                    style={{ aspectRatio: '1' }}
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-xs mt-1">{t('dashboard.addMore')}</span>
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            {t('dashboard.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 rounded-xl text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: form.name && form.price && form.category ? 'var(--sage-green)' : '#9ca3af' }}
          >
            {isEdit ? t('dashboard.saveChanges') : t('dashboard.addProduct')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NEW ARTISAN: Onboarding / Empty-state ─────────────────────────────────

interface NewArtisanHomeProps {
  userName: string;
  onAddProduct: () => void;
  onGoToProfile: () => void;
}

function NewArtisanHome({ userName, onAddProduct, onGoToProfile }: NewArtisanHomeProps) {
  const { t } = useTranslation();
  const firstName = userName.split(' ')[0];

  const steps = [
    {
      icon: Package,
      color: 'var(--sage-green)',
      bg: '#F0FFF4',
      title: t('dashboard.addFirstProduct'),
      desc: t('dashboard.addFirstProductDesc'),
      cta: t('dashboard.addProduct'),
      action: onAddProduct,
    },
    {
      icon: BookOpen,
      color: 'var(--rust-red)',
      bg: '#FFF0F0',
      title: t('dashboard.setupProfile'),
      desc: t('dashboard.setupProfileDesc'),
      cta: t('dashboard.setupProfile'),
      action: onGoToProfile,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div
        className="rounded-3xl p-8 relative overflow-hidden"
        style={{
          backgroundColor: '#B5851A',
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-sm text-yellow-200" style={{ fontWeight: 500 }}>{t('dashboard.welcomeToKalaKart')}</span>
          </div>
          <h1 className="text-white text-2xl sm:text-3xl mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
            Namaste, {firstName}! 🙏
          </h1>
          <p className="text-white/90 text-sm sm:text-base max-w-md leading-relaxed">
            {t('dashboard.storeReady')}
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white" />
        <div className="absolute top-4 right-16 w-20 h-20 rounded-full opacity-10 bg-white" />
      </div>

      {/* Zero-state KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('dashboard.totalEarnings'), value: '₹0', icon: IndianRupee, color: 'var(--sage-green)' },
          { label: t('dashboard.orders'), value: '0', icon: ShoppingBag, color: 'var(--peach-pink)' },
          { label: t('dashboard.products'), value: '0', icon: Package, color: 'var(--dark-brown)' },
          { label: t('dashboard.alerts'), value: '—', icon: AlertTriangle, color: 'var(--rust-red)' },
        ].map(kpi => {
          const KIcon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl p-5 shadow-sm opacity-70 border"
              style={{ borderColor: '#EFE4D2' }}
              title={t('dashboard.dataWillAppear')}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: kpi.color }}>
                  <KIcon className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-700">{kpi.label}</span>
              </div>
              <p className="text-2xl" style={{ color: 'var(--dark-brown)', fontWeight: 700 }}>{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Onboarding cards */}
      <div>
        <h3 className="mb-4" style={{ color: 'var(--dark-brown)' }}>{t('dashboard.getStartedSteps')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((step, i) => {
            const SIcon = step.icon;
            return (
              <div
                key={step.title}
                className="bg-white rounded-2xl p-6 shadow-sm border flex flex-col gap-4 hover:shadow-md transition-shadow"
                style={{ borderColor: '#EFE4D2', borderTop: `3px solid ${step.color}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: step.bg }}
                  >
                    <SIcon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  <span
                    className="text-xs font-bold rounded-full px-2 py-0.5 text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {t('dashboard.step', { count: i + 1 })}
                  </span>
                </div>
                <div>
                  <h4 className="mb-1" style={{ color: 'var(--dark-brown)', fontWeight: 700, fontSize: '0.95rem' }}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{step.desc}</p>
                </div>
                <button
                  onClick={step.action}
                  className="mt-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: step.color }}
                >
                  {step.cta} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: '#EFE4D2' }}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5" style={{ color: 'var(--rust-red)' }} />
          <h3 style={{ color: 'var(--dark-brown)' }}>{t('dashboard.quickTips')}</h3>
        </div>
        <div className="space-y-3">
          {[
            'Use natural lighting for product photos — it increases sales by up to 40%',
            'Write detailed descriptions mentioning the craft tradition and materials used',
            'Price competitively at first, then increase as you build reviews',
            'Respond to orders within 24 hours to earn the "Fast Seller" badge',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: 'var(--sage-green)', fontSize: 10, fontWeight: 700 }}
              >
                {i + 1}
              </span>
              <p className="text-sm text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── EXISTING ARTISAN: Home Section ───────────────────────────────
interface ExistingArtisanHomeProps {
  products: ArtisanProduct[];
  orders: SellerOrder[];
  totalEarnings: number;
  onAcceptOrder: (id: string) => void;
  onAddProduct: () => void;
  onViewOrders: () => void;
  storeStory: string;
  onSaveStory: (s: string) => void;
}

function ExistingArtisanHome({
  products, orders, totalEarnings,
  onAcceptOrder, onAddProduct, onViewOrders,
  storeStory, onSaveStory,
}: ExistingArtisanHomeProps) {
  const { t } = useTranslation();
  const [editingStory, setEditingStory] = useState(false);
  const [draft, setDraft] = useState(storeStory);

  const newOrders = orders.filter(o => o.status === 'new');
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 3);
  const outOfStock = products.filter(p => p.stock === 0);
  const alerts = lowStock.length + outOfStock.length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('dashboard.totalEarnings'), value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'var(--sage-green)' },
          { label: t('dashboard.orders'), value: orders.length.toString(), icon: ShoppingBag, color: 'var(--peach-pink)' },
          { label: t('dashboard.products'), value: products.length.toString(), icon: Package, color: 'var(--dark-brown)' },
          { label: t('dashboard.alerts'), value: alerts.toString(), icon: AlertTriangle, color: 'var(--rust-red)' },
        ].map(kpi => {
          const KIcon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow" style={{ borderColor: '#EFE4D2' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: kpi.color }}>
                  <KIcon className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-700">{kpi.label}</span>
              </div>
              <p className="text-2xl" style={{ color: 'var(--dark-brown)', fontWeight: 700 }}>{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onAddProduct}
          className="flex items-center justify-center gap-3 py-4 rounded-2xl text-white transition-all hover:opacity-90 shadow-sm"
          style={{ backgroundColor: 'var(--sage-green)', boxShadow: '0 10px 18px rgba(74,140,74,0.2)' }}
        >
          <Plus className="w-5 h-5" /> {t('dashboard.addProduct')}
        </button>
        <button
          onClick={onViewOrders}
          className="flex items-center justify-center gap-3 py-4 rounded-2xl text-white transition-all hover:opacity-90 shadow-sm"
          style={{ backgroundColor: 'var(--rust-red)', boxShadow: '0 10px 18px rgba(140,74,54,0.2)' }}
        >
          <ShoppingBag className="w-5 h-5" /> {t('dashboard.viewOrders')}
        </button>
      </div>

      {/* New Orders */}
      {newOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#EFE4D2' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0ebe0' }}>
            <h3 style={{ color: 'var(--dark-brown)' }}>{t('dashboard.newOrders')}</h3>
            <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: 'var(--rust-red)' }}>
              {t('dashboard.newCount', { count: newOrders.length })}
            </span>
          </div>
          {newOrders.map(order => (
            <div key={order.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #f5f0e5' }}>
              <div className="flex items-center gap-3">
                <ImageWithFallback src={order.productImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <p className="text-sm" style={{ color: 'var(--dark-brown)', fontWeight: 600 }}>{order.product}</p>
                  <p className="text-xs text-gray-700">{order.customer} • ₹{order.amount.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <button
                onClick={() => onAcceptOrder(order.id)}
                className="px-4 py-2 rounded-xl text-sm text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--sage-green)' }}
              >
                {t('dashboard.accept')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border" style={{ borderColor: '#EFE4D2' }}>
        <h3 className="mb-4" style={{ color: 'var(--dark-brown)' }}>{t('dashboard.recentActivity')}</h3>
        {outOfStock.length === 0 && lowStock.length === 0 && orders.filter(o => o.status === 'completed').length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-4">{t('dashboard.noRecentActivity')}</p>
        ) : (
          <div className="space-y-3">
            {outOfStock.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-gray-700"><span style={{ fontWeight: 600 }}>{p.name}</span> is <span className="text-red-600" style={{ fontWeight: 600 }}>Out of Stock</span></p>
              </div>
            ))}
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#FFF8E1' }}>
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-sm text-gray-700"><span style={{ fontWeight: 600 }}>{p.name}</span> — <span className="text-amber-600" style={{ fontWeight: 600 }}>Low Stock</span> ({p.stock} left)</p>
              </div>
            ))}
            {orders.filter(o => o.status === 'completed').slice(0, 2).map(o => (
              <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F0FFF4' }}>
                <TrendingUp className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-sm text-gray-700">
                  Order <span style={{ fontWeight: 600 }}>#{o.id}</span> for <span style={{ fontWeight: 600 }}>{o.product}</span> completed — ₹{o.amount.toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Store Story */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border" style={{ borderColor: '#EFE4D2' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ color: 'var(--dark-brown)' }}>{t('dashboard.storeStory')}</h3>
          {!editingStory ? (
            <button onClick={() => { setEditingStory(true); setDraft(storeStory); }} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Edit2 className="w-4 h-4 text-gray-500" />
            </button>
          ) : (
            <button
              onClick={() => { onSaveStory(draft); setEditingStory(false); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: 'var(--sage-green)' }}
            >
              <Save className="w-3.5 h-3.5" /> {t('dashboard.save')}
            </button>
          )}
        </div>
        {editingStory ? (
          <textarea
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 resize-none text-sm text-gray-700"
            rows={3}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={t('dashboard.storeStoryPlaceholder')}
          />
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed italic">"{storeStory}"</p>
        )}
      </div>
    </div>
  );
}

// ─── Products Section ──────────────────────────────────────────────
interface ProductsSectionProps {
  products: DashboardProduct[];
  search: string;
  onEdit: (p: ArtisanProduct) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

function ProductsSection({ products, search, onEdit, onDelete, onAdd }: ProductsSectionProps) {
  const { t } = useTranslation();
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 style={{ color: 'var(--dark-brown)' }}>{t('dashboard.yourProducts')}</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--sage-green)' }}
        >
          <Plus className="w-4 h-4" /> {t('dashboard.addProduct')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#EFE4D2' }}>
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-14 h-14 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-700 mb-1" style={{ fontWeight: 600 }}>{t('dashboard.noProductsYet')}</p>
            <p className="text-sm text-gray-600 mb-5">{t('dashboard.listingsAppear')}</p>
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--sage-green)' }}
            >
              <Plus className="w-4 h-4" /> {t('dashboard.addFirstProduct')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--cream-bg)' }}>
                  {[t('dashboard.product'), t('dashboard.price'), t('dashboard.stock'), t('dashboard.status'), t('dashboard.actions')].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-sm" style={{ color: 'var(--dark-brown)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm" style={{ fontWeight: 600, color: 'var(--dark-brown)' }}>{p.name}</p>
                          <p className="text-xs text-gray-700">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ fontWeight: 600 }}>₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      {p.readOnly ? (
                        <span className="text-xs text-gray-700">{t('dashboard.managedInCatalog')}</span>
                      ) : (
                        <span className={`text-sm ${p.stock === 0 ? 'text-red-600' : p.stock <= 3 ? 'text-amber-600' : 'text-gray-700'}`} style={{ fontWeight: p.stock <= 3 ? 600 : 400 }}>
                          {p.stock === 0 ? t('dashboard.outOfStock') : p.stock <= 3 ? t('dashboard.lowStockCount', { count: p.stock }) : p.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`} style={{ fontWeight: 500 }}>
                        {p.sourceLabel || (p.status === 'active' ? t('dashboard.active') : t('dashboard.draft'))}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {p.readOnly ? (
                          <span className="text-xs text-gray-700">{t('dashboard.readOnly')}</span>
                        ) : (
                          <>
                            <button onClick={() => onEdit(p)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                              <Edit2 className="w-4 h-4 text-gray-500" />
                            </button>
                            <button onClick={() => onDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Orders Section ────────────────────────────────────────────────
interface OrdersSectionProps {
  orders: SellerOrder[];
  orderTab: SellerOrderStatus;
  setOrderTab: (tab: SellerOrderStatus) => void;
  onOrderAction: (id: string, status: SellerOrderStatus) => void;
}

function OrdersSection({ orders, orderTab, setOrderTab, onOrderAction }: OrdersSectionProps) {
  const { t } = useTranslation();
  const tabs: { key: SellerOrderStatus; label: string }[] = [
    { key: 'new', label: t('dashboard.new') },
    { key: 'processing', label: t('dashboard.processing') },
    { key: 'completed', label: t('dashboard.completed') },
  ];
  const filtered = orders.filter(o => o.status === orderTab);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setOrderTab(t.key)}
            className="px-5 py-2.5 rounded-xl text-sm transition-all"
            style={{
              backgroundColor: orderTab === t.key ? 'var(--dark-brown)' : 'white',
              color: orderTab === t.key ? 'white' : 'var(--dark-brown)',
              fontWeight: orderTab === t.key ? 600 : 400,
              boxShadow: orderTab !== t.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {t.label} ({orders.filter(o => o.status === t.key).length})
          </button>
        ))}
      </div>

      {orderTab === 'new' && filtered.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ backgroundColor: '#FFF8E1', color: 'var(--rust-red)' }}>
          <Clock className="w-4 h-4 shrink-0" />
          <span>{t('dashboard.shipWithin24h')}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#EFE4D2' }}>
        {filtered.length === 0 ? (
          <div className="p-14 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-700 text-sm" style={{ fontWeight: 500 }}>{t('dashboard.noOrdersForTab', { tab: orderTab })}</p>
            {orderTab === 'new' && <p className="text-gray-600 text-xs mt-1">{t('dashboard.newOrdersAppear')}</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--cream-bg)' }}>
                  {[t('dashboard.orderId'), t('dashboard.product'), t('dashboard.customer'), t('dashboard.amount'), t('dashboard.date'), t('dashboard.actions')].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-sm" style={{ color: 'var(--dark-brown)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-t border-gray-100 hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-4 text-sm" style={{ fontWeight: 600 }}>{o.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback src={o.productImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <span className="text-sm" style={{ fontWeight: 500 }}>{o.product}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{o.customer}</td>
                    <td className="px-5 py-4 text-sm" style={{ fontWeight: 600, color: 'var(--rust-red)' }}>₹{o.amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-4">
                      {o.status === 'new' && (
                        <div className="flex gap-2">
                          <button onClick={() => onOrderAction(o.id, 'processing')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white hover:opacity-90" style={{ backgroundColor: 'var(--sage-green)' }}>
                            <CheckCircle className="w-3.5 h-3.5" /> {t('dashboard.accept')}
                          </button>
                          <button onClick={() => onOrderAction(o.id, 'completed')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white hover:opacity-90" style={{ backgroundColor: 'var(--rust-red)' }}>
                            <XCircle className="w-3.5 h-3.5" /> {t('dashboard.decline')}
                          </button>
                        </div>
                      )}
                      {o.status === 'processing' && (
                        <button onClick={() => onOrderAction(o.id, 'completed')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white hover:opacity-90" style={{ backgroundColor: 'var(--dark-brown)' }}>
                          <Truck className="w-3.5 h-3.5" /> {t('dashboard.markShipped')}
                        </button>
                      )}
                      {o.status === 'completed' && (
                        <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700" style={{ fontWeight: 500 }}>{t('dashboard.done')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Earnings Section ──────────────────────────────────────────────
interface EarningsSectionProps {
  orders: SellerOrder[];
}

function EarningsSection({ orders }: EarningsSectionProps) {
  const { t } = useTranslation();
  const completed = orders.filter(o => o.status === 'completed');
  const totalEarnings = completed.reduce((sum, o) => sum + o.amount, 0);
  // Simulate platform fee: 8%
  const availableBalance = Math.round(totalEarnings * 0.92);

  if (completed.length === 0) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: t('dashboard.totalEarned'), value: '₹0', sub: t('dashboard.completeOrdersToSeeEarnings'), color: 'var(--dark-brown)' },
            { label: t('dashboard.availableBalance'), value: '₹0', sub: t('dashboard.withdrawalsAfterFirstSale'), color: 'var(--sage-green)' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border opacity-70" style={{ borderColor: '#EFE4D2' }}>
              <p className="text-sm text-gray-700 mb-1">{c.label}</p>
              <p className="text-3xl" style={{ color: c.color, fontWeight: 700 }}>{c.value}</p>
              <p className="text-xs mt-2 text-gray-600">{c.sub}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-10 shadow-sm border text-center" style={{ borderColor: '#EFE4D2' }}>
          <IndianRupee className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-700" style={{ fontWeight: 600 }}>{t('dashboard.noTransactionsYet')}</p>
          <p className="text-sm text-gray-600 mt-1">{t('dashboard.earningsAppear')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: '#EFE4D2' }}>
          <p className="text-sm text-gray-700 mb-1">{t('dashboard.totalEarned')}</p>
          <p className="text-3xl" style={{ color: 'var(--dark-brown)', fontWeight: 700 }}>₹{totalEarnings.toLocaleString('en-IN')}</p>
          <p className="text-xs mt-2 text-green-600 flex items-center gap-1" style={{ fontWeight: 500 }}>
            <TrendingUp className="w-3.5 h-3.5" /> {t('dashboard.completedOrdersCount', { count: completed.length })}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: '#EFE4D2' }}>
          <p className="text-sm text-gray-700 mb-1">{t('dashboard.availableBalance')}</p>
          <p className="text-3xl" style={{ color: 'var(--sage-green)', fontWeight: 700 }}>₹{availableBalance.toLocaleString('en-IN')}</p>
          <p className="text-xs mt-2 text-gray-600 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" /> {t('dashboard.afterPlatformFee')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#EFE4D2' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0ebe0' }}>
          <h3 style={{ color: 'var(--dark-brown)' }}>{t('dashboard.transactionHistory')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--cream-bg)' }}>
                {[t('dashboard.date'), t('dashboard.orderId'), t('dashboard.product'), t('dashboard.amount')].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-sm" style={{ color: 'var(--dark-brown)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completed.map(o => (
                <tr key={o.id} className="border-t border-gray-100 hover:bg-amber-50/30 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ fontWeight: 500 }}>{o.id}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{o.product}</td>
                  <td className="px-5 py-4 text-sm" style={{ fontWeight: 600, color: 'var(--sage-green)' }}>+ ₹{o.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────
export default function SellerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    currentUser,
    artisanProducts, artisanOrders,
    getDbProducts, getCompletedArtisanProfiles,
    addArtisanProduct, updateArtisanProduct, deleteArtisanProduct, updateArtisanOrder,
  } = useAppContext();

  const [section, setSection] = useState<Section>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [smartIdx, setSmartIdx] = useState(0);
  const [orderTab, setOrderTab] = useState<SellerOrderStatus>('new');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ArtisanProduct | null>(null);
  const [storeStory, setStoreStory] = useState(
    () => localStorage.getItem(`kk_story_${currentUser?.email}`) || ''
  );

  const ownArtisanProducts = useMemo(() => {
    const ownerEmail = String(currentUser?.email || '').toLowerCase();
    return artisanProducts.filter((product) => {
      const productOwner = String(product.artisanOwnerEmail || '').toLowerCase();
      return !!productOwner && productOwner === ownerEmail;
    });
  }, [artisanProducts, currentUser?.email]);

  const assignedCatalogProducts = useMemo(() => {
    const ownerEmail = String(currentUser?.email || '').toLowerCase();
    const ownerName = String(currentUser?.name || '').trim().toLowerCase();
    const profiles = getCompletedArtisanProfiles();
    const matchedProfile = profiles.find((profile) => String(profile.email || '').toLowerCase() === ownerEmail);
    const ownerIds = new Set(
      [
        String(matchedProfile?.userId || '').trim(),
        ownerEmail,
      ].filter(Boolean)
    );

    return getDbProducts()
      .filter((product) => {
        const productArtisanId = String(product.artisanId || '').trim();
        const productArtisanName = String(product.artisan || '').trim().toLowerCase();
        return ownerIds.has(productArtisanId) || (!!ownerName && productArtisanName === ownerName);
      })
      .map((product) => ({
        id: `assigned-${product.id}`,
        name: product.name,
        price: product.price,
        stock: 0,
        image: product.image,
        images: [product.image],
        category: product.category,
        description: product.description,
        status: product.isAvailable === false ? 'draft' : 'active',
        artisanOwnerEmail: ownerEmail,
        artisanOwnerName: currentUser?.name || 'KalaKart Artisan',
        artisanOwnerId: String(matchedProfile?.userId || ownerEmail),
        readOnly: true,
        sourceLabel: 'Assigned',
      } as DashboardProduct));
  }, [currentUser?.email, currentUser?.name, getCompletedArtisanProfiles, getDbProducts]);

  const dashboardProducts = useMemo<DashboardProduct[]>(() => {
    const merged = [...assignedCatalogProducts, ...ownArtisanProducts.map((product) => ({
      ...product,
      readOnly: false,
      sourceLabel: product.status === 'active' ? 'Manual' : 'Manual Draft',
    }))];
    return merged;
  }, [assignedCatalogProducts, ownArtisanProducts]);

  const effectiveIsNewArtisan = dashboardProducts.length === 0 && artisanOrders.length === 0;

  // Guard: redirect if not logged in or not a seller
  useEffect(() => {
    if (!currentUser) { navigate('/auth'); return; }
    if (currentUser.userType !== 'seller') { navigate('/'); }
  }, [currentUser, navigate]);

  // Rotate smart tips
  const tips = effectiveIsNewArtisan
    ? [
        { text: t('dashboard.tipAddFirstProduct'), icon: Package },
        { text: t('dashboard.tipCompleteStory'), icon: BookOpen },
        { text: t('dashboard.tipMorePhotos'), icon: ImageIcon },
        { text: t('dashboard.tipCompleteProfile'), icon: Star },
      ]
    : [
        { text: t('dashboard.tipRespondQuickly'), icon: ShoppingBag },
        { text: t('dashboard.tipRestockSoon'), icon: AlertTriangle },
        { text: t('dashboard.tipMoreImages'), icon: ImageIcon },
        { text: t('dashboard.tipTrackEarnings'), icon: TrendingUp },
      ];
  useEffect(() => {
    const t = setInterval(() => setSmartIdx(i => (i + 1) % tips.length), 5000);
    return () => clearInterval(t);
  }, [tips.length]);

  const totalEarnings = artisanOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);

  const newOrdersCount = artisanOrders.filter(o => o.status === 'new').length;

  const handleSaveStory = (s: string) => {
    setStoreStory(s);
    if (currentUser?.email) localStorage.setItem(`kk_story_${currentUser.email}`, s);
  };

  const currentMsg = tips[smartIdx];
  const SmartIcon = currentMsg.icon;

  const navItems: { key: Section; label: string; icon: typeof Home }[] = [
    { key: 'home', label: t('dashboard.home'), icon: Home },
    { key: 'products', label: t('dashboard.products'), icon: Package },
    { key: 'orders', label: t('dashboard.orders'), icon: ShoppingBag },
    { key: 'earnings', label: t('dashboard.earnings'), icon: IndianRupee },
  ];

  // User initials for avatar
  const name = currentUser?.name || 'Artisan';
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  if (!currentUser) return null;

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: 'radial-gradient(circle at top left, #F5EAD8 0%, #F8F4EA 40%, #F4EFE6 100%)',
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-4 left-0 z-50 lg:z-auto h-screen lg:h-[calc(100vh-2rem)] w-64 p-5 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:ml-4 lg:rounded-3xl lg:shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'linear-gradient(180deg, #8B4513 0%, #6F3210 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-white text-lg" style={{ fontFamily: "'Cinzel', serif" }}>KALAKART</h2>
            <p className="text-xs" style={{ color: 'var(--peach-pink)', fontFamily: "'Tiro Devanagari Hindi', serif" }}>कारीगर कार्ट</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(item => {
            const NIcon = item.icon;
            const active = section === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setSection(item.key); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: active ? 'white' : 'rgba(255,255,255,0.82)',
                  boxShadow: active ? 'inset 0 0 0 1px rgba(255,255,255,0.2)' : 'none',
                }}
              >
                <NIcon className="w-5 h-5" />
                <span className="text-sm" style={{ fontWeight: active ? 600 : 400 }}>{item.label}</span>
                {item.key === 'orders' && newOrdersCount > 0 && (
                  <span className="ml-auto w-5 h-5 flex items-center justify-center rounded-full text-xs text-white" style={{ backgroundColor: 'var(--rust-red)', fontSize: 10 }}>
                    {newOrdersCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Real user profile */}
        <div className="mt-auto pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.14)' }}>
          <div className="flex items-center gap-3">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm text-white" style={{ backgroundColor: 'var(--sage-green)', fontWeight: 600 }}>
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm text-white truncate" style={{ fontWeight: 500 }}>{name}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.78)' }}>{currentUser.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pr-4">
        {/* Top Navbar */}
        <header
          className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center gap-3 border-b"
          style={{
            backgroundColor: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(10px)',
            borderBottomColor: 'rgba(139,69,19,0.08)',
          }}
        >
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" style={{ color: 'var(--dark-brown)' }} />
          </button>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
              placeholder={t('dashboard.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                borderColor: '#E8DFCF',
                backgroundColor: 'rgba(255,255,255,0.95)',
                boxShadow: '0 1px 0 rgba(0,0,0,0.02)',
              }}
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                style={{ border: '1px solid #EFE4D2', backgroundColor: 'rgba(255,255,255,0.9)' }}
              >
                <Bell className="w-5 h-5" style={{ color: 'var(--dark-brown)' }} />
                {newOrdersCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--rust-red)' }} />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0ebe0' }}>
                    <p className="text-sm" style={{ fontWeight: 600, color: 'var(--dark-brown)' }}>{t('dashboard.notifications')}</p>
                  </div>
                  {newOrdersCount > 0 ? (
                    artisanOrders.filter(o => o.status === 'new').slice(0, 5).map(o => (
                      <div key={o.id} className="px-4 py-3 hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #f9f5eb' }}>
                        <p className="text-sm text-gray-700">{t('dashboard.newOrderFrom', { customer: o.customer, product: o.product })}</p>
                        <p className="text-xs text-gray-600 mt-1">₹{o.amount.toLocaleString('en-IN')}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                      <p className="text-sm text-gray-600">{t('dashboard.noNotifications')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/setup-profile')}
              title={t('dashboard.setupProfile')}
              className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              style={{ border: '1px solid #EFE4D2', backgroundColor: 'rgba(255,255,255,0.9)' }}
            >
              <User className="w-5 h-5" style={{ color: 'var(--dark-brown)' }} />
            </button>

            <button
              onClick={() => setShowAddProduct(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--sage-green)', boxShadow: '0 8px 18px rgba(74,140,74,0.2)' }}
            >
              <Plus className="w-4 h-4" /> {t('dashboard.addProduct')}
            </button>
          </div>
        </header>

        {/* Smart Tip Bar */}
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 border" style={{ backgroundColor: '#FFF9EB', borderColor: '#F1E2C2' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--peach-pink)' }}>
              <Lightbulb className="w-4 h-4" style={{ color: 'var(--rust-red)' }} />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <SmartIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--rust-red)' }} />
              <p className="text-sm text-gray-700 truncate">{currentMsg.text}</p>
            </div>
            <button
              onClick={() => setSmartIdx(i => (i + 1) % tips.length)}
              className="ml-auto shrink-0 p-1 rounded hover:bg-white/60 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {section === 'home' && (
            effectiveIsNewArtisan ? (
              <NewArtisanHome
                userName={name}
                onAddProduct={() => { setShowAddProduct(true); }}
                onGoToProfile={() => { navigate('/setup-profile'); }}
              />
            ) : (
              <ExistingArtisanHome
                products={dashboardProducts}
                orders={artisanOrders}
                totalEarnings={totalEarnings}
                onAcceptOrder={id => updateArtisanOrder(id, 'processing')}
                onAddProduct={() => setShowAddProduct(true)}
                onViewOrders={() => { setSection('orders'); setOrderTab('new'); }}
                storeStory={storeStory}
                onSaveStory={handleSaveStory}
              />
            )
          )}
          {section === 'products' && (
            <ProductsSection
              products={dashboardProducts}
              search={search}
              onEdit={p => { setEditingProduct(p); setShowAddProduct(true); }}
              onDelete={deleteArtisanProduct}
              onAdd={() => setShowAddProduct(true)}
            />
          )}
          {section === 'orders' && (
            <OrdersSection
              orders={artisanOrders}
              orderTab={orderTab}
              setOrderTab={setOrderTab}
              onOrderAction={updateArtisanOrder}
            />
          )}
          {section === 'earnings' && (
            <EarningsSection orders={artisanOrders} />
          )}
        </main>
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddProduct || editingProduct) && (
        <ProductModal
          editingProduct={editingProduct}
          onClose={() => { setShowAddProduct(false); setEditingProduct(null); }}
          onSave={p => { updateArtisanProduct(p); setShowAddProduct(false); setEditingProduct(null); }}
          onCreate={data => { addArtisanProduct(data); setShowAddProduct(false); }}
        />
      )}

      {/* Close notifications on outside click */}
      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
      )}
    </div>
  );
}