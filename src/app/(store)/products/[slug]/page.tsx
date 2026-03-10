'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Heart, Minus, Plus, ChevronDown, ChevronUp, Truck, RotateCcw, Shield, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart';
import { useRecentlyViewedStore } from '@/lib/stores/recently-viewed';
import { formatPrice, calculateDiscount, getStockStatus } from '@/lib/utils/helpers';
import ProductCard from '@/components/store/ProductCard';

interface Product {
    _id: string; name: string; slug: string; description: string; shortDescription: string;
    price: number; compareAtPrice: number; images: string[];
    category: { _id: string; name: string; slug: string }; tags: string[];
    variants: { name: string; options: { value: string; stock: number; sku: string; priceAdjustment: number; }[] }[];
    totalStock: number; badge: string | null;
    rating: { average: number; count: number }; soldCount: number;
}

export default function ProductDetailPage() {
    const { slug } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
    const [openAccordion, setOpenAccordion] = useState<string | null>('details');
    const addItem = useCartStore(s => s.addItem);
    const addRecentlyViewed = useRecentlyViewedStore(s => s.addItem);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        fetch(`/api/products?limit=50`).then(r => r.json()).then(data => {
            const found = (data.products || []).find((p: Product) => p.slug === slug);
            if (found) {
                setProduct(found);
                addRecentlyViewed({
                    productId: found._id, name: found.name, slug: found.slug,
                    image: found.images?.[0] || '', price: found.price,
                });
                // Set default variant selections
                const defaults: Record<string, string> = {};
                found.variants?.forEach((v: { name: string; options: { value: string; stock: number }[] }) => {
                    const available = v.options.find((o: { stock: number }) => o.stock > 0);
                    if (available) defaults[v.name] = available.value;
                    else if (v.options[0]) defaults[v.name] = v.options[0].value;
                });
                setSelectedVariants(defaults);
                // Related products
                const related = (data.products || []).filter((p: Product) =>
                    p._id !== found._id && p.category?._id === found.category?._id
                ).slice(0, 4);
                setRelatedProducts(related);
            }
            setLoading(false);
        });
    }, [slug, addRecentlyViewed]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-4">
                        <div className="aspect-square skeleton rounded-xl" />
                        <div className="flex gap-2">{[...Array(4)].map((_, i) => <div key={i} className="w-20 h-20 skeleton rounded-lg" />)}</div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-6 skeleton w-1/3" /><div className="h-10 skeleton w-2/3" /><div className="h-6 skeleton w-1/4" />
                        <div className="h-24 skeleton w-full" /><div className="h-14 skeleton w-full rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-24">
                <div className="text-6xl mb-4">😕</div>
                <h1 className="text-2xl font-heading font-bold mb-2">المنتج غير موجود</h1>
                <Link href="/products" className="text-sm text-muted hover:text-foreground">العودة إلى المتجر</Link>
            </div>
        );
    }

    const discount = calculateDiscount(product.price, product.compareAtPrice);
    const stockStatus = getStockStatus(product.totalStock);
    const variantString = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ');

    const currentPrice = product.price + (product.variants?.reduce((adj, v) => {
        const selected = v.options.find(o => o.value === selectedVariants[v.name]);
        return adj + (selected?.priceAdjustment || 0);
    }, 0) || 0);

    const handleAddToCart = () => {
        addItem({
            productId: product._id, name: product.name, price: currentPrice,
            image: product.images?.[0] || '', variant: variantString,
            slug: product.slug, maxStock: product.totalStock,
        });
    };

    const accordionItems = [
        { id: 'details', title: 'تفاصيل المنتج', content: product.description || 'لا توجد تفاصيل إضافية.' },
        { id: 'size', title: 'دليل المقاسات', content: 'يرجى الرجوع إلى جدول المقاسات أعلاه لاختيار المقاس المناسب.' },
        { id: 'shipping', title: 'الشحن والإرجاع', content: 'شحن مجاني للطلبات فوق 200 ر.س. التوصيل خلال 3-7 أيام عمل. إرجاع مجاني خلال 30 يوماً من تاريخ الاستلام.' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-muted mb-6">
                <Link href="/" className="hover:text-foreground">الرئيسية</Link>
                <span className="mx-2">/</span>
                {product.category && (
                    <>
                        <Link href={`/collections/${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link>
                        <span className="mx-2">/</span>
                    </>
                )}
                <span className="text-foreground">{product.name}</span>
            </nav>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {/* Images */}
                <div className="space-y-4">
                    <motion.div
                        key={selectedImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="aspect-square bg-surface rounded-xl overflow-hidden relative group cursor-zoom-in"
                    >
                        <img src={product.images?.[selectedImage] || ''} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-150" />
                        {product.badge && (
                            <span className={`absolute top-4 right-4 px-4 py-1.5 text-xs font-bold rounded-full ${product.badge === 'تخفيض' ? 'bg-sale text-white' : product.badge === 'جديد' ? 'bg-foreground text-white' : 'bg-amber-500 text-white'
                                }`}>{product.badge}</span>
                        )}
                    </motion.div>
                    {product.images?.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                            {product.images.map((img, i) => (
                                <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${selectedImage === i ? 'border-foreground' : 'border-transparent'}`}>
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">{product.name}</h1>
                        {product.rating?.count > 0 && (
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < Math.round(product.rating.average) ? 'fill-amber-400 text-amber-400' : 'text-border'} />)}</div>
                                <span className="text-sm text-muted">({product.rating.count} تقييم)</span>
                            </div>
                        )}
                        <div className="flex items-baseline gap-3">
                            <span className={`text-3xl font-bold ${discount > 0 ? 'text-sale' : ''}`}>{formatPrice(currentPrice)}</span>
                            {discount > 0 && (
                                <>
                                    <span className="text-lg text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
                                    <span className="px-2 py-0.5 bg-sale/10 text-sale text-xs font-bold rounded-full">وفر {discount}%</span>
                                </>
                            )}
                        </div>
                    </div>

                    {product.shortDescription && (
                        <p className="text-muted leading-relaxed">{product.shortDescription}</p>
                    )}

                    {/* Variants */}
                    {product.variants?.map(variant => (
                        <div key={variant.name}>
                            <label className="text-sm font-bold mb-2 block">{variant.name}: <span className="font-normal text-muted">{selectedVariants[variant.name]}</span></label>
                            <div className="flex flex-wrap gap-2">
                                {variant.options.map(option => {
                                    const isSelected = selectedVariants[variant.name] === option.value;
                                    const outOfStock = option.stock <= 0;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => !outOfStock && setSelectedVariants(prev => ({ ...prev, [variant.name]: option.value }))}
                                            disabled={outOfStock}
                                            className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${isSelected ? 'border-foreground bg-foreground text-white' :
                                                    outOfStock ? 'border-border text-muted line-through opacity-50 cursor-not-allowed' :
                                                        'border-border hover:border-foreground'
                                                }`}
                                        >
                                            {option.value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Stock status */}
                    <p className={`text-sm font-medium ${stockStatus.color}`}>{stockStatus.label}</p>

                    {/* Quantity + Add to Cart */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-border rounded-lg">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-surface rounded-r-lg"><Minus size={16} /></button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(product.totalStock, quantity + 1))} className="p-3 hover:bg-surface rounded-l-lg"><Plus size={16} /></button>
                            </div>
                            <button onClick={handleAddToCart} disabled={product.totalStock <= 0} className="flex-1 py-3.5 bg-foreground text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <ShoppingBag size={18} />
                                إضافة للسلة
                            </button>
                        </div>
                        <button className="w-full py-3 border border-foreground rounded-lg font-medium text-sm hover:bg-foreground hover:text-white transition-all">
                            اشتر الآن
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mx-auto">
                            <Heart size={16} />
                            أضف إلى المفضلة
                        </button>
                    </div>

                    {/* Trust */}
                    <div className="flex items-center gap-6 py-4 border-t border-b border-border">
                        {[{ icon: Truck, text: 'شحن مجاني' }, { icon: RotateCcw, text: 'إرجاع مجاني' }, { icon: Shield, text: 'دفع آمن' }].map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-muted">
                                <item.icon size={14} />
                                {item.text}
                            </div>
                        ))}
                    </div>

                    {/* Accordion */}
                    <div className="space-y-0 border-t border-border">
                        {accordionItems.map(item => (
                            <div key={item.id} className="border-b border-border">
                                <button
                                    onClick={() => setOpenAccordion(openAccordion === item.id ? null : item.id)}
                                    className="flex items-center justify-between w-full py-4 text-sm font-medium"
                                >
                                    {item.title}
                                    {openAccordion === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                <AnimatePresence>
                                    {openAccordion === item.id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                            <p className="text-sm text-muted pb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="mt-16 pt-16 border-t border-border">
                    <h2 className="text-2xl font-heading font-bold mb-8">قد يعجبك أيضاً</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {relatedProducts.map(p => <ProductCard key={p._id} product={p} />)}
                    </div>
                </section>
            )}

            {/* Sticky ATC Mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-40">
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-lg font-bold">{formatPrice(currentPrice)}</p>
                    </div>
                    <button onClick={handleAddToCart} disabled={product.totalStock <= 0} className="flex-1 py-3 bg-foreground text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                        <ShoppingBag size={16} /> إضافة للسلة
                    </button>
                </div>
            </div>
        </div>
    );
}

function AnimatePresence({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
