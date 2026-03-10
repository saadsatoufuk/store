import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISite extends Document {
    name: string;
    domain: string;
    subdomain: string;
    ownerId: mongoose.Types.ObjectId | null;
    status: 'pending' | 'active' | 'suspended';
    plan: string;
    rootDomain?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SiteSchema = new Schema<ISite>({
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true },
    subdomain: { type: String, required: true, unique: true, lowercase: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    rootDomain: { type: String, default: null },
    status: { type: String, default: 'pending', enum: ['pending', 'active', 'suspended'] },
    plan: { type: String, default: 'store' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// indexes are automatically created by mongoose due to unique: true in schema definition

const Site: Model<ISite> = mongoose.models.Site || mongoose.model<ISite>('Site', SiteSchema);
export default Site;
