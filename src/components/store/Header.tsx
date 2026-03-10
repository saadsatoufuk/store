'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, Menu, X, User, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/lib/contexts/SettingsContext';

const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/products', label: 'المتجر' },
    { href: '/collections/new-arrivals', label: 'وصل حديثاً' },
    { href: '/collections/bestsellers', label: 'الأكثر مبيعاً' },
];

export default function Header() {
    const { settings } = useSettings();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ _id: string; name: string; slug: string; images: string[]; price: number }>>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
    const { data: session } = useSession();
    const router = useRouter();

    const itemCount = useCartStore((s) => s.getItemCount());
    const lastBounce = useCartStore((s) => s.lastBounce);
    const openCart = useCartStore((s) => s.openCart);
    const [bounce, setBounce] = useState(false);

    useEffect(() => {
        if (lastBounce > 0) {
            setBounce(true);
            const t = setTimeout(() => setBounce(false), 300);
            return () => clearTimeout(t);
        }
    }, [lastBounce]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.products?.slice(0, 5) || []);
                }
            } catch {
                // silently fail
            }
        }, 300);
    }, []);

    const freeShippingText = `شحن مجاني للطلبات فوق ${settings.freeShippingThreshold} ر.س • إرجاع مجاني • ضمان سنتين`;

    return (
        <>
            <div className="bg-foreground text-white text-center py-2 text-sm font-body">
                {freeShippingText}
            </div>
            <header
                className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 -ml-2"
                            aria-label="القائمة"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            {settings.logoUrl ? (
                                <img
                                    src={settings.logoUrl}
                                    alt={settings.siteName}
                                    className="h-8 md:h-10 w-auto object-contain"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            ) : null}
                            <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
                                {settings.siteName}
                            </h1>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm font-medium text-foreground hover:text-muted transition-colors relative group"
                                >
                                    {link.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-foreground transition-all group-hover:w-full" />
                                </Link>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative" ref={searchRef}>
                                <button
                                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                                    className="p-2 hover:bg-surface rounded-full transition-colors"
                                    aria-label="بحث"
                                >
                                    <Search size={20} />
                                </button>
                                <AnimatePresence>
                                    {isSearchOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="absolute left-0 md:right-0 md:left-auto top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-border p-4 z-50"
                                        >
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => handleSearch(e.target.value)}
                                                placeholder="ابحث عن منتجات..."
                                                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                                autoFocus
                                                dir="rtl"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && searchQuery) {
                                                        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                                                        setIsSearchOpen(false);
                                                    }
                                                }}
                                            />
                                            {searchResults.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {searchResults.map((product) => (
                                                        <Link
                                                            key={product._id}
                                                            href={`/products/${product.slug}`}
                                                            onClick={() => setIsSearchOpen(false)}
                                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors"
                                                        >
                                                            <div className="w-10 h-10 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                                                                {product.images?.[0] && (
                                                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0" dir="rtl">
                                                                <p className="text-sm font-medium truncate">{product.name}</p>
                                                                <p className="text-xs text-muted">{product.price} ر.س</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                    <Link
                                                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                                                        onClick={() => setIsSearchOpen(false)}
                                                        className="block text-center text-sm text-muted hover:text-foreground py-2"
                                                    >
                                                        عرض جميع النتائج
                                                    </Link>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Wishlist */}
                            <Link
                                href="/account?tab=wishlist"
                                className="p-2 hover:bg-surface rounded-full transition-colors hidden sm:block"
                                aria-label="المفضلة"
                            >
                                <Heart size={20} />
                            </Link>

                            {/* Account */}
                            <Link
                                href="/account"
                                className="p-2 hover:bg-surface rounded-full transition-colors hidden sm:block"
                                aria-label="الحساب"
                            >
                                <User size={20} />
                            </Link>

                            {/* Cart */}
                            <button
                                onClick={openCart}
                                className="p-2 hover:bg-surface rounded-full transition-colors relative"
                                aria-label="السلة"
                            >
                                <ShoppingBag size={20} />
                                {itemCount > 0 && (
                                    <span
                                        className={`absolute -top-1 -right-1 bg-foreground text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${bounce ? 'badge-bounce' : ''
                                            }`}
                                    >
                                        {itemCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden border-t border-border overflow-hidden bg-white"
                        >
                            <nav className="px-4 py-4 space-y-3" dir="rtl">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-lg font-medium py-2 hover:text-muted transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <hr className="border-border" />
                                <Link
                                    href="/account"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-lg font-medium py-2 hover:text-muted transition-colors"
                                >
                                    حسابي
                                </Link>
                                <Link
                                    href="/account?tab=wishlist"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-lg font-medium py-2 hover:text-muted transition-colors"
                                >
                                    المفضلة
                                </Link>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
}
