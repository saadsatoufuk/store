'use client';

import { useEffect, useState } from 'react';
import { Users, Search } from 'lucide-react';

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/admin/customers').then(r => r.json()).then(d => { setCustomers(d.customers || []); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const filtered = customers.filter(c => c.name?.includes(search) || c.email?.includes(search));

    return (
        <div dir="rtl" className="space-y-6">
            <div><h1 className="text-2xl font-heading font-bold">العملاء</h1><p className="text-muted text-sm">{customers.length} عميل</p></div>
            <div className="relative max-w-sm">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="w-full pr-10 pl-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10" />
            </div>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-surface/50">
                        <th className="p-4 text-right font-medium">العميل</th><th className="p-4 text-right font-medium">البريد</th>
                        <th className="p-4 text-right font-medium">الطلبات</th><th className="p-4 text-right font-medium">إجمالي الإنفاق</th>
                        <th className="p-4 text-right font-medium">تاريخ التسجيل</th>
                    </tr></thead>
                    <tbody>
                        {loading ? [...Array(3)].map((_, i) => <tr key={i}><td colSpan={5} className="p-4"><div className="h-12 skeleton" /></td></tr>) :
                            filtered.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-muted"><Users size={32} className="mx-auto mb-2 text-border" />لا يوجد عملاء</td></tr> :
                                filtered.map(c => (
                                    <tr key={c._id} className="border-b border-border hover:bg-surface/30 transition-colors">
                                        <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center text-xs font-bold">{c.name?.[0]}</div><span className="font-medium">{c.name}</span></div></td>
                                        <td className="p-4 text-muted">{c.email}</td>
                                        <td className="p-4">{c.totalOrders || 0}</td>
                                        <td className="p-4 font-medium">{(c.totalSpent || 0).toFixed(0)} ر.س</td>
                                        <td className="p-4 text-muted">{new Date(c.createdAt).toLocaleDateString('ar-SA')}</td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
