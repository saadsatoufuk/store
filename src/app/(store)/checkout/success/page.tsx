'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Package, ArrowLeft } from 'lucide-react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('order') || '#0000';

    return (
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6 }}>
                <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} className="text-white" />
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">تم تأكيد الطلب!</h1>
                <p className="text-muted text-lg mb-2">شكراً لطلبك</p>
                <p className="text-sm text-muted mb-8">رقم الطلب: <span className="font-bold text-foreground">{orderNumber}</span></p>
                <div className="bg-surface rounded-xl p-6 mb-8 text-right space-y-3">
                    <div className="flex items-center gap-3">
                        <Package size={20} className="text-muted" />
                        <div>
                            <p className="text-sm font-medium">التوصيل المتوقع</p>
                            <p className="text-xs text-muted">5-7 أيام عمل</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted">سيتم إرسال تفاصيل الطلب وتتبع الشحن إلى بريدك الإلكتروني</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/account?tab=orders" className="px-6 py-3 bg-foreground text-white rounded-lg font-medium text-sm hover:bg-foreground/90 transition-colors">تتبع الطلب</Link>
                    <Link href="/products" className="px-6 py-3 border border-border rounded-lg font-medium text-sm hover:bg-surface transition-colors inline-flex items-center justify-center gap-2">متابعة التسوق <ArrowLeft size={14} /></Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-24 text-center"><div className="w-20 h-20 skeleton rounded-full mx-auto mb-6" /><div className="h-8 skeleton w-1/2 mx-auto" /></div>}>
            <SuccessContent />
        </Suspense>
    );
}
