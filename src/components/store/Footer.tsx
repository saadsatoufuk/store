'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';
import { useSettings } from '@/lib/contexts/SettingsContext';

const footerLinks = {
    shop: [
        { href: '/products', label: 'جميع المنتجات' },
        { href: '/collections/new-arrivals', label: 'وصل حديثاً' },
        { href: '/collections/bestsellers', label: 'الأكثر مبيعاً' },
        { href: '/collections/sale', label: 'التخفيضات' },
    ],
    help: [
        { href: '#', label: 'تواصل معنا' },
        { href: '#', label: 'الشحن والتوصيل' },
        { href: '#', label: 'الإرجاع والاستبدال' },
        { href: '#', label: 'الأسئلة الشائعة' },
    ],
    about: [
        { href: '#', label: 'من نحن' },
        { href: '#', label: 'سياسة الخصوصية' },
        { href: '#', label: 'الشروط والأحكام' },
    ],
};

export default function Footer() {
    const { settings } = useSettings();

    return (
        <footer className="bg-foreground text-white" dir="rtl">
            {/* Newsletter */}
            <div className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center max-w-xl mx-auto">
                        <h3 className="text-2xl font-heading font-bold mb-3">انضم إلى قائمتنا البريدية</h3>
                        <p className="text-white/60 mb-6 text-sm">احصل على خصم 10% على طلبك الأول وكن أول من يعرف عن العروض الحصرية</p>
                        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="بريدك الإلكتروني"
                                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                                dir="rtl"
                            />
                            <button className="px-6 py-3 bg-white text-foreground font-medium rounded-lg text-sm hover:bg-white/90 transition-colors">
                                اشترك
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            {settings.logoUrl && (
                                <img
                                    src={settings.logoUrl}
                                    alt={settings.siteName}
                                    className="h-8 w-auto object-contain brightness-0 invert"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            )}
                            <h2 className="text-2xl font-heading font-bold">{settings.siteName}</h2>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed mb-4">
                            وجهتك المفضلة للتسوق عبر الإنترنت. نقدم لك أفضل المنتجات بأعلى جودة وأفضل الأسعار.
                        </p>
                        <div className="flex gap-3">
                            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">المتجر</h4>
                        <ul className="space-y-3">
                            {footerLinks.shop.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help Links */}
                    <div>
                        <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">المساعدة</h4>
                        <ul className="space-y-3">
                            {footerLinks.help.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* About Links */}
                    <div>
                        <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">معلومات</h4>
                        <ul className="space-y-3">
                            {footerLinks.about.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-white/40">
                        {settings.footerText || `© ${new Date().getFullYear()} ${settings.siteName}. جميع الحقوق محفوظة`}
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 opacity-60">
                            {['Visa', 'MC', 'Mada'].map((name) => (
                                <div key={name} className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold">
                                    {name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
