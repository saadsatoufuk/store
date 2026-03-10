import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSiteId } from '@/lib/tenant';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
        }

        await connectDB();
        const siteId = await getSiteId();

        // Find user to get their ID
        const user = await User.findOne({ email: session.user.email, siteId });
        if (!user) {
            return NextResponse.json({ orders: [] });
        }

        // Find orders by userId OR by customer email (for orders placed before userId was tracked)
        const orders = await Order.find({
            siteId,
            $or: [
                { userId: user._id },
                { 'customer.email': session.user.email },
            ],
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Get user orders error:', error);
        return NextResponse.json({ error: 'خطأ في تحميل الطلبات' }, { status: 500 });
    }
}
