'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const proofData = [
    { name: 'سارة', city: 'الرياض', product: 'حقيبة جلدية فاخرة' },
    { name: 'محمد', city: 'جدة', product: 'ساعة كلاسيكية' },
    { name: 'نورة', city: 'الدمام', product: 'نظارة شمسية' },
    { name: 'أحمد', city: 'دبي', product: 'محفظة جلدية' },
    { name: 'فاطمة', city: 'المدينة', product: 'عطر فاخر' },
];

export default function SocialProof() {
    const [current, setCurrent] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const showNext = () => {
            const index = Math.floor(Math.random() * proofData.length);
            setCurrent(index);
            setVisible(true);
            setTimeout(() => setVisible(false), 5000);
        };

        const interval = setInterval(showNext, 15000);
        const initial = setTimeout(showNext, 5000);

        return () => {
            clearInterval(interval);
            clearTimeout(initial);
        };
    }, []);

    return (
        <AnimatePresence>
            {visible && current !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 20, x: 0 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-4 left-4 z-50 max-w-xs bg-white rounded-xl shadow-xl border border-border p-4"
                    dir="rtl"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-sm font-bold">
                            {proofData[current].name[0]}
                        </div>
                        <div>
                            <p className="text-sm">
                                <span className="font-bold">{proofData[current].name}</span> من{' '}
                                <span className="font-medium">{proofData[current].city}</span>
                            </p>
                            <p className="text-xs text-muted">اشترى {proofData[current].product}</p>
                            <p className="text-[10px] text-muted mt-0.5">منذ {Math.floor(Math.random() * 30) + 1} دقيقة</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setVisible(false)}
                        className="absolute top-2 left-2 text-muted hover:text-foreground text-xs"
                    >
                        ✕
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
