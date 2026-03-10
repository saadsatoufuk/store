import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Site from '@/lib/models/Site';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        // Simple security check for provisioning - In production this should be a robust secret/token
        if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY || 'intilaq-provisioning-secret-123'}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { subdomain, plan, name, ownerId } = await request.json();

        if (!subdomain) {
            return NextResponse.json({ error: 'Subdomain is required' }, { status: 400 });
        }

        await connectDB();

        if (ownerId) {
            const existingStore = await Site.findOne({ ownerId });
            if (existingStore) {
                return NextResponse.json(
                    { error: "You already own a store. Only one store is allowed per user." },
                    { status: 403 }
                );
            }
        }

        const existingSite = await Site.findOne({ subdomain: subdomain.toLowerCase() });
        if (existingSite) {
            return NextResponse.json({ error: 'Subdomain already exists' }, { status: 409 });
        }

        const newSite = await Site.create({
            name: name || 'Store',
            subdomain: subdomain.toLowerCase(),
            domain: `${subdomain.toLowerCase()}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'intilaqapp.com'}`,
            ownerId: null,
            status: 'pending',
            plan: plan || 'store'
        });

        return NextResponse.json({ success: true, site: newSite });
    } catch (error) {
        console.error('Provisioning error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
