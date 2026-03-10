'use client';

import { useEffect, useState } from 'react';
import { Search, Package } from 'lucide-react';

const statusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-700',
    unfulfilled: 'bg-amber-100 text-amber-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
};
const statusLabels: Record<string, string> = {
    paid: 'مدفوع', pending: 'معلق', failed: 'فشل', refunded: 'مسترد',
    unfulfilled: 'لم يشحن', processing: 'قيد المعالجة', shipped: 'تم الشحن', delivered: 'تم التوصيل', cancelled: 'ملغي',
};
const fulfillmentOptions = ['unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        fetch('/api/orders').then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false); });
    }, []);

    const updateStatus = async (orderId: string, status: string) => {
        await fetch(`/api/admin/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fulfillmentStatus: status }) });
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, fulfillmentStatus: status } : o));
    };

    const filtered = orders.filter(o => o.orderNumber?.includes(search) || o.customer?.name?.includes(search) || o.customer?.email?.includes(search));

    return (
        <div dir="rtl" className="space-y-6">
            <div><h1 className="text-2xl font-heading font-bold">الطلبات</h1><p className="text-muted text-sm">{orders.length} طلب</p></div>

            <div className="relative max-w-sm">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالرقم أو اسم العميل..." className="w-full pr-10 pl-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10" />
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-border bg-surface/50">
                            <th className="p-4 text-right font-medium">رقم الطلب</th><th className="p-4 text-right font-medium">العميل</th>
                            <th className="p-4 text-right font-medium">التاريخ</th><th className="p-4 text-right font-medium">المبلغ</th>
                            <th className="p-4 text-right font-medium">الدفع</th><th className="p-4 text-right font-medium">الشحن</th>
                        </tr></thead>
                        <tbody>
                            {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={6} className="p-4"><div className="h-12 skeleton" /></td></tr>) :
                                filtered.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-muted"><Package size={32} className="mx-auto mb-2 text-border" />لا توجد طلبات</td></tr> :
                                    filtered.map(order => (
                                        <tr key={order._id} className="border-b border-border hover:bg-surface/30 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                            <td className="p-4 font-medium">{order.orderNumber}</td>
                                            <td className="p-4">{order.customer?.name}</td>
                                            <td className="p-4 text-muted">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</td>
                                            <td className="p-4 font-medium">{order.total?.toFixed(0)} ر.س</td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded-full text-[11px] font-medium ${statusColors[order.paymentStatus]}`}>{statusLabels[order.paymentStatus]}</span></td>
                                            <td className="p-4">
                                                <select
                                                    value={order.fulfillmentStatus}
                                                    onChange={e => { e.stopPropagation(); updateStatus(order._id, e.target.value); }}
                                                    className={`px-2 py-1 rounded-full text-[11px] font-medium border-0 ${statusColors[order.fulfillmentStatus]}`}
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    {fulfillmentOptions.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <h2 className="font-heading font-bold text-lg">تفاصيل الطلب {selectedOrder.orderNumber}</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-muted">العميل:</span><p className="font-medium">{selectedOrder.customer?.name}</p></div>
                                <div><span className="text-muted">البريد:</span><p className="font-medium">{selectedOrder.customer?.email}</p></div>
                                <div><span className="text-muted">المبلغ:</span><p className="font-medium">{selectedOrder.total?.toFixed(0)} ر.س</p></div>
                                <div><span className="text-muted">التاريخ:</span><p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString('ar-SA')}</p></div>
                            </div>
                            <hr className="border-border" />
                            <h3 className="font-medium text-sm">المنتجات</h3>
                            {selectedOrder.items?.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <div className="w-10 h-10 bg-surface rounded-lg overflow-hidden">{item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}</div>
                                    <div className="flex-1"><p className="font-medium">{item.name}</p>{item.variant && <p className="text-xs text-muted">{item.variant}</p>}</div>
                                    <p>{item.quantity}× {item.price} ر.س</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setSelectedOrder(null)} className="w-full py-3 border border-border rounded-lg text-sm font-medium">إغلاق</button>
                    </div>
                </div>
            )}
        </div>
    );
}
