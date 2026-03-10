import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
    siteId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    rating: number;
    title: string;
    body: string;
    isVerified: boolean;
    isApproved: boolean;
    helpful: number;
    createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    body: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    helpful: { type: Number, default: 0 },
}, { timestamps: true });

ReviewSchema.index({ siteId: 1, productId: 1 });
ReviewSchema.index({ siteId: 1, userId: 1 });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
