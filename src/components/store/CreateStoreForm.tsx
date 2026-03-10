'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Globe, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function CreateStoreForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
    });

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow lowercase alphanumeric and dashes, no spaces
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData((prev) => ({ ...prev, slug: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch('/api/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    slug: formData.slug,
                    domain: `${formData.slug}.localhost:3000`, // Initial development domain mapping
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'فشل إنشاء المتجر');
            }

            setSuccess(true);
            
            setTimeout(() => {
                const protocol = window.location.protocol;
                let redirectUrl = `${protocol}//${formData.slug}.localhost:3000`; // Dev default
                
                if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                        const hostParts = window.location.host.split('.');
                        const apex = hostParts.slice(-2).join('.'); // very basic apex extraction
                        redirectUrl = `${protocol}//${formData.slug}.${apex}`;
                }
                
                window.location.href = redirectUrl;
            }, 1500);

        } catch (err: any) {
            setError(err.message === 'A store with this slug or domain already exists' ? 'يوجد متجر بهذا الرابط بالفعل' : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden" dir="rtl">
            <div className="p-6 border-b border-border bg-surface/50">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center">
                        <Store className="w-6 h-6 text-foreground" />
                    </div>
                </div>
                <h2 className="text-xl font-heading font-bold text-center">
                    إنشاء متجرك الخاص
                </h2>
                <p className="text-sm text-muted text-center mt-1">
                    ابدأ البيع عبر الإنترنت في ثوانٍ معدودة.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">فشل إنشاء المتجر</p>
                            <p className="mt-1 opacity-90">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">تم إنشاء المتجر بنجاح!</p>
                            <p className="mt-1 opacity-90">جاري التوجيه إلى متجرك الجديد...</p>
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label htmlFor="storeName" className="text-sm font-medium text-foreground">
                        اسم المتجر
                    </label>
                    <input
                        id="storeName"
                        type="text"
                        required
                        placeholder="مثل: متجري الرائع"
                        className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all font-sans"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={loading || success}
                    />
                </div>

                    <div className="space-y-1.5">
                        <label htmlFor="storeSlug" className="text-sm font-medium text-foreground flex justify-between items-center">
                            <span>رابط المتجر (بالإنجليزية)</span>
                            <span className="text-xs text-muted font-normal">حروف صغيرة، بدون مسافات</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Globe className="h-4 w-4 text-muted" />
                            </div>
                            <input
                                id="storeSlug"
                                type="text"
                                required
                                dir="ltr"
                                placeholder="my-awesome-shop"
                                className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all font-mono text-left"
                                value={formData.slug}
                                onChange={handleSlugChange}
                                disabled={loading || success}
                            />
                        </div>
                        <p className="text-xs text-muted mt-1.5 flex items-center gap-1.5 justify-end" dir="ltr">
                            <span className="inline-block px-1.5 py-0.5 bg-surface rounded text-[10px] font-mono text-foreground">
                                {formData.slug || 'your-slug'}.localhost:3000
                            </span>
                        </p>
                    </div>

                <button
                    type="submit"
                    disabled={loading || success || !formData.name || !formData.slug}
                    className="w-full py-3 bg-foreground text-white rounded-lg font-medium text-sm transition-all hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            جاري الحفظ...
                        </>
                    ) : success ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            جاري التوجيه...
                        </>
                    ) : (
                        'إنشاء المتجر'
                    )}
                </button>
            </form>
        </div>
    );
}
