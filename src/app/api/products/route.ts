import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { getSiteId } from '@/lib/tenant';

export async function GET(request: Request) {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const sort = searchParams.get('sort') || 'featured';
        const category = searchParams.get('category');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const inStock = searchParams.get('inStock');
        const onSale = searchParams.get('onSale');
        const featured = searchParams.get('featured');
        const badge = searchParams.get('badge');

        // Build filter
        const filter: Record<string, unknown> = { siteId, isActive: true };
        if (category) filter.category = category;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) (filter.price as Record<string, number>).$gte = parseFloat(minPrice);
            if (maxPrice) (filter.price as Record<string, number>).$lte = parseFloat(maxPrice);
        }
        if (inStock === 'true') filter.totalStock = { $gt: 0 };
        if (onSale === 'true') filter.compareAtPrice = { $gt: 0 };
        if (featured === 'true') filter.isFeatured = true;
        if (badge) filter.badge = badge;

        // Build sort
        let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
        switch (sort) {
            case 'price-asc': sortObj = { price: 1 }; break;
            case 'price-desc': sortObj = { price: -1 }; break;
            case 'newest': sortObj = { createdAt: -1 }; break;
            case 'rating': sortObj = { 'rating.average': -1 }; break;
            case 'bestselling': sortObj = { soldCount: -1 }; break;
            case 'featured': sortObj = { isFeatured: -1, createdAt: -1 }; break;
        }

        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product.find(filter).populate('category', 'name slug').sort(sortObj).skip(skip).limit(limit).lean(),
            Product.countDocuments(filter),
        ]);

        return NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Products API error:', error);
        return NextResponse.json({ error: 'حدث خطأ في تحميل المنتجات' }, { status: 500 });
    }
}
