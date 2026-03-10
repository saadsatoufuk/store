'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/store/ProductCard';
import { Search as SearchIcon } from 'lucide-react';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) { setLoading(false); return; }
        setLoading(true);
        fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
            .then(r => r.json())
            .then(d => { setProducts(d.products || []); setLoading(false); });
    }, [query]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-heading font-bold mb-2">نتائج البحث</h1>
            <p className="text-muted text-sm mb-8">عن &quot;{query}&quot; — {products.length} نتيجة</p>
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="space-y-3"><div className="aspect-[3/4] skeleton rounded-xl" /><div className="h-4 skeleton w-3/4" /></div>)}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-24">
                    <SearchIcon size={48} className="mx-auto text-border mb-4" />
                    <h2 className="text-xl font-heading font-bold mb-2">لا توجد نتائج</h2>
                    <p className="text-muted mb-6">جرب كلمات بحث مختلفة</p>
                    <Link href="/products" className="inline-block px-6 py-3 bg-foreground text-white rounded-lg text-sm font-medium">تصفح جميع المنتجات</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {products.map((p: any) => <ProductCard key={p._id} product={p} />)}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="h-8 skeleton w-1/3 mb-8" /><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] skeleton rounded-xl" />)}</div></div>}>
            <SearchContent />
        </Suspense>
    );
}
