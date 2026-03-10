import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { getSiteId } from '@/lib/tenant';

export async function GET() {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const categories = await Category.find({ siteId, isActive: true }).sort({ sortOrder: 1 }).lean();
        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Categories API error:', error);
        return NextResponse.json({ error: 'خطأ في تحميل التصنيفات' }, { status: 500 });
    }
}
