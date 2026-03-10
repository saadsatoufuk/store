import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Site from '@/lib/models/Site';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        await connectDB();

        const siteId = request.headers.get('x-site-id');
        if (!siteId) {
            return NextResponse.json(
                { error: 'Store not found' },
                { status: 404 }
            );
        }

        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
        }

        // Verify the site exists and has no owner yet
        const site = await Site.findById(siteId);
        if (!site) {
             return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        if (site.ownerId) {
             return NextResponse.json({ error: 'This store already has an owner' }, { status: 403 });
        }

        const existing = await User.findOne({ email, siteId });
        if (existing) {
            return NextResponse.json({ error: 'البريد الإلكتروني مسجل مسبقاً' }, { status: 400 });
        }

        // Check if any user with this email already owns a store globally across the SaaS
        const existingUsersWithEmail = await User.find({ email });
        const userIds = existingUsersWithEmail.map(u => u._id);
        if (userIds.length > 0) {
            const existingStoreWithEmail = await Site.findOne({ ownerId: { $in: userIds } });
            if (existingStoreWithEmail) {
                return NextResponse.json(
                    { error: "You already own a store. Only one store is allowed per user." },
                    { status: 403 }
                );
            }
        }

        const passwordHash = await bcrypt.hash(password, 12);
        
        // Create the user as "owner"
        const user = await User.create({ 
            name, 
            email, 
            passwordHash, 
            role: 'owner', 
            siteId 
        });

        // Update site with new owner and activate
        site.ownerId = user._id;
        site.status = 'active';
        await site.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Create owner error:', error);
        return NextResponse.json({ error: 'حدث خطأ في التسجيل' }, { status: 500 });
    }
}
