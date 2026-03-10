export function formatPrice(price: number, currency: string = 'SAR'): string {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price);
}

export function calculateDiscount(price: number, compareAtPrice: number): number {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function getStockStatus(stock: number): { label: string; color: string } {
    if (stock <= 0) return { label: 'نفذت الكمية', color: 'text-red-500' };
    if (stock <= 5) return { label: `باقي ${stock} فقط!`, color: 'text-orange-500' };
    return { label: 'متوفر', color: 'text-green-600' };
}

export function generateOrderNumber(): string {
    const now = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `#${now.toString().slice(-4)}${random}`;
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}
