'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/store/ProductCard';
import { ChevronLeft } from 'lucide-react';

export default function CollectionPage() {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/products?limit=24`).then(r => r.json()).then(d => {
            setProducts(d.products || []);
            setLoading(false);
        });
    }, [slug]);

    const title = slug === 'new-arrivals' ? 'وصل حديثاً' : slug === 'bestsellers' ? 'الأكثر مبيعاً' : slug === 'sale' ? 'التخفيضات' : String(slug);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="text-sm text-muted mb-6">
                <Link href="/" className="hover:text-foreground">الرئيسية</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground font-medium">{title}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-8">{title}</h1>
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(8)].map((_, i) => <div key={i} className="space-y-3"><div className="aspect-[3/4] skeleton rounded-xl" /><div className="h-4 skeleton w-3/4" /><div className="h-4 skeleton w-1/2" /></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {products.map((p: any) => <ProductCard key={p._id} product={p} />)}
                </div>
            )}
        </div>
    );
}
