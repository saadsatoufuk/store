import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettings extends Document {
    siteId: mongoose.Types.ObjectId;
    siteName: string;
    logoUrl: string;
    primaryColor: string;
    contactEmail: string;
    phone: string;
    footerText: string;
    freeShippingThreshold: number;
    flatRateShipping: number;
    taxRate: number;
    currency: string;
    updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>({
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true, unique: true },
    siteName: { type: String, default: 'متجري' },
    logoUrl: { type: String, default: '/logo.png' },
    primaryColor: { type: String, default: '#0F0F0F' },
    contactEmail: { type: String, default: 'hello@store.com' },
    phone: { type: String, default: '' },
    footerText: { type: String, default: '© 2025 متجري. جميع الحقوق محفوظة' },
    freeShippingThreshold: { type: Number, default: 200 },
    flatRateShipping: { type: Number, default: 25 },
    taxRate: { type: Number, default: 15 },
    currency: { type: String, default: 'SAR' },
}, { timestamps: true });

async function getSettings(siteId: string): Promise<ISiteSettings> {
    const Model = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
    let settings = await Model.findOne({ siteId });
    if (!settings) {
        settings = await Model.create({ siteId });
    }
    return settings;
}

const SiteSettings: Model<ISiteSettings> = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
export { getSettings };
export default SiteSettings;
