import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { getSiteId } from '@/lib/tenant';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const { id } = await params;
        const body = await request.json();
        const order = await Order.findOneAndUpdate({ _id: id, siteId }, body, { new: true });
        if (!order) return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
        return NextResponse.json({ order });
    } catch (error) {
        return NextResponse.json({ error: 'خطأ في تحديث الطلب' }, { status: 500 });
    }
}
