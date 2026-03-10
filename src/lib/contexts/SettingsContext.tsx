'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SiteSettings {
    siteName: string;
    logoUrl: string;
    primaryColor: string;
    contactEmail: string;
    phone: string;
    footerText: string;
    freeShippingThreshold: number;
    flatRateShipping: number;
    taxRate: number;
    currency: string;
}

const defaultSettings: SiteSettings = {
    siteName: 'متجري',
    logoUrl: '',
    primaryColor: '#0F0F0F',
    contactEmail: 'hello@store.com',
    phone: '',
    footerText: '© 2025 متجري. جميع الحقوق محفوظة',
    freeShippingThreshold: 200,
    flatRateShipping: 25,
    taxRate: 15,
    currency: 'SAR',
};

interface SettingsContextType {
    settings: SiteSettings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    loading: true,
    refreshSettings: async () => { },
});

export function useSettings() {
    return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.settings) {
                setSettings({ ...defaultSettings, ...data.settings });
            }
        } catch {
            // Use defaults on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // Apply primaryColor as CSS variable whenever settings change
    useEffect(() => {
        if (settings.primaryColor && settings.primaryColor !== '#0F0F0F') {
            document.documentElement.style.setProperty('--foreground', settings.primaryColor);
            // Also set a lighter version for hover states
            document.documentElement.style.setProperty('--brand-color', settings.primaryColor);
        } else {
            document.documentElement.style.setProperty('--foreground', '#0F0F0F');
            document.documentElement.style.setProperty('--brand-color', '#0F0F0F');
        }
    }, [settings.primaryColor]);

    // Update document title when store name changes
    useEffect(() => {
        if (settings.siteName) {
            document.title = `${settings.siteName} - تسوق أونلاين`;
        }
    }, [settings.siteName]);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}
