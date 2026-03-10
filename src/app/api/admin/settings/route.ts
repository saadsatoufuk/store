import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteSettings from '@/lib/models/SiteSettings';
import { getSiteId } from '@/lib/tenant';

export async function PATCH(request: Request) {
    try {
        await connectDB();
        const siteId = await getSiteId();
        const body = await request.json();
        let settings = await SiteSettings.findOne({ siteId });
        if (!settings) {
            settings = await SiteSettings.create({ ...body, siteId });
        } else {
            Object.assign(settings, body);
            await settings.save();
        }
        return NextResponse.json({ settings });
    } catch (error) {
        return NextResponse.json({ error: 'خطأ في حفظ الإعدادات' }, { status: 500 });
    }
}
