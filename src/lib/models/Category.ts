import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
    siteId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    image: string;
    description: string;
    isActive: boolean;
    sortOrder: number;
}

const CategorySchema = new Schema<ICategory>({
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

CategorySchema.index({ siteId: 1, slug: 1 }, { unique: true });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export default Category;
