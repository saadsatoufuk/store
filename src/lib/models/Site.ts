import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISite extends Document {
    name: string;
    domain: string;
    subdomain: string;
    ownerId: mongoose.Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SiteSchema = new Schema<ISite>({
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true },
    subdomain: { type: String, required: true, unique: true, lowercase: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

SiteSchema.index({ subdomain: 1 });
SiteSchema.index({ domain: 1 });

const Site: Model<ISite> = mongoose.models.Site || mongoose.model<ISite>('Site', SiteSchema);
export default Site;
