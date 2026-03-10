'use client';

import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';

export default function AdminAnalyticsPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders').then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false); });
    }, []);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue by month
    const monthlyRevenue: Record<string, number> = {};
    orders.forEach(o => {
        const month = new Date(o.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (o.total || 0);
    });

    // Top products
    const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
    orders.forEach(o => {
        o.items?.forEach((item: any) => {
            const key = item.name;
            if (!productSales[key]) productSales[key] = { name: key, count: 0, revenue: 0 };
            productSales[key].count += item.quantity;
            productSales[key].revenue += item.price * item.quantity;
        });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    if (loading) return <div dir="rtl" className="space-y-6"><div className="h-8 skeleton w-1/3" /><div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 skeleton rounded-xl" />)}</div></div>;

    return (
        <div dir="rtl" className="space-y-6">
            <div><h1 className="text-2xl font-heading font-bold">التحليلات</h1><p className="text-muted text-sm">نظرة شاملة على أداء المتجر</p></div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'إجمالي الإيرادات', value: `${totalRevenue.toFixed(0)} ر.س` },
                    { label: 'إجمالي الطلبات', value: totalOrders },
                    { label: 'متوسط قيمة الطلب', value: `${avgOrderValue.toFixed(0)} ر.س` },
                ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl border border-border p-5">
                        <p className="text-sm text-muted mb-1">{item.label}</p>
                        <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white rounded-xl border border-border p-6">
                <h2 className="font-bold mb-4">الإيرادات الشهرية</h2>
                {Object.keys(monthlyRevenue).length > 0 ? (
                    <div className="space-y-3">
                        {Object.entries(monthlyRevenue).map(([month, revenue]) => (
                            <div key={month} className="flex items-center gap-3">
                                <span className="text-sm text-muted w-24">{month}</span>
                                <div className="flex-1 bg-surface rounded-full h-6 overflow-hidden">
                                    <div className="h-full bg-foreground/80 rounded-full flex items-center justify-end px-2" style={{ width: `${Math.max((revenue / Math.max(...Object.values(monthlyRevenue))) * 100, 10)}%` }}>
                                        <span className="text-[10px] text-white font-bold">{revenue.toFixed(0)} ر.س</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted"><BarChart3 size={32} className="mx-auto mb-2 text-border" />لا توجد بيانات كافية</div>
                )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl border border-border p-6">
                <h2 className="font-bold mb-4">أفضل المنتجات مبيعاً</h2>
                {topProducts.length > 0 ? (
                    <div className="space-y-3">
                        {topProducts.map((product, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-muted w-6">{i + 1}</span>
                                    <span className="text-sm font-medium">{product.name}</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold">{product.revenue.toFixed(0)} ر.س</p>
                                    <p className="text-xs text-muted">{product.count} وحدة</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted">لا توجد بيانات</div>
                )}
            </div>
        </div>
    );
}
