import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { getSiteId } from '@/lib/tenant';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const { id } = await params;
        const body = await request.json();
        const product = await Product.findOneAndUpdate({ _id: id, siteId }, body, { new: true });
        if (!product) return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
        return NextResponse.json({ product });
    } catch (error) {
        return NextResponse.json({ error: 'خطأ في تحديث المنتج' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const { id } = await params;
        await Product.findOneAndDelete({ _id: id, siteId });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'خطأ في حذف المنتج' }, { status: 500 });
    }
}
