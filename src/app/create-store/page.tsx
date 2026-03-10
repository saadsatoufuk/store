import { Suspense } from 'react';
import CreateStoreForm from '@/components/store/CreateStoreForm';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'إنشاء متجرك | المنصة',
    description: 'أطلق متجرك الإلكتروني في ثوانٍ معدودة.',
};

export default function CreateStorePage() {
    return (
        <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface/30" dir="rtl">
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
                <Link href="/account" className="absolute -top-12 right-0 flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    العودة للحساب
                </Link>
                <Suspense fallback={
                    <div className="bg-white rounded-xl shadow-sm border border-border p-12 flex justify-center">
                         <div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
                    </div>
                }>
                    <CreateStoreForm />
                </Suspense>
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-sm text-muted">
                    لديك متجر بالفعل؟{' '}
                    <Link href="/login" className="font-medium text-foreground hover:underline transition-colors">
                        تسجيل الدخول
                    </Link>
                </p>
            </div>
        </div>
    );
}
