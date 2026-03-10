import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVariantOption {
    value: string;
    stock: number;
    sku: string;
    priceAdjustment: number;
}

export interface IVariant {
    name: string;
    options: IVariantOption[];
}

export interface IProduct extends Document {
    siteId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    compareAtPrice: number;
    cost: number;
    images: string[];
    category: mongoose.Types.ObjectId;
    collections: mongoose.Types.ObjectId[];
    tags: string[];
    variants: IVariant[];
    totalStock: number;
    isActive: boolean;
    isFeatured: boolean;
    badge: string | null;
    weight: number;
    seo: {
        title: string;
        description: string;
    };
    rating: {
        average: number;
        count: number;
    };
    soldCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const VariantOptionSchema = new Schema<IVariantOption>({
    value: { type: String, required: true },
    stock: { type: Number, default: 0 },
    sku: { type: String, default: '' },
    priceAdjustment: { type: Number, default: 0 },
}, { _id: false });

const VariantSchema = new Schema<IVariant>({
    name: { type: String, required: true },
    options: [VariantOptionSchema],
}, { _id: false });

const ProductSchema = new Schema<IProduct>({
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    images: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    collections: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
    tags: [{ type: String }],
    variants: [VariantSchema],
    totalStock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    badge: { type: String, default: null },
    weight: { type: Number, default: 0 },
    seo: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
    },
    soldCount: { type: Number, default: 0 },
}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ siteId: 1, slug: 1 }, { unique: true });
ProductSchema.index({ siteId: 1, category: 1 });
ProductSchema.index({ siteId: 1, isActive: 1, isFeatured: 1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
