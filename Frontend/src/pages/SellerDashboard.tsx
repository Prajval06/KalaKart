import { useState, useEffect } from 'react';
import {
  Home, Package, ShoppingBag, IndianRupee, Search, Bell, User, Plus,
  CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle, Edit2, Trash2,
  Lightbulb, ChevronRight, Menu, X, Truck, Star, ImageIcon, Save
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────
type Section = 'home' | 'products' | 'orders' | 'earnings';
type OrderStatus = 'new' | 'processing' | 'completed';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  description: string;
  status: 'active' | 'draft';
}

interface Order {
  id: string;
  product: string;
  productImage: string;
  customer: string;
  amount: number;
  date: string;
  status: OrderStatus;
}

interface Transaction {
  date: string;
  orderId: string;
  amount: number;
}

interface Notification {
  id: string;
  message: string;
  type: 'order' | 'stock' | 'payment';
  time: string;
}

// ─── Mock Data ────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  { id: 'P001', name: 'Madhubani Painting', price: 2500, stock: 3, image: 'https://images.unsplash.com/photo-1580974852861-f5a47f2d95cd?w=200', category: 'Paintings', description: 'Traditional Madhubani art on handmade paper', status: 'active' },
  { id: 'P002', name: 'Blue Pottery Vase', price: 1600, stock: 8, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200', category: 'Pottery', description: 'Jaipur blue pottery vase', status: 'active' },
  { id: 'P003', name: 'Pashmina Shawl', price: 8900, stock: 2, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200', category: 'Textiles', description: 'Pure Kashmiri Pashmina', status: 'active' },
  { id: 'P004', name: 'Silver Jhumka Earrings', price: 3200, stock: 0, image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200', category: 'Jewelry', description: 'Handcrafted oxidized silver', status: 'active' },
  { id: 'P005', name: 'Wooden Elephant Carving', price: 4500, stock: 5, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200', category: 'Woodwork', description: 'Sandalwood carved elephant', status: 'active' },
  { id: 'P006', name: 'Ceramic Bowl Set', price: 1200, stock: 12, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200', category: 'Pottery', description: 'Hand-painted serving bowls', status: 'active' },
  { id: 'P007', name: 'Embroidered Cushion Cover', price: 950, stock: 1, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=200', category: 'Textiles', description: 'Kutch embroidery cushion', status: 'draft' },
];

const ORDERS: Order[] = [
  { id: 'ORD-101', product: 'Madhubani Painting', productImage: 'https://images.unsplash.com/photo-1580974852861-f5a47f2d95cd?w=200', customer: 'Priya Sharma', amount: 2500, date: '2026-03-18', status: 'new' },
  { id: 'ORD-102', product: 'Blue Pottery Vase', productImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200', customer: 'Rajesh Kumar', amount: 3200, date: '2026-03-17', status: 'new' },
  { id: 'ORD-103', product: 'Pashmina Shawl', productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200', customer: 'Meera Iyer', amount: 8900, date: '2026-03-17', status: 'new' },
  { id: 'ORD-109', product: 'Wooden Elephant Carving', productImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200', customer: 'Arjun Nair', amount: 4500, date: '2026-03-18', status: 'new' },
  { id: 'ORD-110', product: 'Silver Jhumka Earrings', productImage: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200', customer: 'Sunita Rao', amount: 3200, date: '2026-03-18', status: 'new' },
  { id: 'ORD-111', product: 'Ceramic Bowl Set', productImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200', customer: 'Deepak Verma', amount: 1200, date: '2026-03-17', status: 'new' },
  { id: 'ORD-112', product: 'Embroidered Cushion Cover', productImage: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=200', customer: 'Lakshmi Pillai', amount: 950, date: '2026-03-17', status: 'new' },
  { id: 'ORD-113', product: 'Madhubani Painting', productImage: 'https://images.unsplash.com/photo-1580974852861-f5a47f2d95cd?w=200', customer: 'Harish Gupta', amount: 2500, date: '2026-03-16', status: 'new' },
  { id: 'ORD-114', product: 'Blue Pottery Vase', productImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200', customer: 'Pooja Bhatt', amount: 1600, date: '2026-03-16', status: 'new' },
  { id: 'ORD-115', product: 'Pashmina Shawl', productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200', customer: 'Rohit Sinha', amount: 8900, date: '2026-03-16', status: 'new' },
  { id: 'ORD-116', product: 'Wooden Elephant Carving', productImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200', customer: 'Ananya Krishnan', amount: 4500, date: '2026-03-15', status: 'new' },
  { id: 'ORD-117', product: 'Silver Jhumka Earrings', productImage: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200', customer: 'Nikhil Joshi', amount: 3200, date: '2026-03-15', status: 'new' },
  { id: 'ORD-118', product: 'Ceramic Bowl Set', productImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200', customer: 'Geeta Malhotra', amount: 1200, date: '2026-03-15', status: 'new' },
  { id: 'ORD-104', product: 'Wooden Elephant', productImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200', customer: 'Vikram Patel', amount: 4500, date: '2026-03-16', status: 'processing' },
  { id: 'ORD-105', product: 'Ceramic Bowl Set', productImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200', customer: 'Anita Desai', amount: 1200, date: '2026-03-15', status: 'processing' },
  { id: 'ORD-106', product: 'Embroidered Cushion', productImage: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=200', customer: 'Kavita Singh', amount: 950, date: '2026-03-12', status: 'completed' },
  { id: 'ORD-107', product: 'Silver Jhumka Earrings', productImage: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200', customer: 'Sanjay Reddy', amount: 3200, date: '2026-03-10', status: 'completed' },
  { id: 'ORD-108', product: 'Blue Pottery Vase', productImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200', customer: 'Ritu Mehra', amount: 1600, date: '2026-03-08', status: 'completed' },
];

const TRANSACTIONS: Transaction[] = [
  { date: '2026-03-15', orderId: 'ORD-106', amount: 950 },
  { date: '2026-03-12', orderId: 'ORD-107', amount: 3200 },
  { date: '2026-03-10', orderId: 'ORD-108', amount: 1600 },
  { date: '2026-03-07', orderId: 'ORD-095', amount: 2500 },
  { date: '2026-03-04', orderId: 'ORD-091', amount: 4500 },
  { date: '2026-03-01', orderId: 'ORD-088', amount: 8900 },
];

const NOTIFICATIONS: Notification[] = [
  { id: 'n1', message: 'New order from Priya Sharma!', type: 'order', time: '2 min ago' },
  { id: 'n2', message: 'Silver Jhumka Earrings is out of stock', type: 'stock', time: '1 hour ago' },
  { id: 'n3', message: '₹950 payment received for ORD-106', type: 'payment', time: '3 hours ago' },
  { id: 'n4', message: 'New order from Rajesh Kumar!', type: 'order', time: '5 hours ago' },
  { id: 'n5', message: 'Embroidered Cushion Cover stock is low (1 left)', type: 'stock', time: '1 day ago' },
];

const SMART_MESSAGES = [
  { text: 'You have 3 new orders to ship today', icon: ShoppingBag },
  { text: 'Silver Jhumka Earrings is out of stock — restock soon!', icon: AlertTriangle },
  { text: 'Add more images to Embroidered Cushion Cover to improve sales', icon: ImageIcon },
  { text: 'Your sales increased 20% this week — great work!', icon: TrendingUp },
  { text: 'Pashmina Shawl is your top selling product this month', icon: Star },
];

// ─── Product Modal (defined OUTSIDE SellerDashboard to prevent remount loops) ─
interface ProductModalProps {
  editingProduct: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
  onCreate: (data: { name: string; price: number; stock: number; category: string; description: string }) => void;
}

function ProductModal({ editingProduct, onClose, onSave, onCreate }: ProductModalProps) {
  const isEdit = !!editingProduct;
  const [form, setForm] = useState({
    name: editingProduct?.name || '',
    price: editingProduct?.price?.toString() || '',
    stock: editingProduct?.stock?.toString() || '',
    category: editingProduct?.category || '',
    description: editingProduct?.description || '',
  });

  const suggestions: string[] = [];
  if (!form.name) suggestions.push('Give your product a clear name');
  if (Number(form.price) > 5000) suggestions.push('Your price is higher than similar products');
  if (!form.description || form.description.length < 20) suggestions.push('Add a detailed description to attract buyers');
  if (!form.category) suggestions.push('Select a category so buyers can find your product');

  const handleSubmit = () => {
    if (isEdit && editingProduct) {
      onSave({ ...editingProduct, name: form.name, price: Number(form.price), stock: Number(form.stock), category: form.category, description: form.description });
    } else {
      onCreate({ name: form.name, price: Number(form.price), stock: Number(form.stock), category: form.category, description: form.description });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ color: 'var(--dark-brown)' }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="mb-5 p-3 rounded-xl" style={{ backgroundColor: '#FFF8E1' }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--rust-red)' }}>
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm" style={{ fontWeight: 600 }}>Smart Suggestions</span>
            </div>
            {suggestions.map((s, i) => (
              <p key={i} className="text-sm text-gray-600 ml-6">• {s}</p>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Product Name</label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Handpainted Ceramic Vase"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Price (₹)</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Stock</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 bg-white"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select category</option>
              {['Paintings', 'Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 resize-none"
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your product..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Images</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 transition-colors">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Click to upload images</p>
              <p className="text-xs text-gray-400 mt-1">Add at least 2 images for better sales</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 rounded-xl text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--sage-green)' }}
          >
            {isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Home Section ──────────────────────────────────────────────
interface HomeSectionProps {
  orders: Order[];
  products: Product[];
  newOrders: Order[];
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  totalEarnings: number;
  onAcceptOrder: (id: string) => void;
  onAddProduct: () => void;
  onViewOrders: () => void;
  storeStory: string;
  onSaveStory: (story: string) => void;
}

function HomeSection({
  orders, products, newOrders, lowStockProducts, outOfStockProducts,
  totalEarnings, onAcceptOrder, onAddProduct, onViewOrders,
  storeStory, onSaveStory,
}: HomeSectionProps) {
  const [editingStory, setEditingStory] = useState(false);
  const [storeStoryDraft, setStoreStoryDraft] = useState(storeStory);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'var(--sage-green)' },
          { label: 'Orders', value: orders.length.toString(), icon: ShoppingBag, color: 'var(--peach-pink)' },
          { label: 'Products', value: products.length.toString(), icon: Package, color: 'var(--dark-brown)' },
          { label: 'Alerts', value: (lowStockProducts.length + outOfStockProducts.length).toString(), icon: AlertTriangle, color: 'var(--rust-red)' },
        ].map(kpi => {
          const KIcon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: kpi.color }}>
                  <KIcon className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-500">{kpi.label}</span>
              </div>
              <p className="text-2xl" style={{ color: 'var(--dark-brown)', fontWeight: 700 }}>{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onAddProduct}
          className="flex items-center justify-center gap-3 py-4 rounded-2xl text-white transition-all hover:opacity-90 shadow-sm"
          style={{ backgroundColor: 'var(--sage-green)' }}
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
        <button
          onClick={onViewOrders}
          className="flex items-center justify-center gap-3 py-4 rounded-2xl text-white transition-all hover:opacity-90 shadow-sm"
          style={{ backgroundColor: 'var(--rust-red)' }}
        >
          <ShoppingBag className="w-5 h-5" /> View Orders
        </button>
      </div>

      {/* New Orders Highlight */}
      {newOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f0ebe0' }}>
            <h3 style={{ color: 'var(--dark-brown)' }}>New Orders</h3>
            <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: 'var(--rust-red)' }}>{newOrders.length} new</span>
          </div>
          {newOrders.map(order => (
            <div key={order.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #f5f0e5' }}>
              <div className="flex items-center gap-3">
                <img src={order.productImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <p className="text-sm" style={{ color: 'var(--dark-brown)', fontWeight: 600 }}>{order.product}</p>
                  <p className="text-xs text-gray-500">{order.customer} • ₹{order.amount.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <button
                onClick={() => onAcceptOrder(order.id)}
                className="px-4 py-2 rounded-xl text-sm text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--sage-green)' }}
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="mb-4" style={{ color: 'var(--dark-brown)' }}>Recent Activity</h3>
        <div className="space-y-3">
          {outOfStockProducts.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-gray-700"><span style={{ fontWeight: 600 }}>{p.name}</span> is <span className="text-red-600" style={{ fontWeight: 600 }}>Out of Stock</span></p>
            </div>
          ))}
          {lowStockProducts.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#FFF8E1' }}>
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-gray-700"><span style={{ fontWeight: 600 }}>{p.name}</span> — <span className="text-amber-600" style={{ fontWeight: 600 }}>Low Stock</span> ({p.stock} left)</p>
            </div>
          ))}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F0FFF4' }}>
            <TrendingUp className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-sm text-gray-700"><span style={{ fontWeight: 600 }}>Pashmina Shawl</span> is <span className="text-green-600" style={{ fontWeight: 600 }}>Selling Fast</span></p>
          </div>
        </div>
      </div>

      {/* Store Story */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ color: 'var(--dark-brown)' }}>Your Store Story</h3>
          {!editingStory ? (
            <button onClick={() => { setEditingStory(true); setStoreStoryDraft(storeStory); }} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Edit2 className="w-4 h-4 text-gray-500" />
            </button>
          ) : (
            <button
              onClick={() => { onSaveStory(storeStoryDraft); setEditingStory(false); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: 'var(--sage-green)' }}
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          )}
        </div>
        {editingStory ? (
          <textarea
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 resize-none text-sm text-gray-700"
            rows={3}
            value={storeStoryDraft}
            onChange={e => setStoreStoryDraft(e.target.value)}
          />
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed italic">"{storeStory}"</p>
        )}
      </div>
    </div>
  );
}

// ─── Products Section ──────────────────────────────────────────
interface ProductsSectionProps {
  products: Product[];
  search: string;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

function ProductsSection({ products, search, onEdit, onDelete, onAdd }: ProductsSectionProps) {
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 style={{ color: 'var(--dark-brown)' }}>Your Products</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--sage-green)' }}
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--cream-bg)' }}>
                {['Product', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-sm" style={{ color: 'var(--dark-brown)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm" style={{ fontWeight: 600, color: 'var(--dark-brown)' }}>{p.name}</p>
                        <p className="text-xs text-gray-500">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ fontWeight: 600 }}>₹{p.price.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-sm ${p.stock === 0 ? 'text-red-600' : p.stock <= 3 ? 'text-amber-600' : 'text-gray-700'}`}
                      style={{ fontWeight: p.stock <= 3 ? 600 : 400 }}
                    >
                      {p.stock === 0 ? 'Out of Stock' : p.stock <= 3 ? `Low Stock (${p.stock})` : p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                      style={{ fontWeight: 500 }}
                    >
                      {p.status === 'active' ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEdit(p)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => onDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Orders Section ────────────────────────────────────────────
interface OrdersSectionProps {
  orders: Order[];
  orderTab: OrderStatus;
  setOrderTab: (tab: OrderStatus) => void;
  onOrderAction: (id: string, status: OrderStatus) => void;
}

function OrdersSection({ orders, orderTab, setOrderTab, onOrderAction }: OrdersSectionProps) {
  const tabs: { key: OrderStatus; label: string }[] = [
    { key: 'new', label: 'New' },
    { key: 'processing', label: 'Processing' },
    { key: 'completed', label: 'Completed' },
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
          <span>Ship within 24 hours to keep your rating high!</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm">No {orderTab} orders</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--cream-bg)' }}>
                  {['Order ID', 'Product', 'Amount', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-sm" style={{ color: 'var(--dark-brown)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm" style={{ fontWeight: 600 }}>{o.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={o.productImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm" style={{ fontWeight: 500 }}>{o.product}</p>
                          <p className="text-xs text-gray-500">{o.customer}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ fontWeight: 600, color: 'var(--rust-red)' }}>₹{o.amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-4">
                      {o.status === 'new' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onOrderAction(o.id, 'processing')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white hover:opacity-90 transition-colors"
                            style={{ backgroundColor: 'var(--sage-green)' }}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => onOrderAction(o.id, 'completed')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white hover:opacity-90 transition-colors"
                            style={{ backgroundColor: 'var(--rust-red)' }}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Decline
                          </button>
                        </div>
                      )}
                      {o.status === 'processing' && (
                        <button
                          onClick={() => onOrderAction(o.id, 'completed')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white hover:opacity-90 transition-colors"
                          style={{ backgroundColor: 'var(--dark-brown)' }}
                        >
                          <Truck className="w-3.5 h-3.5" /> Mark Shipped
                        </button>
                      )}
                      {o.status === 'completed' && (
                        <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700" style={{ fontWeight: 500 }}>Done</span>
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

// ─── Earnings Section ──────────────────────────────────────────
interface EarningsSectionProps {
  totalEarnings: number;
  availableBalance: number;
}

function EarningsSection({ totalEarnings, availableBalance }: EarningsSectionProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Earned</p>
          <p className="text-3xl" style={{ color: 'var(--dark-brown)', fontWeight: 700 }}>₹{totalEarnings.toLocaleString('en-IN')}</p>
          <p className="text-xs mt-2 text-green-600 flex items-center gap-1" style={{ fontWeight: 500 }}>
            <TrendingUp className="w-3.5 h-3.5" /> You earned 20% more this week
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Available Balance</p>
          <p className="text-3xl" style={{ color: 'var(--sage-green)', fontWeight: 700 }}>₹{availableBalance.toLocaleString('en-IN')}</p>
          <p className="text-xs mt-2 text-gray-500 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" /> Top earning: Pashmina Shawl
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #f0ebe0' }}>
          <h3 style={{ color: 'var(--dark-brown)' }}>Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--cream-bg)' }}>
                {['Date', 'Order ID', 'Amount'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-sm" style={{ color: 'var(--dark-brown)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map(t => (
                <tr key={t.orderId} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ fontWeight: 500 }}>{t.orderId}</td>
                  <td className="px-5 py-4 text-sm" style={{ fontWeight: 600, color: 'var(--sage-green)' }}>+ ₹{t.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ──────────────────────────────────
export default function SellerDashboard() {
  const [section, setSection] = useState<Section>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [smartIdx, setSmartIdx] = useState(0);
  const [orderTab, setOrderTab] = useState<OrderStatus>('new');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [storeStory, setStoreStory] = useState("We are a family of artisans from Rajasthan, keeping alive the centuries-old tradition of blue pottery and hand-block printing. Every piece tells a story of our heritage.");

  // Rotate smart messages
  useEffect(() => {
    const t = setInterval(() => setSmartIdx(i => (i + 1) % SMART_MESSAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const totalEarnings = 45850;
  const availableBalance = 21650;
  const newOrders = orders.filter(o => o.status === 'new');
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 3);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const handleOrderAction = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const handleCreateProduct = (data: { name: string; price: number; stock: number; category: string; description: string }) => {
    setProducts(prev => [...prev, {
      id: `P${String(prev.length + 1).padStart(3, '0')}`,
      ...data,
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200',
      status: 'active',
    }]);
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const currentMsg = SMART_MESSAGES[smartIdx];
  const SmartIcon = currentMsg.icon;

  const navItems: { key: Section; label: string; icon: typeof Home }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
    { key: 'earnings', label: 'Earnings', icon: IndianRupee },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F8F4EA' }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 p-5 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: 'var(--dark-brown)' }}
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-white text-lg" style={{ fontFamily: "'Cinzel', serif" }}>KARIGARKART</h2>
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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: active ? 'white' : 'rgba(255,255,255,0.6)',
                }}
              >
                <NIcon className="w-5 h-5" />
                <span className="text-sm" style={{ fontWeight: active ? 600 : 400 }}>{item.label}</span>
                {item.key === 'orders' && newOrders.length > 0 && (
                  <span className="ml-auto w-5 h-5 flex items-center justify-center rounded-full text-xs text-white" style={{ backgroundColor: 'var(--rust-red)', fontSize: 10 }}>
                    {newOrders.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Artisan Profile Stub */}
        <div className="mt-auto pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm text-white" style={{ backgroundColor: 'var(--sage-green)', fontWeight: 600 }}>RS</div>
            <div>
              <p className="text-sm text-white" style={{ fontWeight: 500 }}>Ravi Shankar</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Jaipur, Rajasthan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white shadow-sm px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" style={{ color: 'var(--dark-brown)' }} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Search products, orders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5" style={{ color: 'var(--dark-brown)' }} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--rust-red)' }} />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0ebe0' }}>
                    <p className="text-sm" style={{ fontWeight: 600, color: 'var(--dark-brown)' }}>Notifications</p>
                  </div>
                  {NOTIFICATIONS.map(n => (
                    <div key={n.id} className="px-4 py-3 hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #f9f5eb' }}>
                      <p className="text-sm text-gray-700">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
              <User className="w-5 h-5" style={{ color: 'var(--dark-brown)' }} />
            </button>

            {/* Add Product CTA */}
            <button
              onClick={() => setShowAddProduct(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--sage-green)' }}
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </header>

        {/* Smart Assistant Bar */}
        <div className="px-4 sm:px-6 py-3" style={{ backgroundColor: '#FFF9EB' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--peach-pink)' }}>
              <Lightbulb className="w-4 h-4" style={{ color: 'var(--rust-red)' }} />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <SmartIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--rust-red)' }} />
              <p className="text-sm text-gray-700 truncate">{currentMsg.text}</p>
            </div>
            <button
              onClick={() => setSmartIdx(i => (i + 1) % SMART_MESSAGES.length)}
              className="ml-auto shrink-0 p-1 rounded hover:bg-white/60 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {section === 'home' && (
            <HomeSection
              orders={orders}
              products={products}
              newOrders={newOrders}
              lowStockProducts={lowStockProducts}
              outOfStockProducts={outOfStockProducts}
              totalEarnings={totalEarnings}
              onAcceptOrder={id => handleOrderAction(id, 'processing')}
              onAddProduct={() => setShowAddProduct(true)}
              onViewOrders={() => { setSection('orders'); setOrderTab('new'); }}
              storeStory={storeStory}
              onSaveStory={setStoreStory}
            />
          )}
          {section === 'products' && (
            <ProductsSection
              products={products}
              search={search}
              onEdit={p => { setEditingProduct(p); setShowAddProduct(true); }}
              onDelete={handleDeleteProduct}
              onAdd={() => setShowAddProduct(true)}
            />
          )}
          {section === 'orders' && (
            <OrdersSection
              orders={orders}
              orderTab={orderTab}
              setOrderTab={setOrderTab}
              onOrderAction={handleOrderAction}
            />
          )}
          {section === 'earnings' && (
            <EarningsSection totalEarnings={totalEarnings} availableBalance={availableBalance} />
          )}
        </main>
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddProduct || editingProduct) && (
        <ProductModal
          editingProduct={editingProduct}
          onClose={() => { setShowAddProduct(false); setEditingProduct(null); }}
          onSave={handleSaveProduct}
          onCreate={handleCreateProduct}
        />
      )}

      {/* Close notifications on outside click */}
      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
      )}
    </div>
  );
}