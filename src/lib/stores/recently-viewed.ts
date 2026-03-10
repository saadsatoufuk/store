import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedItem {
    productId: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    viewedAt: number;
}

interface RecentlyViewedStore {
    items: RecentlyViewedItem[];
    addItem: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void;
    getItems: () => RecentlyViewedItem[];
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const items = get().items.filter((i) => i.productId !== item.productId);
                items.unshift({ ...item, viewedAt: Date.now() });
                set({ items: items.slice(0, 10) }); // keep last 10
            },

            getItems: () => {
                return get().items.slice(0, 4);
            },
        }),
        {
            name: 'recently-viewed-storage',
        }
    )
);
