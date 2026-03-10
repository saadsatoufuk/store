import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Site from '@/lib/models/Site';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/stores
 * Creates a new store (Site document).
 * 
 * Body: { name, slug, domain, ownerId? }
 * 
 * When a new store is created, a Site document is automatically created
 * with the provided name, slug (used as subdomain), domain, and optional ownerId.
 */
export async function POST(request: Request) {
    try {
        await connectDB();
        const { name, slug, domain, ownerId } = await request.json();

        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id || ownerId;

        if (userId) {
            const existingStore = await Site.findOne({ ownerId: userId });
            if (existingStore) {
                return NextResponse.json(
                    { error: "You already own a store. Only one store is allowed per user." },
                    { status: 403 }
                );
            }
        }

        const headersList = await headers();
        const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost';
        
        // Strict limit: only one store per root host
        const existingStoreOnHost = await Site.findOne({ rootDomain: host });
        if (existingStoreOnHost) {
            return NextResponse.json(
                { error: "A store already exists for this domain." },
                { status: 403 }
            );
        }

        if (!name || !slug || !domain) {
            return NextResponse.json(
                { error: 'name, slug, and domain are required' },
                { status: 400 }
            );
        }

        // Check for existing site with same slug or domain
        const existing = await Site.findOne({
            $or: [{ subdomain: slug.toLowerCase() }, { domain }],
        });
        if (existing) {
            return NextResponse.json(
                { error: 'A store with this slug or domain already exists' },
                { status: 409 }
            );
        }

        const site = await Site.create({
            name,
            subdomain: slug.toLowerCase(),
            domain,
            ownerId: ownerId || undefined,
            rootDomain: host,
            isActive: true,
        });

        return NextResponse.json({ site }, { status: 201 });
    } catch (error) {
        console.error('Store creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create store' },
            { status: 500 }
        );
    }
}
