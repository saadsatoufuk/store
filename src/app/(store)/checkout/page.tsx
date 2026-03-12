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
    const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'stc_pay' | 'cod'>('bank_transfer');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    const [form, setForm] = useState({
        email: '', phone: '', fullName: '', address1: '', address2: '',
        city: '', state: '', zip: '', country: 'SA',
        transactionId: '', senderName: '', senderPhone: '', bankName: '', iban: ''
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
        
        if (paymentMethod !== 'cod' && !receiptFile) {
            setError('الرجاء إرفاق صورة الإيصال أو الحوالة');
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            let paymentReceiptUrl = '';

            if (receiptFile) {
                const formData = new FormData();
                formData.append('file', receiptFile);
                const uploadRes = await fetch('/api/upload-payment-receipt', {
                    method: 'POST',
                    body: formData,
                });
                if (!uploadRes.ok) throw new Error('فشل رفع الإيصال');
                const uploadData = await uploadRes.json();
                paymentReceiptUrl = uploadData.url;
            }

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
                    paymentMethod,
                    transactionId: form.transactionId,
                    senderName: form.senderName,
                    senderPhone: form.senderPhone,
                    bankName: form.bankName,
                    iban: form.iban,
                    paymentReceiptUrl,
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
                            <div className="space-y-4">
                                {/* Bank Transfer */}
                                <label className={`block p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'bank_transfer' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input type="radio" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} className="accent-foreground" />
                                        <span className="font-medium">تحويل بنكي</span>
                                    </div>
                                    {paymentMethod === 'bank_transfer' && (
                                        <div className="mt-4 space-y-3 pl-7">
                                            <p className="text-sm text-muted">الرجاء تحويل مبلغ الطلب إلى الحساب البنكي أدناه وإرفاق صورة الإيصال.</p>
                                            <input value={form.bankName} onChange={e => updateField('bankName', e.target.value)} placeholder="اسم البنك المحول منه *" required className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                            <input value={form.senderName} onChange={e => updateField('senderName', e.target.value)} placeholder="اسم صاحب الحساب *" required className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                            <input value={form.iban} onChange={e => updateField('iban', e.target.value)} placeholder="رقم الآيبان (IBAN) *" required className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                            <input value={form.transactionId} onChange={e => updateField('transactionId', e.target.value)} placeholder="الرقم المرجعي للحوالة *" required className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                            <div>
                                                <label className="block text-sm font-medium mb-1">صورة إيصال التحويل *</label>
                                                <input type="file" accept="image/*" onChange={e => setReceiptFile(e.target.files?.[0] || null)} required className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-foreground/10 file:text-foreground hover:file:bg-foreground/20" />
                                            </div>
                                        </div>
                                    )}
                                </label>

                                {/* STC Pay */}
                                <label className={`block p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'stc_pay' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input type="radio" checked={paymentMethod === 'stc_pay'} onChange={() => setPaymentMethod('stc_pay')} className="accent-foreground" />
                                        <span className="font-medium">STC Pay</span>
                                    </div>
                                    {paymentMethod === 'stc_pay' && (
                                        <div className="mt-4 space-y-3 pl-7">
                                            <p className="text-sm text-muted">الرجاء إرسال المبلغ إلى رقم STC Pay أدناه وإرفاق لقطة شاشة للتحويل.</p>
                                            <div className="p-3 bg-white rounded-lg border border-border mb-3 text-center">
                                                <p className="text-sm font-bold text-foreground">رقم STC Pay: 05X XXX XXXX</p>
                                            </div>
                                            <input value={form.senderName} onChange={e => updateField('senderName', e.target.value)} placeholder="اسم المرسل *" required className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                            <input value={form.senderPhone} onChange={e => updateField('senderPhone', e.target.value)} placeholder="رقم STC Pay المحول منه *" required className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                            <input value={form.transactionId} onChange={e => updateField('transactionId', e.target.value)} placeholder="الرقم المرجعي *" required className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                                            <div>
                                                <label className="block text-sm font-medium mb-1">صورة الإيصال *</label>
                                                <input type="file" accept="image/*" onChange={e => setReceiptFile(e.target.files?.[0] || null)} required className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-foreground/10 file:text-foreground hover:file:bg-foreground/20" />
                                            </div>
                                        </div>
                                    )}
                                </label>

                                {/* Cash on Delivery */}
                                <label className={`block p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-foreground" />
                                        <span className="font-medium">الدفع عند الاستلام</span>
                                    </div>
                                    {paymentMethod === 'cod' && (
                                        <div className="mt-2 pl-7">
                                            <p className="text-sm text-muted">ستقوم بالدفع عند استلام الطلب.</p>
                                        </div>
                                    )}
                                </label>
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
