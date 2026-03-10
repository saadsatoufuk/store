import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/lib/models/Coupon';
import { getSiteId } from '@/lib/tenant';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const { id } = await params;
        await Coupon.findOneAndDelete({ _id: id, siteId });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'خطأ' }, { status: 500 });
    }
}
