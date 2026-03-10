import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteSettings from '@/lib/models/SiteSettings';
import { getSiteId } from '@/lib/tenant';

export async function GET() {
    try {
        await connectDB();
        const siteId = await getSiteId();
        let settings = await SiteSettings.findOne({ siteId }).lean();
        if (!settings) {
            settings = await SiteSettings.create({ siteId });
            settings = settings.toObject();
        }
        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Settings API error:', error);
        return NextResponse.json({ error: 'خطأ في تحميل الإعدادات' }, { status: 500 });
    }
}
