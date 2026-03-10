'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { User, Package, MapPin, Heart, LogOut, Mail, Lock, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

const statusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-700',
    unfulfilled: 'bg-amber-100 text-amber-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
};
const statusLabels: Record<string, string> = {
    paid: 'مدفوع', pending: 'معلق', failed: 'فشل', refunded: 'مسترد',
    unfulfilled: 'لم يشحن', processing: 'قيد المعالجة', shipped: 'تم الشحن', delivered: 'تم التوصيل', cancelled: 'ملغي',
};

interface OrderItem {
    name: string; image: string; price: number; quantity: number; variant?: string;
}
interface Order {
    _id: string; orderNumber: string; createdAt: string;
    items: OrderItem[]; total: number; subtotal: number; shippingCost: number; tax: number;
    paymentStatus: string; fulfillmentStatus: string;
    shippingAddress?: { city?: string; country?: string };
}

function AccountContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'profile';
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Dynamic siteId resolved from current host
    const [siteId, setSiteId] = useState<string>('');

    // Orders state
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    // Resolve siteId from current host on mount
    useEffect(() => {
        fetch(`/api/internal/resolve-site?host=${encodeURIComponent(window.location.host)}`)
            .then(r => r.json())
            .then(data => { if (data.siteId) setSiteId(data.siteId); })
            .catch(() => {});
    }, []);

    // Fetch user orders when orders tab is active and user is logged in
    useEffect(() => {
        if (activeTab === 'orders' && session?.user) {
            setOrdersLoading(true);
            fetch('/api/orders/my')
                .then(r => r.json())
                .then(data => { setOrders(data.orders || []); })
                .catch(() => { setOrders([]); })
                .finally(() => setOrdersLoading(false));
        }
    }, [activeTab, session]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const res = await signIn('credentials', { email: loginForm.email, password: loginForm.password, siteId, redirect: false });
            if (res?.error) setError('بيانات الدخول غير صحيحة');
        } catch {
            setError('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(registerForm) });
            const data = await res.json();
            if (data.success) { await signIn('credentials', { email: registerForm.email, password: registerForm.password, siteId, redirect: false }); }
            else { setError(data.error || 'حدث خطأ في التسجيل'); }
        } catch { setError('حدث خطأ'); }
        setLoading(false);
    };

    if (status === 'loading') return <div className="max-w-4xl mx-auto px-4 py-24 text-center"><div className="h-8 skeleton w-1/3 mx-auto" /></div>;

    if (!session) {
        return (
            <div className="max-w-md mx-auto px-4 py-16">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold mb-2">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}</h1>
                    <p className="text-muted text-sm">{isLogin ? 'أدخل بياناتك للمتابعة' : 'أنشئ حسابك الآن'}</p>
                </div>
                {isLogin ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative"><Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" /><input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} placeholder="البريد الإلكتروني" required className="w-full pl-4 pr-10 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" /></div>
                        <div className="relative"><Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" /><input type={showPassword ? 'text' : 'password'} value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} placeholder="كلمة المرور" required className="w-full pl-10 pr-10 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
                        {error && <p className="text-sale text-sm">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full py-3 bg-foreground text-white rounded-lg font-medium disabled:opacity-50">{loading ? 'جاري الدخول...' : 'تسجيل الدخول'}</button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <input type="text" value={registerForm.name} onChange={e => setRegisterForm(p => ({ ...p, name: e.target.value }))} placeholder="الاسم الكامل" required className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                        <input type="email" value={registerForm.email} onChange={e => setRegisterForm(p => ({ ...p, email: e.target.value }))} placeholder="البريد الإلكتروني" required className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                        <input type="password" value={registerForm.password} onChange={e => setRegisterForm(p => ({ ...p, password: e.target.value }))} placeholder="كلمة المرور" required minLength={6} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" />
                        {error && <p className="text-sale text-sm">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full py-3 bg-foreground text-white rounded-lg font-medium disabled:opacity-50">{loading ? 'جاري التسجيل...' : 'إنشاء حساب'}</button>
                    </form>
                )}
                <p className="text-center text-sm text-muted mt-6">{isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}{' '}<button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-foreground font-medium hover:underline">{isLogin ? 'سجل الآن' : 'سجل دخولك'}</button></p>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', icon: User, label: 'الملف الشخصي' },
        { id: 'orders', icon: Package, label: 'طلباتي' },
        { id: 'addresses', icon: MapPin, label: 'العناوين' },
        { id: 'wishlist', icon: Heart, label: 'المفضلة' },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-heading font-bold mb-8">حسابي</h1>
            <div className="grid md:grid-cols-4 gap-8">
                <aside className="space-y-1">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-foreground text-white' : 'text-muted hover:bg-surface'}`}>
                            <tab.icon size={16} />{tab.label}
                        </button>
                    ))}
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-muted hover:bg-surface hover:text-sale transition-colors">
                        <LogOut size={16} />تسجيل الخروج
                    </button>
                </aside>

                <div className="md:col-span-3">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-heading font-bold text-lg mb-4">الملف الشخصي</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center text-xl font-bold">{session.user?.name?.[0]}</div>
                                    <div>
                                        <p className="font-medium">{session.user?.name}</p>
                                        <p className="text-sm text-muted">{session.user?.email}</p>
                                    </div>
                                </div>
                                <input defaultValue={session.user?.name || ''} placeholder="الاسم" className="w-full px-4 py-3 border border-border rounded-lg text-sm" />
                                <input defaultValue={session.user?.email || ''} placeholder="البريد الإلكتروني" className="w-full px-4 py-3 border border-border rounded-lg text-sm" disabled />
                                <button className="px-6 py-3 bg-foreground text-white rounded-lg text-sm font-medium">حفظ التغييرات</button>
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-border p-6">
                                <h2 className="font-heading font-bold text-lg mb-4">طلباتي</h2>

                                {ordersLoading ? (
                                    <div className="space-y-3">
                                        {[...Array(3)].map((_, i) => <div key={i} className="h-20 skeleton rounded-lg" />)}
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package size={48} className="mx-auto text-border mb-4" />
                                        <p className="text-muted mb-2">لا توجد طلبات حالياً</p>
                                        <a href="/products" className="text-sm text-foreground font-medium hover:underline">تصفح المنتجات</a>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.map(order => (
                                            <div key={order._id} className="border border-border rounded-lg overflow-hidden">
                                                {/* Order Header */}
                                                <button
                                                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-surface/50 transition-colors text-right"
                                                >
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <div className="flex-shrink-0">
                                                            <p className="text-sm font-bold">{order.orderNumber}</p>
                                                            <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColors[order.paymentStatus] || 'bg-gray-100'}`}>
                                                                {statusLabels[order.paymentStatus] || order.paymentStatus}
                                                            </span>
                                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${statusColors[order.fulfillmentStatus] || 'bg-gray-100'}`}>
                                                                {statusLabels[order.fulfillmentStatus] || order.fulfillmentStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-shrink-0 mr-4">
                                                        <span className="text-sm font-bold">{order.total?.toFixed(0)} ر.س</span>
                                                        {expandedOrder === order._id ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                                                    </div>
                                                </button>

                                                {/* Order Details (expanded) */}
                                                {expandedOrder === order._id && (
                                                    <div className="border-t border-border p-4 bg-surface/30 space-y-4">
                                                        {/* Items */}
                                                        <div className="space-y-3">
                                                            {order.items?.map((item, i) => (
                                                                <div key={i} className="flex items-center gap-3">
                                                                    <div className="w-14 h-14 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                                                                        {item.image ? (
                                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-muted text-xl">✦</div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                                                        {item.variant && <p className="text-xs text-muted">{item.variant}</p>}
                                                                        <p className="text-xs text-muted">الكمية: {item.quantity}</p>
                                                                    </div>
                                                                    <p className="text-sm font-bold flex-shrink-0">{(item.price * item.quantity).toFixed(0)} ر.س</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Order Summary */}
                                                        <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                                                            <div className="flex justify-between"><span className="text-muted">المجموع الفرعي</span><span>{order.subtotal?.toFixed(0)} ر.س</span></div>
                                                            <div className="flex justify-between"><span className="text-muted">الشحن</span><span>{order.shippingCost === 0 ? <span className="text-success">مجاني</span> : `${order.shippingCost?.toFixed(0)} ر.س`}</span></div>
                                                            {order.tax > 0 && <div className="flex justify-between"><span className="text-muted">الضريبة</span><span>{order.tax?.toFixed(0)} ر.س</span></div>}
                                                            <div className="flex justify-between font-bold text-base pt-1 border-t border-border"><span>المجموع</span><span>{order.total?.toFixed(0)} ر.س</span></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Addresses Tab */}
                    {activeTab === 'addresses' && (
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-heading font-bold text-lg mb-4">العناوين المحفوظة</h2>
                            <div className="text-center py-12">
                                <MapPin size={48} className="mx-auto text-border mb-4" />
                                <p className="text-muted">لا توجد عناوين محفوظة</p>
                                <button className="mt-4 px-6 py-3 bg-foreground text-white rounded-lg text-sm font-medium">إضافة عنوان</button>
                            </div>
                        </div>
                    )}

                    {/* Wishlist Tab */}
                    {activeTab === 'wishlist' && (
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="font-heading font-bold text-lg mb-4">المفضلة</h2>
                            <div className="text-center py-12">
                                <Heart size={48} className="mx-auto text-border mb-4" />
                                <p className="text-muted">قائمة المفضلة فارغة</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AccountPage() {
    return (
        <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-24 text-center"><div className="h-8 skeleton w-1/3 mx-auto" /></div>}>
            <AccountContent />
        </Suspense>
    );
}
