import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
    isDefault: boolean;
    fullName: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface IUser extends Document {
    siteId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    passwordHash: string;
    phone: string;
    avatar: string;
    addresses: IAddress[];
    role: 'customer' | 'admin' | 'owner';
    totalOrders: number;
    totalSpent: number;
    wishlist: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
    isDefault: { type: Boolean, default: false },
    fullName: { type: String, required: true },
    address1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'SA' },
}, { _id: true });

const UserSchema = new Schema<IUser>({
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    addresses: [AddressSchema],
    role: { type: String, enum: ['customer', 'admin', 'owner'], default: 'customer' },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

UserSchema.index({ siteId: 1, email: 1 }, { unique: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
