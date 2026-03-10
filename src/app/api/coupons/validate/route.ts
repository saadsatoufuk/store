import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/lib/models/Coupon';
import { getSiteId } from '@/lib/tenant';

export async function GET(request: Request) {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const subtotal = parseFloat(searchParams.get('subtotal') || '0');

        if (!code) return NextResponse.json({ valid: false, message: 'الكود مطلوب' });

        const coupon = await Coupon.findOne({ siteId, code: code.toUpperCase(), isActive: true });
        if (!coupon) return NextResponse.json({ valid: false, message: 'كود الخصم غير صالح' });
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return NextResponse.json({ valid: false, message: 'كود الخصم منتهي الصلاحية' });
        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ valid: false, message: 'تم استخدام الكود الحد الأقصى من المرات' });
        if (subtotal < coupon.minOrderAmount) return NextResponse.json({ valid: false, message: `الحد الأدنى للطلب ${coupon.minOrderAmount} ر.س` });

        const discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
        return NextResponse.json({ valid: true, discount: Math.min(discount, subtotal), coupon });
    } catch (error) {
        return NextResponse.json({ valid: false, message: 'حدث خطأ' }, { status: 500 });
    }
}
