import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4" dir="rtl">
            <div className="text-center max-w-lg">
                <div className="text-8xl font-heading font-bold text-border mb-4">404</div>
                <h1 className="text-3xl font-heading font-bold mb-3">الصفحة غير موجودة</h1>
                <p className="text-muted mb-8">عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="px-6 py-3 bg-foreground text-white rounded-lg font-medium text-sm hover:bg-foreground/90 transition-colors">
                        الرئيسية
                    </Link>
                    <Link href="/products" className="px-6 py-3 border border-border rounded-lg font-medium text-sm hover:bg-surface transition-colors">
                        تصفح المنتجات
                    </Link>
                </div>
            </div>
        </div>
    );
}
