import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { getSiteId } from '@/lib/tenant';

export async function GET(request: Request) {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        if (query.length < 2) {
            return NextResponse.json({ products: [] });
        }

        const products = await Product.find({
            siteId,
            isActive: true,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } },
            ],
        })
            .select('name slug images price compareAtPrice')
            .limit(10)
            .lean();

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'خطأ في البحث' }, { status: 500 });
    }
}
