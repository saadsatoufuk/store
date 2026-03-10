import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Site from '@/lib/models/Site';

/**
 * Internal API route to resolve a siteId from a host string.
 * Called by the Edge middleware (which cannot use Mongoose directly).
 * 
 * GET /api/internal/resolve-site?host=store.example.com
 * → { siteId: "..." } or 404
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const host = searchParams.get('host');

        if (!host) {
            return NextResponse.json({ error: 'Missing host parameter' }, { status: 400 });
        }

        await connectDB();

        // Extract subdomain from host
        // e.g. "store.example.com" → "store", "store.localhost" → "store"
        const parts = host.replace(/:\d+$/, '').split('.'); // strip port first
        let subdomain: string | null = null;

        if (parts.length >= 2) {
            subdomain = parts[0];
        }

        // Skip system subdomains
        if (subdomain === 'www' || subdomain === 'api' || subdomain === 'admin') {
            subdomain = null;
        }

        let site = null;

        // 1. Try subdomain match
        if (subdomain) {
            site = await Site.findOne({ subdomain, isActive: true }).lean();
        }

        // 2. Try full domain match (without port)
        if (!site) {
            const domainWithoutPort = host.replace(/:\d+$/, '');
            site = await Site.findOne({ domain: domainWithoutPort, isActive: true }).lean();
        }

        if (!site) {
            return NextResponse.json(
                { error: 'Site not found for this domain' },
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            siteId: site._id.toString(),
            ownerId: site.ownerId ? site.ownerId.toString() : null,
            status: site.status,
            plan: site.plan
        });
    } catch (error) {
        console.error('Resolve site error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
