import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import slugify from 'slugify';
import { getSiteId } from '@/lib/tenant';

export async function POST(request: Request) {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const body = await request.json();
        body.slug = slugify(body.name, { lower: true, strict: true });
        body.siteId = siteId;
        const product = await Product.create(body);
        return NextResponse.json({ product });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json({ error: 'خطأ في إنشاء المنتج' }, { status: 500 });
    }
}
