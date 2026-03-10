'use client';

import { useEffect, useState } from 'react';
import { Save, Palette, Store, Phone, Mail, Type, Plus, Trash2 } from 'lucide-react';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({ siteName: '', logoUrl: '', primaryColor: '', contactEmail: '', phone: '', footerText: '', freeShippingThreshold: 200, flatRateShipping: 25, taxRate: 15, currency: 'SAR' });
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percentage', value: '', minOrderAmount: '', maxUses: '' });
    const [showCouponForm, setShowCouponForm] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/settings').then(r => r.json()),
            fetch('/api/admin/coupons').then(r => r.json()).catch(() => ({ coupons: [] })),
        ]).then(([settingsData, couponsData]) => {
            if (settingsData.settings) setSettings(settingsData.settings);
            setCoupons(couponsData.coupons || []);
            setLoading(false);
        });
    }, []);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
            setMessage('تم حفظ الإعدادات بنجاح');
            setTimeout(() => setMessage(''), 3000);
        } catch { setMessage('حدث خطأ'); }
        setSaving(false);
    };

    const handleAddCoupon = async () => {
        await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newCoupon, value: parseFloat(newCoupon.value), minOrderAmount: parseFloat(newCoupon.minOrderAmount) || 0, maxUses: parseInt(newCoupon.maxUses) || 0 }) });
        setShowCouponForm(false);
        setNewCoupon({ code: '', type: 'percentage', value: '', minOrderAmount: '', maxUses: '' });
        const res = await fetch('/api/admin/coupons');
        const data = await res.json();
        setCoupons(data.coupons || []);
    };

    const handleDeleteCoupon = async (id: string) => {
        await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
        setCoupons(prev => prev.filter(c => c._id !== id));
    };

    if (loading) return <div dir="rtl"><div className="h-8 skeleton w-1/3 mb-4" /><div className="h-96 skeleton rounded-xl" /></div>;

    return (
        <div dir="rtl" className="space-y-8 max-w-3xl">
            <div><h1 className="text-2xl font-heading font-bold">الإعدادات</h1><p className="text-muted text-sm">إعدادات المتجر والعلامة التجارية</p></div>

            {message && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{message}</div>}

            {/* Branding */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-bold flex items-center gap-2"><Store size={18} /> العلامة التجارية</h2>
                <div className="grid gap-4">
                    <div><label className="text-sm font-medium mb-1 block">اسم المتجر</label><input value={settings.siteName} onChange={e => setSettings(p => ({ ...p, siteName: e.target.value }))} className="w-full px-4 py-3 border border-border rounded-lg text-sm" /></div>
                    <div><label className="text-sm font-medium mb-1 block">رابط الشعار</label><input value={settings.logoUrl} onChange={e => setSettings(p => ({ ...p, logoUrl: e.target.value }))} className="w-full px-4 py-3 border border-border rounded-lg text-sm" /></div>
                    <div>
                        <label className="text-sm font-medium mb-1 block flex items-center gap-2"><Palette size={14} /> اللون الرئيسي</label>
                        <div className="flex items-center gap-3">
                            <input type="color" value={settings.primaryColor} onChange={e => setSettings(p => ({ ...p, primaryColor: e.target.value }))} className="w-12 h-12 rounded-lg cursor-pointer border-0" />
                            <input value={settings.primaryColor} onChange={e => setSettings(p => ({ ...p, primaryColor: e.target.value }))} className="flex-1 px-4 py-3 border border-border rounded-lg text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-bold flex items-center gap-2"><Mail size={18} /> معلومات الاتصال</h2>
                <div className="grid gap-4">
                    <input value={settings.contactEmail} onChange={e => setSettings(p => ({ ...p, contactEmail: e.target.value }))} placeholder="البريد الإلكتروني" className="w-full px-4 py-3 border border-border rounded-lg text-sm" />
                    <input value={settings.phone} onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))} placeholder="رقم الهاتف" className="w-full px-4 py-3 border border-border rounded-lg text-sm" />
                    <input value={settings.footerText} onChange={e => setSettings(p => ({ ...p, footerText: e.target.value }))} placeholder="نص الفوتر" className="w-full px-4 py-3 border border-border rounded-lg text-sm" />
                </div>
            </div>

            {/* Shipping & Tax */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
                <h2 className="font-bold">الشحن والضريبة</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                    <div><label className="text-sm font-medium mb-1 block">حد الشحن المجاني (ر.س)</label><input type="number" value={settings.freeShippingThreshold} onChange={e => setSettings(p => ({ ...p, freeShippingThreshold: parseFloat(e.target.value) }))} className="w-full px-4 py-3 border border-border rounded-lg text-sm" /></div>
                    <div><label className="text-sm font-medium mb-1 block">سعر الشحن الثابت (ر.س)</label><input type="number" value={settings.flatRateShipping} onChange={e => setSettings(p => ({ ...p, flatRateShipping: parseFloat(e.target.value) }))} className="w-full px-4 py-3 border border-border rounded-lg text-sm" /></div>
                    <div><label className="text-sm font-medium mb-1 block">نسبة الضريبة (%)</label><input type="number" value={settings.taxRate} onChange={e => setSettings(p => ({ ...p, taxRate: parseFloat(e.target.value) }))} className="w-full px-4 py-3 border border-border rounded-lg text-sm" /></div>
                </div>
            </div>

            {/* Coupons */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold">أكواد الخصم</h2>
                    <button onClick={() => setShowCouponForm(true)} className="px-3 py-1.5 bg-foreground text-white rounded-lg text-xs font-medium flex items-center gap-1"><Plus size={12} /> إضافة كود</button>
                </div>
                {showCouponForm && (
                    <div className="p-4 bg-surface rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <input value={newCoupon.code} onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="الكود" className="px-3 py-2 border border-border rounded-lg text-sm" />
                            <select value={newCoupon.type} onChange={e => setNewCoupon(p => ({ ...p, type: e.target.value }))} className="px-3 py-2 border border-border rounded-lg text-sm bg-white">
                                <option value="percentage">نسبة مئوية</option><option value="fixed">مبلغ ثابت</option>
                            </select>
                            <input value={newCoupon.value} onChange={e => setNewCoupon(p => ({ ...p, value: e.target.value }))} placeholder="القيمة" type="number" className="px-3 py-2 border border-border rounded-lg text-sm" />
                            <input value={newCoupon.minOrderAmount} onChange={e => setNewCoupon(p => ({ ...p, minOrderAmount: e.target.value }))} placeholder="الحد الأدنى للطلب" type="number" className="px-3 py-2 border border-border rounded-lg text-sm" />
                        </div>
                        <div className="flex gap-2"><button onClick={handleAddCoupon} className="px-4 py-2 bg-foreground text-white rounded-lg text-xs">حفظ</button><button onClick={() => setShowCouponForm(false)} className="px-4 py-2 border border-border rounded-lg text-xs">إلغاء</button></div>
                    </div>
                )}
                <div className="space-y-2">
                    {coupons.map(c => (
                        <div key={c._id} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                            <div><span className="font-mono font-bold text-sm">{c.code}</span><span className="text-xs text-muted mr-2">{c.type === 'percentage' ? `${c.value}%` : `${c.value} ر.س`}</span></div>
                            <button onClick={() => handleDeleteCoupon(c._id)} className="text-muted hover:text-sale"><Trash2 size={14} /></button>
                        </div>
                    ))}
                    {coupons.length === 0 && !showCouponForm && <p className="text-sm text-muted text-center py-4">لا توجد أكواد خصم</p>}
                </div>
            </div>

            <button onClick={handleSaveSettings} disabled={saving} className="px-8 py-3 bg-foreground text-white rounded-lg font-medium flex items-center gap-2 hover:bg-foreground/90 disabled:opacity-50">
                <Save size={16} />{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
        </div>
    );
}
