import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    image: string;
    price: number;
    quantity: number;
    variant: string;
}

export interface IShippingAddress {
    fullName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface IOrder extends Document {
    siteId: mongoose.Types.ObjectId;
    orderNumber: string;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    userId: mongoose.Types.ObjectId | null;
    items: IOrderItem[];
    subtotal: number;
    discountAmount: number;
    couponCode: string;
    shippingCost: number;
    tax: number;
    total: number;
    shippingAddress: IShippingAddress;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    fulfillmentStatus: 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    stripePaymentIntentId: string;
    trackingNumber: string;
    trackingUrl: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    variant: { type: String, default: '' },
}, { _id: false });

const ShippingAddressSchema = new Schema<IShippingAddress>({
    fullName: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'SA' },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    orderNumber: { type: String, required: true },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, default: '' },
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shippingAddress: ShippingAddressSchema,
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    fulfillmentStatus: { type: String, enum: ['unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'unfulfilled' },
    stripePaymentIntentId: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    trackingUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
}, { timestamps: true });

OrderSchema.index({ siteId: 1, orderNumber: 1 }, { unique: true });
OrderSchema.index({ siteId: 1, 'customer.email': 1 });
OrderSchema.index({ siteId: 1, userId: 1 });
OrderSchema.index({ siteId: 1, createdAt: -1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
