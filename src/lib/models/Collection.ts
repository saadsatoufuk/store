import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICollection extends Document {
    siteId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    description: string;
    image: string;
    products: mongoose.Types.ObjectId[];
    isActive: boolean;
}

const CollectionSchema = new Schema<ICollection>({
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

CollectionSchema.index({ siteId: 1, slug: 1 }, { unique: true });

const Collection: Model<ICollection> = mongoose.models.Collection || mongoose.model<ICollection>('Collection', CollectionSchema);
export default Collection;
