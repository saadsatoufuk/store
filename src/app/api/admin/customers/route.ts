import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getSiteId } from '@/lib/tenant';

export async function GET() {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const customers = await User.find({ siteId, role: 'customer' }).select('-passwordHash').sort({ createdAt: -1 }).lean();
        return NextResponse.json({ customers });
    } catch (error) {
        return NextResponse.json({ error: 'خطأ' }, { status: 500 });
    }
}
