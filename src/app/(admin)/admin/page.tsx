'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, TrendingUp, AlertTriangle, Package } from 'lucide-react';

interface DashboardData {
    todayRevenue: number;
    todayOrders: number;
    totalCustomers: number;
    recentOrders: Array<{ _id: string; orderNumber: string; customer: { name: string }; total: number; paymentStatus: string; fulfillmentStatus: string; createdAt: string }>;
    lowStock: Array<{ _id: string; name: string; totalStock: number; images: string[] }>;
}

const statusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
    unfulfilled: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
    paid: 'مدفوع', pending: 'معلق', failed: 'فشل', refunded: 'مسترد',
    unfulfilled: 'لم يشحن', processing: 'قيد المعالجة', shipped: 'تم الشحن', delivered: 'تم التوصيل', cancelled: 'ملغي',
};

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    fetch('/api/orders'),
                    fetch('/api/products?limit=100'),
                ]);
                const [ordersData, productsData] = await Promise.all([ordersRes.json(), productsRes.json()]);

                const orders = ordersData.orders || [];
                const products = productsData.products || [];
                const today = new Date().toDateString();
                const todayOrders = orders.filter((o: any) => new Date(o.createdAt).toDateString() === today);

                setData({
                    todayRevenue: todayOrders.reduce((sum: number, o: any) => sum + o.total, 0),
                    todayOrders: todayOrders.length,
                    totalCustomers: new Set(orders.map((o: any) => o.customer?.email)).size,
                    recentOrders: orders.slice(0, 10),
                    lowStock: products.filter((p: any) => p.totalStock > 0 && p.totalStock <= 5),
                });
            } catch (error) {
                console.error('Dashboard fetch error:', error);
            }
            setLoading(false);
        }
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div dir="rtl" className="space-y-6">
                <div className="h-8 skeleton w-1/3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-xl" />)}</div>
                <div className="h-64 skeleton rounded-xl" />
            </div>
        );
    }

    const kpis = [
        { label: 'إيرادات اليوم', value: `${data?.todayRevenue?.toFixed(0) || 0} ر.س`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
        { label: 'طلبات اليوم', value: data?.todayOrders || 0, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
        { label: 'إجمالي العملاء', value: data?.totalCustomers || 0, icon: Users, color: 'bg-purple-50 text-purple-600' },
        { label: 'معدل التحويل', value: '3.2%', icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
    ];

    return (
        <div dir="rtl" className="space-y-6">
            <div>
                <h1 className="text-2xl font-heading font-bold">لوحة التحكم</h1>
                <p className="text-muted text-sm">نظرة عامة على أداء المتجر</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted">{kpi.label}</span>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.color}`}>
                                <kpi.icon size={18} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">{kpi.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-border">
                    <div className="p-5 border-b border-border flex items-center justify-between">
                        <h2 className="font-bold">آخر الطلبات</h2>
                        <a href="/admin/orders" className="text-sm text-muted hover:text-foreground">عرض الكل</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border text-muted"><th className="p-4 text-right font-medium">رقم الطلب</th><th className="p-4 text-right font-medium">العميل</th><th className="p-4 text-right font-medium">المبلغ</th><th className="p-4 text-right font-medium">الحالة</th></tr></thead>
                            <tbody>
                                {(data?.recentOrders || []).map(order => (
                                    <tr key={order._id} className="border-b border-border hover:bg-surface/50 transition-colors">
                                        <td className="p-4 font-medium">{order.orderNumber}</td>
                                        <td className="p-4">{order.customer?.name || 'غير معروف'}</td>
                                        <td className="p-4 font-medium">{order.total?.toFixed(0)} ر.س</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${statusColors[order.fulfillmentStatus] || 'bg-gray-100'}`}>
                                                {statusLabels[order.fulfillmentStatus] || order.fulfillmentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!data?.recentOrders?.length) && (
                                    <tr><td colSpan={4} className="p-8 text-center text-muted">لا توجد طلبات بعد</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock */}
                <div className="bg-white rounded-xl border border-border">
                    <div className="p-5 border-b border-border">
                        <h2 className="font-bold flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> تنبيه المخزون</h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {(data?.lowStock || []).length > 0 ? data?.lowStock?.map(product => (
                            <div key={product._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors">
                                <div className="w-10 h-10 bg-surface rounded-lg overflow-hidden">
                                    {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{product.name}</p>
                                    <p className="text-xs text-red-500 font-medium">باقي {product.totalStock} فقط</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-muted text-sm">
                                <Package size={32} className="mx-auto mb-2 text-border" />
                                المخزون بحالة جيدة
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
