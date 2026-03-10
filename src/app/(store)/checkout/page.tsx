'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/stores/cart';
import { formatPrice } from '@/lib/utils/helpers';
import { useRouter } from 'next/navigation';
import { Lock, CreditCard, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getTotal, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

    const [form, setForm] = useState({
        email: '', phone: '', fullName: '', address1: '', address2: '',
        city: '', state: '', zip: '', country: 'SA',
    });

    const subtotal = getTotal();
    const shippingCost = shippingMethod === 'express' ? 39.99 : (subtotal >= 200 ? 0 : 25);
    const tax = subtotal * 0.15;
    const total = subtotal + shippingCost + tax;

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: { name: form.fullName, email: form.email, phone: form.phone },
                    items: items.map(i => ({
                        productId: i.productId, name: i.name, image: i.image,
                        price: i.price, quantity: i.quantity, variant: i.variant,
                    })),
                    shippingAddress: form,
                    shippingCost,
                    subtotal,
                    tax,
                    total,
                }),
            });
            const data = await res.json();
            if (data.order) {
                clearCart();
                router.push(`/checkout/success?order=${data.order.orderNumber}`);
            } else {
                setError(data.error || 'حدث خطأ في إتمام الطلب');
            }
        } catch {
            setError('حدث خطأ، يرجى المحاولة مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-heading font-bold mb-4">سلتك فارغة</h1>
                <a href="/products" className="text-sm text-muted hover:text-foreground">العودة إلى المتجر</a>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Test mode banner */}
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-800">
                <AlertCircle size={16} />
                <span>🧪 وضع الاختبار — استخدم بطاقة 4242 4242 4242 4242</span>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Form */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Contact */}
                        <div>
                            <h2 className="text-lg font-heading font-bold mb-4">معلومات الاتصال</h2>
                            <div className="grid gap-4">
                                <input value={form.email} onChange={e => updateField('email', e.target.value)} type="email" placeholder="البريد الإلكتروني *" required className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                <input value={form.phone} onChange={e => updateField('phone', e.target.value)} type="tel" placeholder="رقم الهاتف" className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                            </div>
                        </div>

                        {/* Shipping */}
                        <div>
                            <h2 className="text-lg font-heading font-bold mb-4">عنوان الشحن</h2>
                            <div className="grid gap-4">
                                <input value={form.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="الاسم الكامل *" required className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                <input value={form.address1} onChange={e => updateField('address1', e.target.value)} placeholder="العنوان *" required className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                <input value={form.address2} onChange={e => updateField('address2', e.target.value)} placeholder="العنوان (سطر 2)" className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input value={form.city} onChange={e => updateField('city', e.target.value)} placeholder="المدينة *" required className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                    <input value={form.state} onChange={e => updateField('state', e.target.value)} placeholder="المنطقة *" required className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input value={form.zip} onChange={e => updateField('zip', e.target.value)} placeholder="الرمز البريدي *" required className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                    <select value={form.country} onChange={e => updateField('country', e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-white">
                                        <option value="SA">المملكة العربية السعودية</option>
                                        <option value="AE">الإمارات</option>
                                        <option value="KW">الكويت</option>
                                        <option value="QA">قطر</option>
                                        <option value="BH">البحرين</option>
                                        <option value="OM">عمان</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Method */}
                        <div>
                            <h2 className="text-lg font-heading font-bold mb-4">طريقة الشحن</h2>
                            <div className="space-y-3">
                                <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${shippingMethod === 'standard' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="accent-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">شحن عادي (5-7 أيام)</p>
                                            <p className="text-xs text-muted">التوصيل خلال 5 إلى 7 أيام عمل</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold">{subtotal >= 200 ? 'مجاني' : formatPrice(25)}</span>
                                </label>
                                <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${shippingMethod === 'express' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="accent-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">شحن سريع (2-3 أيام)</p>
                                            <p className="text-xs text-muted">التوصيل خلال 2 إلى 3 أيام عمل</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold">{formatPrice(39.99)}</span>
                                </label>
                            </div>
                        </div>

                        {/* Payment */}
                        <div>
                            <h2 className="text-lg font-heading font-bold mb-4">الدفع</h2>
                            <div className="p-4 border border-border rounded-lg bg-surface">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard size={18} />
                                    <span className="text-sm font-medium">بطاقة ائتمان / مدى</span>
                                </div>
                                <div className="space-y-3">
                                    <input placeholder="رقم البطاقة" className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="MM/YY" className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                        <input placeholder="CVC" className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-sale text-sm">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-foreground text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-50"
                        >
                            <Lock size={16} />
                            {loading ? 'جاري المعالجة...' : `إتمام الطلب • ${formatPrice(total)}`}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-2 lg:sticky lg:top-24 h-fit">
                    <div className="bg-white rounded-xl border border-border p-6 space-y-4">
                        <h2 className="font-heading text-lg font-bold">ملخص الطلب</h2>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {items.map(item => (
                                <div key={`${item.productId}-${item.variant}`} className="flex gap-3">
                                    <div className="relative w-16 h-16 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-foreground text-white text-[10px] rounded-full flex items-center justify-center">{item.quantity}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                        {item.variant && <p className="text-xs text-muted">{item.variant}</p>}
                                        <p className="text-sm font-bold mt-1">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <hr className="border-border" />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted">المجموع الفرعي</span><span>{formatPrice(subtotal)}</span></div>
                            <div className="flex justify-between"><span className="text-muted">الشحن</span><span>{shippingCost === 0 ? <span className="text-success">مجاني</span> : formatPrice(shippingCost)}</span></div>
                            <div className="flex justify-between"><span className="text-muted">الضريبة (15%)</span><span>{formatPrice(tax)}</span></div>
                        </div>
                        <hr className="border-border" />
                        <div className="flex justify-between text-lg font-bold">
                            <span>المجموع</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
