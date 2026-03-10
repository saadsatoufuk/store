'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/stores/cart';
import { formatPrice, calculateDiscount } from '@/lib/utils/helpers';
import { ShoppingBag, Star } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
    product: {
        _id: string;
        name: string;
        slug: string;
        price: number;
        compareAtPrice?: number;
        images: string[];
        badge?: string | null;
        rating?: { average: number; count: number };
        totalStock?: number;
        category?: { name: string } | string;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const addItem = useCartStore((s) => s.addItem);
    const discount = calculateDiscount(product.price, product.compareAtPrice || 0);
    const categoryName = typeof product.category === 'object' && product.category ? product.category.name : '';

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            variant: '',
            slug: product.slug,
            maxStock: product.totalStock || 99,
        });
    };

    return (
        <Link
            href={`/products/${product.slug}`}
            className="group block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-[3/4] bg-surface rounded-xl overflow-hidden mb-3">
                {/* Main image */}
                <img
                    src={product.images?.[0] || '/placeholder.jpg'}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isHovered && product.images?.[1] ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                        }`}
                />
                {/* Hover image */}
                {product.images?.[1] && (
                    <img
                        src={product.images[1]}
                        alt={product.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                    />
                )}

                {/* Badge */}
                {product.badge && (
                    <span
                        className={`absolute top-3 right-3 px-3 py-1 text-[11px] font-bold rounded-full ${product.badge === 'Sale' || product.badge === 'تخفيض'
                                ? 'bg-sale text-white'
                                : product.badge === 'New' || product.badge === 'جديد'
                                    ? 'bg-foreground text-white'
                                    : product.badge === 'Bestseller' || product.badge === 'الأكثر مبيعاً'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-muted text-white'
                            }`}
                    >
                        {product.badge}
                    </span>
                )}

                {/* Discount badge */}
                {discount > 0 && !product.badge && (
                    <span className="absolute top-3 right-3 px-3 py-1 text-[11px] font-bold rounded-full bg-sale text-white">
                        {discount}%-
                    </span>
                )}

                {/* Quick add */}
                <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    <button
                        onClick={handleQuickAdd}
                        className="w-full py-2.5 bg-foreground/95 backdrop-blur-sm text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-foreground transition-colors"
                    >
                        <ShoppingBag size={16} />
                        إضافة للسلة
                    </button>
                </div>

                {/* Stock urgency */}
                {product.totalStock !== undefined && product.totalStock > 0 && product.totalStock <= 5 && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold">
                        باقي {product.totalStock} فقط!
                    </div>
                )}

                {/* Out of stock */}
                {product.totalStock !== undefined && product.totalStock <= 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="px-4 py-2 bg-white/90 rounded-full text-sm font-bold text-muted">نفذت الكمية</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div dir="rtl" className="space-y-1">
                {categoryName && (
                    <p className="text-xs text-muted uppercase tracking-wider">{categoryName}</p>
                )}
                <h3 className="text-sm font-medium group-hover:text-muted transition-colors line-clamp-2">{product.name}</h3>
                {product.rating && product.rating.count > 0 && (
                    <div className="flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="text-xs text-muted">{product.rating.average.toFixed(1)} ({product.rating.count})</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${discount > 0 ? 'text-sale' : ''}`}>
                        {formatPrice(product.price)}
                    </span>
                    {discount > 0 && product.compareAtPrice && (
                        <span className="text-xs text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
