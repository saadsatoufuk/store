'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Image as ImageIcon, X } from 'lucide-react';

interface Product {
    _id: string; name: string; slug: string; price: number; totalStock: number;
    isActive: boolean; images: string[]; category?: { name: string }; badge?: string;
}

const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiNEMUQ1REIiPuKcpjwvdGV4dD48L3N2Zz4=';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState<any>(null);
    const [form, setForm] = useState({
        name: '', price: '', compareAtPrice: '', cost: '', description: '', shortDescription: '',
        totalStock: '', badge: '', isActive: true, isFeatured: false, imageUrl: '', imageUrl2: '', imageUrl3: '',
    });

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        const res = await fetch('/api/products?limit=100');
        const data = await res.json();
        setProducts(data.products || []);
        setLoading(false);
    };

    const handleSave = async () => {
        const images: string[] = [];
        if (form.imageUrl.trim()) images.push(form.imageUrl.trim());
        if (form.imageUrl2.trim()) images.push(form.imageUrl2.trim());
        if (form.imageUrl3.trim()) images.push(form.imageUrl3.trim());

        const payload = {
            name: form.name,
            price: parseFloat(form.price as string) || 0,
            compareAtPrice: parseFloat(form.compareAtPrice as string) || 0,
            cost: parseFloat(form.cost as string) || 0,
            totalStock: parseInt(form.totalStock as string) || 0,
            description: form.description,
            shortDescription: form.shortDescription,
            badge: form.badge || null,
            isActive: form.isActive,
            isFeatured: form.isFeatured,
            images,
        };

        const method = editProduct ? 'PUT' : 'POST';
        const url = editProduct ? `/api/admin/products/${editProduct._id}` : '/api/admin/products';
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

        setShowModal(false);
        setEditProduct(null);
        resetForm();
        fetchProducts();
    };

    const resetForm = () => {
        setForm({ name: '', price: '', compareAtPrice: '', cost: '', description: '', shortDescription: '', totalStock: '', badge: '', isActive: true, isFeatured: false, imageUrl: '', imageUrl2: '', imageUrl3: '' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
        await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
        fetchProducts();
    };

    const openEdit = (product: Product) => {
        setEditProduct(product);
        setForm({
            name: product.name,
            price: product.price.toString(),
            compareAtPrice: '',
            cost: '',
            description: '',
            shortDescription: '',
            totalStock: product.totalStock.toString(),
            badge: product.badge || '',
            isActive: product.isActive,
            isFeatured: false,
            imageUrl: product.images?.[0] || '',
            imageUrl2: product.images?.[1] || '',
            imageUrl3: product.images?.[2] || '',
        });
        setShowModal(true);
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    const getStockColor = (stock: number) => {
        if (stock <= 0) return 'text-red-600 bg-red-50';
        if (stock <= 5) return 'text-amber-600 bg-amber-50';
        return 'text-green-600 bg-green-50';
    };

    return (
        <div dir="rtl" className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold">المنتجات</h1>
                    <p className="text-muted text-sm">{products.length} منتج</p>
                </div>
                <button onClick={() => { setEditProduct(null); resetForm(); setShowModal(true); }} className="px-4 py-2.5 bg-foreground text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-foreground/90 transition-colors">
                    <Plus size={16} /> إضافة منتج
                </button>
            </div>

            <div className="relative max-w-sm">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث عن منتج..." className="w-full pr-10 pl-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10" />
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-border bg-surface/50">
                            <th className="p-4 text-right font-medium">المنتج</th>
                            <th className="p-4 text-right font-medium">التصنيف</th>
                            <th className="p-4 text-right font-medium">السعر</th>
                            <th className="p-4 text-right font-medium">المخزون</th>
                            <th className="p-4 text-right font-medium">الحالة</th>
                            <th className="p-4 text-right font-medium">إجراءات</th>
                        </tr></thead>
                        <tbody>
                            {loading ? [...Array(5)].map((_, i) => (
                                <tr key={i}><td colSpan={6} className="p-4"><div className="h-12 skeleton" /></td></tr>
                            )) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-muted"><Package size={32} className="mx-auto mb-2 text-border" />لا توجد منتجات</td></tr>
                            ) : filtered.map(product => (
                                <tr key={product._id} className="border-b border-border hover:bg-surface/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={product.images?.[0] || DEFAULT_PLACEHOLDER} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-muted">{product.category?.name || '-'}</td>
                                    <td className="p-4 font-medium">{product.price} ر.س</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor(product.totalStock)}`}>{product.totalStock}</span></td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{product.isActive ? 'نشط' : 'معطل'}</span></td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(product)} className="p-2 hover:bg-surface rounded-lg transition-colors"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-red-50 text-muted hover:text-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-heading font-bold text-lg">{editProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-surface rounded-lg"><X size={18} /></button>
                        </div>

                        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="اسم المنتج *" className="w-full px-4 py-3 border border-border rounded-lg text-sm" />

                        <div className="grid grid-cols-3 gap-3">
                            <input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="السعر *" type="number" className="w-full px-4 py-3 border border-border rounded-lg text-sm" />
                            <input value={form.compareAtPrice} onChange={e => setForm(p => ({ ...p, compareAtPrice: e.target.value }))} placeholder="السعر قبل الخصم" type="number" className="w-full px-4 py-3 border border-border rounded-lg text-sm" />
                            <input value={form.totalStock} onChange={e => setForm(p => ({ ...p, totalStock: e.target.value }))} placeholder="المخزون *" type="number" className="w-full px-4 py-3 border border-border rounded-lg text-sm" />
                        </div>

                        {/* Image URLs */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold flex items-center gap-2"><ImageIcon size={14} /> روابط الصور</label>
                            <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="رابط الصورة الرئيسية (URL) *" className="w-full px-4 py-3 border border-border rounded-lg text-sm" dir="ltr" />
                            <input value={form.imageUrl2} onChange={e => setForm(p => ({ ...p, imageUrl2: e.target.value }))} placeholder="رابط الصورة الثانية (اختياري)" className="w-full px-4 py-3 border border-border rounded-lg text-sm" dir="ltr" />
                            <input value={form.imageUrl3} onChange={e => setForm(p => ({ ...p, imageUrl3: e.target.value }))} placeholder="رابط الصورة الثالثة (اختياري)" className="w-full px-4 py-3 border border-border rounded-lg text-sm" dir="ltr" />
                            {/* Image Preview */}
                            {form.imageUrl && (
                                <div className="flex gap-2">
                                    {[form.imageUrl, form.imageUrl2, form.imageUrl3].filter(Boolean).map((url, i) => (
                                        <div key={i} className="w-20 h-20 bg-surface rounded-lg overflow-hidden border border-border">
                                            <img src={url} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PLACEHOLDER; }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <textarea value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))} placeholder="وصف مختصر" rows={2} className="w-full px-4 py-3 border border-border rounded-lg text-sm" />
                        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="الوصف الكامل" rows={3} className="w-full px-4 py-3 border border-border rounded-lg text-sm" />

                        <select value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white">
                            <option value="">بدون شارة</option>
                            <option value="جديد">جديد</option>
                            <option value="تخفيض">تخفيض</option>
                            <option value="الأكثر مبيعاً">الأكثر مبيعاً</option>
                        </select>

                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} /> نشط</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} /> مميز</label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={handleSave} className="flex-1 py-3 bg-foreground text-white rounded-lg font-medium text-sm">حفظ</button>
                            <button onClick={() => setShowModal(false)} className="px-6 py-3 border border-border rounded-lg text-sm">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
