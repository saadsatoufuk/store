'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Truck, RotateCcw, Shield, Headphones, Star, ChevronLeft } from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';

interface Product {
    _id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    badge?: string | null;
    rating?: { average: number; count: number };
    totalStock?: number;
    category?: { name: string };
}

interface Category {
    _id: string;
    name: string;
    slug: string;
    image: string;
}

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
};

const trustItems = [
    { icon: Truck, title: 'شحن مجاني', desc: 'للطلبات فوق 200 ر.س' },
    { icon: RotateCcw, title: 'إرجاع مجاني', desc: 'خلال 30 يوم' },
    { icon: Shield, title: 'دفع آمن', desc: 'معاملات مشفرة' },
    { icon: Headphones, title: 'دعم 24/7', desc: 'نحن هنا لمساعدتك' },
];

const reviews = [
    { name: 'سارة أحمد', rating: 5, text: 'منتجات رائعة وجودة ممتازة! التوصيل كان سريع جداً والتغليف احترافي. أنصح الجميع بالتسوق من هنا.', verified: true },
    { name: 'محمد علي', rating: 5, text: 'أفضل متجر إلكتروني تعاملت معه. الأسعار منافسة والمنتجات أصلية 100%. شكراً لكم!', verified: true },
    { name: 'نورة خالد', rating: 4, text: 'تجربة تسوق ممتعة وسهلة. واجهة الموقع جميلة والمنتجات متنوعة. سأعود للشراء مرة أخرى بالتأكيد.', verified: true },
];

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [newProducts, setNewProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [featuredRes, newRes, catRes] = await Promise.all([
                    fetch('/api/products?featured=true&limit=8'),
                    fetch('/api/products?sort=newest&limit=4'),
                    fetch('/api/categories'),
                ]);
                const [featuredData, newData, catData] = await Promise.all([
                    featuredRes.json(),
                    newRes.json(),
                    catRes.json(),
                ]);
                setFeaturedProducts(featuredData.products || []);
                setNewProducts(newData.products || []);
                setCategories(catData.categories || []);
            } catch (error) {
                console.error('Failed to fetch homepage data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FEFCF9 0%, #F9F7F4 30%, #F5F3F0 60%, #FFFFFF 100%)' }}>
                {/* Subtle background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-50/30 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-rose-50/20 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-center min-h-[85vh] py-12 md:py-0">
                        {/* Right side — text content */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="space-y-6 md:space-y-8 text-center md:text-right order-2 md:order-1"
                        >
                            <motion.span
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium tracking-wider shadow-sm border border-white/50"
                            >
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                مجموعة 2025 الحصرية
                            </motion.span>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.1] tracking-tight">
                                اكتشف
                                <br />
                                <span className="bg-gradient-to-l from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-transparent">
                                    أناقتك
                                </span>
                                <br />
                                الفريدة
                            </h1>

                            <p className="text-muted text-base md:text-lg max-w-md mx-auto md:mx-0 leading-relaxed">
                                منتجات مختارة بعناية لتناسب ذوقك الرفيع. جودة استثنائية بأسعار تنافسية من أفخم الماركات العالمية.
                            </p>

                            <div className="flex flex-wrap gap-3 md:gap-4 justify-center md:justify-start">
                                <Link
                                    href="/products"
                                    className="px-8 py-4 bg-foreground text-white rounded-xl font-medium text-sm hover:bg-foreground/90 transition-all hover:shadow-xl hover:shadow-foreground/10 inline-flex items-center gap-2 group"
                                >
                                    تسوق الآن
                                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/collections/new-arrivals"
                                    className="px-8 py-4 bg-white/80 backdrop-blur-sm border border-foreground/10 rounded-xl font-medium text-sm hover:bg-white hover:border-foreground/30 transition-all hover:shadow-lg"
                                >
                                    وصل حديثاً
                                </Link>
                            </div>

                            {/* Social proof mini stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="flex items-center gap-6 md:gap-8 justify-center md:justify-start pt-4"
                            >
                                <div className="text-center md:text-right">
                                    <p className="text-2xl font-heading font-bold">+2500</p>
                                    <p className="text-xs text-muted">عميل سعيد</p>
                                </div>
                                <div className="w-px h-10 bg-border" />
                                <div className="text-center md:text-right">
                                    <p className="text-2xl font-heading font-bold">4.9★</p>
                                    <p className="text-xs text-muted">تقييم العملاء</p>
                                </div>
                                <div className="w-px h-10 bg-border" />
                                <div className="text-center md:text-right">
                                    <p className="text-2xl font-heading font-bold">شحن</p>
                                    <p className="text-xs text-muted">مجاني وسريع</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Left side — hero image with floating elements */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                            className="relative order-1 md:order-2"
                        >
                            {/* Main hero image */}
                            <div className="relative aspect-square max-w-lg mx-auto">
                                <img
                                    src="/hero-banner.png"
                                    alt="منتجات فاخرة"
                                    className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                                />

                                {/* Floating animated badges */}
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                    className="absolute top-4 md:top-8 right-0 md:-right-4 z-20 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg shadow-black/5 border border-white/50"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">%</span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-foreground">خصم حتى 30%</p>
                                            <p className="text-[10px] text-muted">على منتجات مختارة</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.5 }}
                                    className="absolute bottom-8 md:bottom-12 -left-2 md:-left-6 z-20 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg shadow-black/5 border border-white/50"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
                                            <Star size={14} className="text-white fill-white" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-foreground">الأعلى تقييماً</p>
                                            <p className="text-[10px] text-muted">+1200 تقييم إيجابي</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, -6, 0], x: [0, 4, 0] }}
                                    transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 1 }}
                                    className="absolute top-1/2 -right-2 md:-right-8 z-20 bg-gradient-to-r from-foreground to-foreground/90 rounded-full px-4 py-2 shadow-lg"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-white text-xs">⚡</span>
                                        <span className="text-white text-[11px] font-bold">عرض محدود</span>
                                    </div>
                                </motion.div>

                                {/* Decorative circles */}
                                <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-amber-200/30 rounded-full" />
                                <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-amber-200/20 rounded-full" />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom wave/curve separator */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
                        <path d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z" fill="white" />
                    </svg>
                </div>
            </section>

            {/* Trust Bar */}
            <section className="border-y border-border py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {trustItems.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3 justify-center"
                            >
                                <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center flex-shrink-0">
                                    <item.icon size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{item.title}</p>
                                    <p className="text-xs text-muted">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            {categories.length > 0 && (
                <section className="py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div {...fadeIn} className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">تسوق حسب التصنيف</h2>
                            <p className="text-muted">اختر من بين مجموعاتنا المتنوعة</p>
                        </motion.div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {categories.slice(0, 4).map((cat, i) => (
                                <motion.div
                                    key={cat._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link
                                        href={`/collections/${cat.slug}`}
                                        className="group relative block aspect-[3/4] rounded-xl overflow-hidden bg-surface"
                                    >
                                        {cat.image ? (
                                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-6">
                                            <h3 className="text-white font-heading text-xl font-bold">{cat.name}</h3>
                                            <span className="text-white/70 text-sm inline-flex items-center gap-1 mt-1 group-hover:gap-2 transition-all">
                                                تصفح المنتجات <ChevronLeft size={14} />
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Bestsellers / Featured Products */}
            <section className="py-16 md:py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeIn} className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">الأكثر مبيعاً</h2>
                            <p className="text-muted">المنتجات المفضلة لدى عملائنا</p>
                        </div>
                        <Link href="/products?sort=bestselling" className="hidden md:flex items-center gap-1 text-sm font-medium hover:text-muted transition-colors group">
                            عرض الكل <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="aspect-[3/4] skeleton rounded-xl" />
                                    <div className="h-4 skeleton w-3/4" />
                                    <div className="h-4 skeleton w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {(featuredProducts.length > 0 ? featuredProducts : [...Array(4)]).slice(0, 8).map((product, i) =>
                                product?._id ? (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ) : null
                            )}
                        </div>
                    )}
                    <div className="md:hidden text-center mt-8">
                        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-white rounded-lg text-sm font-medium">
                            عرض جميع المنتجات <ArrowLeft size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Brand Story Banner */}
            <section className="py-24 md:py-32 bg-foreground text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 leading-tight">
                            صُنع بشغف،
                            <br />
                            صُمم ليدوم
                        </h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                            نؤمن بأن الجودة ليست ترفاً بل ضرورة. كل منتج في متجرنا مختار بعناية فائقة ليمنحك تجربة استثنائية تستحقها.
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-foreground rounded-md font-medium text-sm hover:bg-white/90 transition-colors group"
                        >
                            اكتشف قصتنا
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* New Arrivals */}
            {newProducts.length > 0 && (
                <section className="py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div {...fadeIn} className="flex items-end justify-between mb-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">وصل حديثاً</h2>
                                <p className="text-muted">أحدث إضافاتنا للمتجر</p>
                            </div>
                            <Link href="/products?sort=newest" className="hidden md:flex items-center gap-1 text-sm font-medium hover:text-muted transition-colors group">
                                عرض الكل <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {newProducts.map((product, i) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Customer Reviews */}
            <section className="py-16 md:py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div {...fadeIn} className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">ماذا يقول عملاؤنا</h2>
                        <p className="text-muted">آراء حقيقية من عملاء حقيقيين</p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {reviews.map((review, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-xl p-6 shadow-sm"
                            >
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, j) => (
                                        <Star
                                            key={j}
                                            size={14}
                                            className={j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm leading-relaxed mb-4">{review.text}</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold">
                                        {review.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{review.name}</p>
                                        {review.verified && (
                                            <p className="text-[10px] text-success">✓ مشتري موثق</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Instagram UGC Grid */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">شاركنا أناقتك</h2>
                        <p className="text-muted">استخدم هاشتاق <span className="font-bold text-foreground">#متجري</span> وشاركنا صورك</p>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 cursor-pointer hover:opacity-80 transition-opacity">
                                <div className="w-full h-full flex items-center justify-center text-neutral-300 text-2xl">
                                    ✦
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
