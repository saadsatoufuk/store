'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function CreateOwnerPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [siteId, setSiteId] = useState<string>('');

    // Pre-resolve tenant siteId so we can pass it to the credentials provider
    useEffect(() => {
        fetch(`/api/internal/resolve-site?host=${encodeURIComponent(window.location.host)}`)
            .then(r => r.json())
            .then(data => { if (data.siteId) setSiteId(data.siteId); })
            .catch(() => {});
    }, []);

    const handleCreateOwner = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${window.location.origin}/api/auth/create-owner`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (data.success) {
                // Log them in immediately after creation
                const authRes = await signIn('credentials', {
                    email: form.email,
                    password: form.password,
                    siteId,
                    redirect: false,
                });

                if (authRes?.error) {
                    setError('تم إنشاء الحساب، يرجى تسجيل الدخول يدوياً.');
                } else {
                    router.push('/admin');
                }
            } else {
                setError(data.error || 'حدث خطأ أثناء إنشاء الحساب.');
            }
        } catch (err) {
            setError('تعذر الاتصال بالخادم. حاول مجدداً.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-8 shadow-sm border border-border">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-heading font-bold mb-2">إعداد مالك المتجر</h1>
                    <p className="text-sm text-muted">تهانينا على متجرك الجديد! أنشئ حساب المالك للبدء.</p>
                </div>
                
                <form onSubmit={handleCreateOwner} className="space-y-4">
                    <div className="relative">
                        <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input 
                            type="text" 
                            name="name" 
                            value={form.name} 
                            onChange={e => setForm({ ...form, name: e.target.value })} 
                            placeholder="الاسم الكامل" 
                            required 
                            className="w-full pl-4 pr-10 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" 
                        />
                    </div>
                    
                    <div className="relative">
                        <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input 
                            type="email" 
                            name="email" 
                            value={form.email} 
                            onChange={e => setForm({ ...form, email: e.target.value })} 
                            placeholder="البريد الإلكتروني" 
                            required 
                            className="w-full pl-4 pr-10 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" 
                        />
                    </div>
                    
                    <div className="relative">
                        <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            name="password" 
                            value={form.password} 
                            onChange={e => setForm({ ...form, password: e.target.value })} 
                            placeholder="كلمة المرور" 
                            required 
                            minLength={6} 
                            className="w-full pl-10 pr-10 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20" 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {error && <p className="text-sale text-sm text-center">{error}</p>}
                    
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full py-3 bg-foreground text-white rounded-lg font-medium disabled:opacity-50 mt-4"
                    >
                        {loading ? 'جاري إنشاء الحساب...' : 'إنشاء وتأكيد'}
                    </button>
                </form>
            </div>
        </div>
    );
}
