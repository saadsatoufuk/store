'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart';
import { formatPrice } from '@/lib/utils/helpers';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [discount, setDiscount] = useState(0);

    const subtotal = getTotal();
    const freeShippingThreshold = 200;
    const shipping = subtotal >= freeShippingThreshold ? 0 : 25;
    const total = subtotal - discount + shipping;
    const remaining = Math.max(0, freeShippingThreshold - subtotal);

    const applyCoupon = async () => {
        setCouponError('');
        try {
            const res = await fetch(`/api/coupons/validate?code=${couponCode}&subtotal=${subtotal}`);
            const data = await res.json();
            if (data.valid) {
                setDiscount(data.discount);
            } else {
                setCouponError(data.message || 'كود الخصم غير صالح');
            }
        } catch {
            setCouponError('حدث خطأ، حاول مرة أخرى');
        }
    };

    if (items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-24 text-center">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <ShoppingBag size={64} className="mx-auto text-border mb-6" />
                    <h1 className="text-3xl font-heading font-bold mb-3">سلتك فارغة</h1>
                    <p className="text-muted mb-8">يبدو أنك لم تضف أي منتجات بعد. تصفح متجرنا واكتشف منتجاتنا المميزة!</p>
                    <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-white rounded-lg font-medium hover:bg-foreground/90 transition-colors">
                        تصفح المنتجات <ArrowLeft size={16} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="text-sm text-muted mb-6">
                <Link href="/" className="hover:text-foreground">الرئيسية</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground font-medium">سلة التسوق</span>
            </nav>

            <h1 className="text-3xl font-heading font-bold mb-8">سلة التسوق ({items.length})</h1>

            {/* Free shipping bar */}
            {remaining > 0 && (
                <div className="mb-6 p-4 bg-surface rounded-xl">
                    <p className="text-sm mb-2">أضف <span className="font-bold">{formatPrice(remaining)}</span> للحصول على شحن مجاني! 🚚</p>
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-foreground rounded-full transition-all" style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }} />
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map(item => (
                        <div key={`${item.productId}-${item.variant}`} className="flex gap-4 p-4 bg-white rounded-xl border border-border">
                            <Link href={`/products/${item.slug}`} className="w-24 h-24 md:w-32 md:h-32 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </Link>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <Link href={`/products/${item.slug}`}><h3 className="font-medium hover:text-muted transition-colors">{item.name}</h3></Link>
                                        {item.variant && <p className="text-xs text-muted mt-1">{item.variant}</p>}
                                    </div>
                                    <button onClick={() => removeItem(item.productId, item.variant)} className="p-1.5 text-muted hover:text-sale transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center border border-border rounded-lg">
                                        <button onClick={() => updateQuantity(item.productId, item.variant, item.quantity - 1)} className="p-2 hover:bg-surface rounded-r-lg"><Minus size={14} /></button>
                                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, item.variant, item.quantity + 1)} className="p-2 hover:bg-surface rounded-l-lg"><Plus size={14} /></button>
                                    </div>
                                    <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={clearCart} className="text-sm text-muted hover:text-sale transition-colors">
                        مسح السلة
                    </button>
                </div>

                {/* Order Summary */}
                <div className="lg:sticky lg:top-24 h-fit">
                    <div className="bg-white rounded-xl border border-border p-6 space-y-4">
                        <h2 className="font-heading text-lg font-bold">ملخص الطلب</h2>

                        {/* Coupon */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                placeholder="كود الخصم"
                                className="flex-1 px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
                            />
                            <button onClick={applyCoupon} className="px-4 py-2.5 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-border transition-colors">
                                تطبيق
                            </button>
                        </div>
                        {couponError && <p className="text-xs text-sale">{couponError}</p>}
                        {discount > 0 && <p className="text-xs text-success flex items-center gap-1"><Tag size={12} /> خصم {formatPrice(discount)}</p>}

                        <hr className="border-border" />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted">المجموع الفرعي</span><span>{formatPrice(subtotal)}</span></div>
                            {discount > 0 && <div className="flex justify-between text-success"><span>الخصم</span><span>-{formatPrice(discount)}</span></div>}
                            <div className="flex justify-between"><span className="text-muted">الشحن</span><span>{shipping === 0 ? <span className="text-success">مجاني</span> : formatPrice(shipping)}</span></div>
                        </div>
                        <hr className="border-border" />
                        <div className="flex justify-between text-lg font-bold">
                            <span>المجموع</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                        <Link href="/checkout" className="block w-full py-3.5 bg-foreground text-white text-center rounded-lg font-medium hover:bg-foreground/90 transition-colors">
                            إتمام الشراء
                        </Link>
                        <Link href="/products" className="block text-center text-sm text-muted hover:text-foreground transition-colors">
                            متابعة التسوق
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
