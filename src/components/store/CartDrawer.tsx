'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart';
import { formatPrice } from '@/lib/utils/helpers';
import Link from 'next/link';
import Image from 'next/image';

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();

    const freeShippingThreshold = 200;
    const total = getTotal();
    const remaining = Math.max(0, freeShippingThreshold - total);
    const progress = Math.min((total / freeShippingThreshold) * 100, 100);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/50 z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
                        dir="rtl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <ShoppingBag size={20} />
                                <h2 className="font-heading text-lg font-bold">سلة التسوق</h2>
                                <span className="text-sm text-muted">({getItemCount()})</span>
                            </div>
                            <button onClick={closeCart} className="p-2 hover:bg-surface rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Free Shipping Bar */}
                        {items.length > 0 && (
                            <div className="px-4 py-3 bg-surface">
                                {remaining > 0 ? (
                                    <>
                                        <p className="text-xs text-muted mb-2">
                                            أضف <span className="font-bold text-foreground">{formatPrice(remaining)}</span> للحصول على شحن مجاني!
                                        </p>
                                        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-foreground rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-xs text-success font-medium">🎉 تهانينا! حصلت على شحن مجاني</p>
                                )}
                            </div>
                        )}

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {items.length === 0 ? (
                                <div className="text-center py-16">
                                    <ShoppingBag size={48} className="mx-auto text-border mb-4" />
                                    <p className="text-muted font-medium mb-2">سلتك فارغة</p>
                                    <p className="text-sm text-muted mb-6">أضف بعض المنتجات الرائعة!</p>
                                    <Link href="/products" onClick={closeCart} className="inline-block px-6 py-3 bg-foreground text-white rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors">
                                        تصفح المنتجات
                                    </Link>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={`${item.productId}-${item.variant}`} className="flex gap-3">
                                        <Link href={`/products/${item.slug}`} onClick={closeCart} className="w-20 h-20 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/products/${item.slug}`} onClick={closeCart}>
                                                <h3 className="text-sm font-medium truncate hover:text-muted transition-colors">{item.name}</h3>
                                            </Link>
                                            {item.variant && (
                                                <p className="text-xs text-muted mt-0.5">{item.variant}</p>
                                            )}
                                            <p className="text-sm font-bold mt-1">{formatPrice(item.price)}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1 border border-border rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.variant, item.quantity - 1)}
                                                        className="p-1.5 hover:bg-surface rounded-r-lg transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm w-8 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.variant, item.quantity + 1)}
                                                        className="p-1.5 hover:bg-surface rounded-l-lg transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.productId, item.variant)}
                                                    className="p-1.5 text-muted hover:text-sale transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-border p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted">المجموع الفرعي</span>
                                    <span className="text-lg font-bold">{formatPrice(total)}</span>
                                </div>
                                <p className="text-xs text-muted">الشحن والضريبة تحسب عند الدفع</p>
                                <Link
                                    href="/checkout"
                                    onClick={closeCart}
                                    className="block w-full py-3.5 bg-foreground text-white text-center rounded-lg font-medium hover:bg-foreground/90 transition-colors"
                                >
                                    إتمام الشراء
                                </Link>
                                <Link
                                    href="/cart"
                                    onClick={closeCart}
                                    className="block w-full py-3 border border-border text-center rounded-lg text-sm font-medium hover:bg-surface transition-colors"
                                >
                                    عرض السلة
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
