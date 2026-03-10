import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/lib/models/Coupon';
import { getSiteId } from '@/lib/tenant';

export async function GET() {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const coupons = await Coupon.find({ siteId }).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ coupons });
    } catch (error) {
        return NextResponse.json({ error: 'خطأ' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const body = await request.json();
        body.siteId = siteId;
        const coupon = await Coupon.create(body);
        return NextResponse.json({ coupon });
    } catch (error) {
        return NextResponse.json({ error: 'خطأ في إنشاء الكود' }, { status: 500 });
    }
}
