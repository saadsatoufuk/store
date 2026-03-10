'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/store/ProductCard';
import { SlidersHorizontal, X, Grid3X3, List, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    _id: string; name: string; slug: string; price: number; compareAtPrice?: number;
    images: string[]; badge?: string | null; rating?: { average: number; count: number };
    totalStock?: number; category?: { name: string };
}
interface Category { _id: string; name: string; slug: string; }
interface Pagination { page: number; total: number; pages: number; }

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const currentSort = searchParams.get('sort') || 'featured';
    const currentCategory = searchParams.get('category') || '';
    const currentPage = parseInt(searchParams.get('page') || '1');

    const updateParams = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        if (key !== 'page') params.set('page', '1');
        router.push(`/products?${params.toString()}`);
    }, [searchParams, router]);

    useEffect(() => {
        fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        if (!params.has('limit')) params.set('limit', '12');
        fetch(`/api/products?${params.toString()}`)
            .then(r => r.json())
            .then(d => {
                setProducts(d.products || []);
                setPagination(d.pagination || { page: 1, total: 0, pages: 0 });
            })
            .finally(() => setLoading(false));
    }, [searchParams]);

    const sortOptions = [
        { value: 'featured', label: 'المميزة' },
        { value: 'newest', label: 'الأحدث' },
        { value: 'price-asc', label: 'السعر: الأقل أولاً' },
        { value: 'price-desc', label: 'السعر: الأعلى أولاً' },
        { value: 'rating', label: 'الأعلى تقييماً' },
        { value: 'bestselling', label: 'الأكثر مبيعاً' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="text-sm text-muted mb-6">
                <a href="/" className="hover:text-foreground">الرئيسية</a>
                <span className="mx-2">/</span>
                <span className="text-foreground font-medium">المتجر</span>
            </nav>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold">جميع المنتجات</h1>
                    <p className="text-muted text-sm mt-1">عرض {products.length} من {pagination.total} منتج</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex border border-border rounded-lg overflow-hidden">
                        <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-foreground text-white' : 'hover:bg-surface'}`}><Grid3X3 size={16} /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-foreground text-white' : 'hover:bg-surface'}`}><List size={16} /></button>
                    </div>
                    <select value={currentSort} onChange={(e) => updateParams('sort', e.target.value)} className="px-4 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-foreground/10">
                        {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button onClick={() => setFiltersOpen(true)} className="md:hidden p-2.5 border border-border rounded-lg"><SlidersHorizontal size={16} /></button>
                </div>
            </div>

            <div className="flex gap-8">
                <aside className="hidden md:block w-56 flex-shrink-0 space-y-6">
                    <div>
                        <h3 className="font-bold text-sm mb-3">التصنيفات</h3>
                        <div className="space-y-2">
                            <button onClick={() => updateParams('category', '')} className={`block text-sm w-full text-right py-1 ${!currentCategory ? 'font-bold text-foreground' : 'text-muted hover:text-foreground'}`}>الكل</button>
                            {categories.map(cat => (
                                <button key={cat._id} onClick={() => updateParams('category', cat._id)} className={`block text-sm w-full text-right py-1 ${currentCategory === cat._id ? 'font-bold text-foreground' : 'text-muted hover:text-foreground'}`}>{cat.name}</button>
                            ))}
                        </div>
                    </div>
                    <hr className="border-border" />
                    <div>
                        <h3 className="font-bold text-sm mb-3">التوفر</h3>
                        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={searchParams.get('inStock') === 'true'} onChange={(e) => updateParams('inStock', e.target.checked ? 'true' : '')} className="rounded" />متوفر فقط</label>
                    </div>
                    <hr className="border-border" />
                    <div>
                        <h3 className="font-bold text-sm mb-3">العروض</h3>
                        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={searchParams.get('onSale') === 'true'} onChange={(e) => updateParams('onSale', e.target.checked ? 'true' : '')} className="rounded" />خصومات فقط</label>
                    </div>
                </aside>

                <AnimatePresence>
                    {filtersOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setFiltersOpen(false)} />
                            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-80 bg-white z-50 p-6 overflow-y-auto" dir="rtl">
                                <div className="flex items-center justify-between mb-6"><h2 className="font-bold text-lg">الفلاتر</h2><button onClick={() => setFiltersOpen(false)}><X size={20} /></button></div>
                                <div className="space-y-6"><div><h3 className="font-bold text-sm mb-3">التصنيفات</h3>{categories.map(cat => (<button key={cat._id} onClick={() => { updateParams('category', cat._id); setFiltersOpen(false); }} className="block text-sm w-full text-right py-2 text-muted hover:text-foreground">{cat.name}</button>))}</div></div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div className="flex-1">
                    {loading ? (
                        <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                            {[...Array(8)].map((_, i) => (<div key={i} className="space-y-3"><div className="aspect-[3/4] skeleton rounded-xl" /><div className="h-4 skeleton w-3/4" /><div className="h-4 skeleton w-1/2" /></div>))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="text-6xl mb-4">🔍</div>
                            <h2 className="text-xl font-heading font-bold mb-2">لا توجد منتجات</h2>
                            <p className="text-muted mb-6">جرب تغيير عوامل التصفية</p>
                            <button onClick={() => router.push('/products')} className="px-6 py-3 bg-foreground text-white rounded-lg text-sm font-medium">عرض جميع المنتجات</button>
                        </div>
                    ) : (
                        <>
                            <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                                {products.map(product => (<ProductCard key={product._id} product={product} />))}
                            </div>
                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-12">
                                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                                        <button key={page} onClick={() => updateParams('page', page.toString())} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === currentPage ? 'bg-foreground text-white' : 'border border-border hover:bg-surface'}`}>{page}</button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="h-10 skeleton w-1/3 mb-8" /><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] skeleton rounded-xl" />)}</div></div>}>
            <ShopContent />
        </Suspense>
    );
}
