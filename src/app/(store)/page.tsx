import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSiteId } from '@/lib/tenant';
import connectDB from '@/lib/mongodb';
import Site from '@/lib/models/Site';
import CreateStoreForm from '@/components/store/CreateStoreForm';
import HomePageClient from './HomePageClient';

export default async function HomePage() {
    const headersList = await headers();
    const host = headersList.get('host') || '';

    // A simple check to see if we are on a subdomain.
    // If it's a root domain like `localhost:3000` or `intilaqapp.com`, it will have 0 or 1 dots. 
    // Subdomains like `store.intilaqapp.com` or `store.localhost:3000` will have 2 or 1 dots respectively.
    // A more resilient check for development:
    const isLocalhost = host.includes('localhost');
    const parts = host.split('.');
    
    // If we're on localhost:3000 (1 part) or intilaqapp.com (2 parts) we consider it a root domain.
    const isRootDomain = isLocalhost ? parts.length === 1 : parts.length <= 2;

    if (isRootDomain) {
        await connectDB();
        
        // Ensure only one store exists per host.
        // If a store has already been created for this root host, redirect to it.
        const existingStore = await Site.findOne({ rootDomain: host, isActive: true });
        
        if (existingStore) {
            // Construct the full URL to redirect to the specific store
            const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
            redirect(`${protocol}://${existingStore.domain}`);
        }

        return (
            <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface/30" dir="rtl">
                <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
                    <CreateStoreForm />
                </div>
            </div>
        );
    }

    // Otherwise, we're on a subdomain, load the actual store
    let siteId;
    try {
        siteId = await getSiteId();
    } catch (error) {
        // Fallback or error view if subdomain fails resolution
        return (
            <div className="min-h-screen flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">تعذر الوصول للمتجر</h1>
                    <p className="text-muted">الرابط غير صحيح أو المتجر قيد الإنشاء</p>
                </div>
            </div>
        );
    }

    await connectDB();
    const site = await Site.findById(siteId);

    // Render normal homepage
    return <HomePageClient />;
}
