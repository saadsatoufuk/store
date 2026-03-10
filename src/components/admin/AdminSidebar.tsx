'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings,
    ChevronRight, LogOut, Store, Menu, X
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const menuItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { href: '/admin/products', icon: Package, label: 'المنتجات' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'الطلبات' },
    { href: '/admin/customers', icon: Users, label: 'العملاء' },
    { href: '/admin/analytics', icon: BarChart3, label: 'التحليلات' },
    { href: '/admin/settings', icon: Settings, label: 'الإعدادات' },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    const sidebar = (
        <div className="h-full flex flex-col bg-[#0F172A] text-white" dir="rtl">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                        <Store size={20} />
                    </div>
                    <div>
                        <h1 className="font-heading font-bold text-lg">متجري</h1>
                        <p className="text-[11px] text-white/50">لوحة الإدارة</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                            {active && <ChevronRight size={14} className="mr-auto" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all"
                >
                    <Store size={18} />
                    <span>زيارة المتجر</span>
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-red-400 transition-all w-full"
                >
                    <LogOut size={18} />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 right-4 z-[60] p-2 bg-[#0F172A] text-white rounded-lg shadow-lg"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile overlay */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
            )}

            {/* Sidebar - Desktop */}
            <aside className="hidden md:block w-64 min-h-screen flex-shrink-0">
                {sidebar}
            </aside>

            {/* Sidebar - Mobile */}
            <aside className={`md:hidden fixed inset-y-0 right-0 w-72 z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {sidebar}
            </aside>
        </>
    );
}
