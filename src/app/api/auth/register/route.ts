import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { getSiteId } from '@/lib/tenant';

export async function POST(request: Request) {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
        }

        const existing = await User.findOne({ email, siteId });
        if (existing) {
            return NextResponse.json({ error: 'البريد الإلكتروني مسجل مسبقاً' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        await User.create({ name, email, passwordHash, role: 'customer', siteId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'حدث خطأ في التسجيل' }, { status: 500 });
    }
}
