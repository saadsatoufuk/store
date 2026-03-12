'use client';

import { useEffect, useState } from 'react';
import { Search, Package } from 'lucide-react';

const statusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-700', pending_verification: 'bg-amber-100 text-amber-700', awaiting_delivery_payment: 'bg-amber-100 text-amber-700',
    unfulfilled: 'bg-amber-100 text-amber-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
};
const statusLabels: Record<string, string> = {
    paid: 'مدفوع', pending: 'معلق', failed: 'فشل', refunded: 'مسترد', pending_verification: 'معلق التحقق', awaiting_delivery_payment: 'بانتظار الدفع عند الاستلام',
    unfulfilled: 'لم يشحن', processing: 'قيد المعالجة', shipped: 'تم الشحن', delivered: 'تم التوصيل', cancelled: 'ملغي',
};
const methodLabels: Record<string, string> = {
    bank_transfer: 'تحويل بنكي', stc_pay: 'STC Pay', cod: 'الدفع عند الاستلام'
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

    const verifyPayment = async (orderId: string) => {
        await fetch(`/api/admin/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentStatus: 'paid' }) });
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: 'paid' } : o));
        setSelectedOrder((prev: any) => prev ? { ...prev, paymentStatus: 'paid' } : prev);
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
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${statusColors[order.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>{statusLabels[order.paymentStatus] || order.paymentStatus}</span>
                                                    {order.paymentMethod && <span className="text-xs text-muted">{methodLabels[order.paymentMethod] || order.paymentMethod}</span>}
                                                </div>
                                            </td>
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
                            
                            {selectedOrder.paymentMethod && (
                                <>
                                    <hr className="border-border" />
                                    <h3 className="font-medium text-sm">تفاصيل الدفع ({methodLabels[selectedOrder.paymentMethod] || selectedOrder.paymentMethod})</h3>
                                    <div className="space-y-3 bg-surface p-4 rounded-lg text-sm border border-border">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-muted">حالة الدفع:</span>
                                            <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${statusColors[selectedOrder.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>{statusLabels[selectedOrder.paymentStatus] || selectedOrder.paymentStatus}</span>
                                        </div>
                                        
                                        {selectedOrder.paymentMethod === 'bank_transfer' && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div><span className="text-muted">البنك:</span><p className="font-medium">{selectedOrder.bankName}</p></div>
                                                <div><span className="text-muted">المرسل:</span><p className="font-medium">{selectedOrder.senderName}</p></div>
                                                <div><span className="text-muted">الآيبان:</span><p className="font-medium font-mono text-xs mt-1">{selectedOrder.iban}</p></div>
                                                <div><span className="text-muted">رقم الحوالة:</span><p className="font-medium">{selectedOrder.transactionId}</p></div>
                                            </div>
                                        )}
                                        
                                        {selectedOrder.paymentMethod === 'stc_pay' && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div><span className="text-muted">المرسل:</span><p className="font-medium">{selectedOrder.senderName}</p></div>
                                                <div><span className="text-muted">رقم STC Pay:</span><p className="font-medium" dir="ltr">{selectedOrder.senderPhone}</p></div>
                                                <div className="col-span-2"><span className="text-muted">رقم الحوالة:</span><p className="font-medium">{selectedOrder.transactionId}</p></div>
                                            </div>
                                        )}
                                        
                                        {selectedOrder.paymentReceiptUrl && (
                                            <div className="mt-4">
                                                <span className="text-muted block mb-2">صورة الإيصال (رابط سحابي):</span>
                                                <a href={selectedOrder.paymentReceiptUrl} target="_blank" rel="noreferrer" className="block max-w-xs border border-border rounded-lg overflow-hidden hover:opacity-90 transition-opacity">
                                                    <img src={selectedOrder.paymentReceiptUrl} alt="Receipt" className="w-full object-cover" />
                                                </a>
                                            </div>
                                        )}

                                        {selectedOrder.paymentStatus === 'pending_verification' && (
                                            <button 
                                                onClick={() => verifyPayment(selectedOrder._id)}
                                                className="w-full mt-4 py-2 bg-foreground text-white rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
                                            >
                                                التحقق وإعتماد الدفع
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

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
