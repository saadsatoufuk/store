import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { generateOrderNumber } from '@/lib/utils/helpers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSiteId } from '@/lib/tenant';

export async function POST(request: Request) {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const body = await request.json();
        const { customer, items, shippingAddress, shippingCost, subtotal, tax, total, paymentMethod, transactionId, senderName, senderPhone, bankName, iban, paymentReceiptUrl } = body;

        if (!customer?.email || !items?.length || !shippingAddress) {
            return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
        }

        // Get authenticated user if available
        const session = await getServerSession(authOptions);
        let userId = null;
        if (session?.user) {
            const user = await User.findOne({ email: session.user.email, siteId });
            if (user) {
                userId = user._id;
                // Update user stats
                user.totalOrders = (user.totalOrders || 0) + 1;
                user.totalSpent = (user.totalSpent || 0) + total;
                await user.save();
            }
        }

        const order = await Order.create({
            siteId,
            orderNumber: generateOrderNumber(),
            customer,
            userId,
            items,
            shippingAddress,
            shippingCost,
            subtotal,
            tax,
            total,
            paymentMethod,
            transactionId,
            senderName,
            senderPhone,
            bankName,
            iban,
            paymentReceiptUrl,
            paymentStatus: paymentMethod === 'cod' ? 'awaiting_delivery_payment' : 'pending_verification',
            fulfillmentStatus: 'unfulfilled',
        });

        return NextResponse.json({ order });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json({ error: 'حدث خطأ في إنشاء الطلب' }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const orders = await Order.find({ siteId }).sort({ createdAt: -1 }).limit(50).lean();
        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json({ error: 'خطأ في تحميل الطلبات' }, { status: 500 });
    }
}
