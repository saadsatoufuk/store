import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
    siteId: mongoose.Types.ObjectId;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount: number;
    maxUses: number;
    usedCount: number;
    isActive: boolean;
    expiresAt: Date;
}

const CouponSchema = new Schema<ICoupon>({
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    code: { type: String, required: true, uppercase: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
}, { timestamps: true });

CouponSchema.index({ siteId: 1, code: 1 }, { unique: true });

const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
export default Coupon;
