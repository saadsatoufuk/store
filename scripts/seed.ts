import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/store';

// Inline schemas to avoid import issues with tsx
const SiteSchema = new mongoose.Schema({
    name: String, domain: { type: String, unique: true }, subdomain: { type: String, unique: true, lowercase: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    name: String, slug: String, image: String, description: String, isActive: { type: Boolean, default: true }, sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    name: String, slug: String, description: String, shortDescription: String,
    price: Number, compareAtPrice: { type: Number, default: 0 }, cost: { type: Number, default: 0 },
    images: [String], category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
    tags: [String], variants: [{ name: String, options: [{ value: String, stock: Number, sku: String, priceAdjustment: { type: Number, default: 0 } }] }],
    totalStock: { type: Number, default: 0 }, isActive: { type: Boolean, default: true }, isFeatured: { type: Boolean, default: false },
    badge: { type: String, default: null }, weight: { type: Number, default: 0 },
    seo: { title: String, description: String }, rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    soldCount: { type: Number, default: 0 },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    name: String, email: String, passwordHash: String, phone: String,
    avatar: String, addresses: [{ isDefault: Boolean, fullName: String, address1: String, city: String, state: String, zip: String, country: String }],
    role: { type: String, default: 'customer' }, totalOrders: { type: Number, default: 0 }, totalSpent: { type: Number, default: 0 },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    orderNumber: String, customer: { name: String, email: String, phone: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items: [{ productId: { type: mongoose.Schema.Types.ObjectId }, name: String, image: String, price: Number, quantity: Number, variant: String }],
    subtotal: Number, discountAmount: { type: Number, default: 0 }, couponCode: String,
    shippingCost: { type: Number, default: 0 }, tax: { type: Number, default: 0 }, total: Number,
    shippingAddress: { fullName: String, address1: String, address2: String, city: String, state: String, zip: String, country: String },
    paymentStatus: { type: String, default: 'paid' }, fulfillmentStatus: { type: String, default: 'unfulfilled' },
    stripePaymentIntentId: String, trackingNumber: String, trackingUrl: String, notes: String,
}, { timestamps: true });

const SiteSettingsSchema = new mongoose.Schema({
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    siteName: String, logoUrl: String, primaryColor: String, contactEmail: String,
    phone: String, footerText: String, freeShippingThreshold: Number, flatRateShipping: Number,
    taxRate: Number, currency: String,
}, { timestamps: true });

const CouponSchema = new mongoose.Schema({
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    code: String, type: String, value: Number,
    minOrderAmount: { type: Number, default: 0 }, maxUses: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 }, isActive: { type: Boolean, default: true }, expiresAt: Date,
}, { timestamps: true });

async function seed() {
    console.log('🌱 بدء عملية البذر...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // Clear
    const Site = mongoose.models.Site || mongoose.model('Site', SiteSchema);
    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
    const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
    const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

    await Site.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    await SiteSettings.deleteMany({});
    await Coupon.deleteMany({});

    // Create default site
    const site = await Site.create({
        name: 'متجري',
        domain: 'store.localhost',
        subdomain: 'store',
    });
    const siteId = site._id;
    console.log(`✅ تم إنشاء الموقع (siteId: ${siteId})`);
    console.log(`\n🌐 يمكنك الوصول إلى المتجر عبر: http://store.localhost:3000\n`);

    // Categories
    const categories = await Category.insertMany([
        { siteId, name: 'ساعات', slug: 'watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600', description: 'ساعات فاخرة لكل مناسبة', sortOrder: 1 },
        { siteId, name: 'حقائب', slug: 'bags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600', description: 'حقائب أنيقة وعملية', sortOrder: 2 },
        { siteId, name: 'نظارات', slug: 'glasses', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', description: 'نظارات شمسية وطبية', sortOrder: 3 },
        { siteId, name: 'إكسسوارات', slug: 'accessories', image: 'https://images.unsplash.com/photo-1611923134239-b9be5b4d1b22?w=600', description: 'إكسسوارات متنوعة', sortOrder: 4 },
    ]);
    console.log(`✅ تم إنشاء ${categories.length} تصنيفات`);

    // Products
    const productsData = [
        { siteId, name: 'ساعة كلاسيكية ذهبية', slug: 'classic-gold-watch', shortDescription: 'ساعة يد كلاسيكية بإطار ذهبي أنيق', description: '<p>ساعة يد فاخرة بتصميم كلاسيكي لا يتقادم. مصنوعة من الستانلس ستيل المطلي بالذهب مع سوار جلدي إيطالي. مقاومة للماء حتى 50 متر.</p>', price: 899, compareAtPrice: 1299, cost: 350, images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'], category: categories[0]._id, tags: ['ساعات', 'ذهبي', 'كلاسيك'], variants: [{ name: 'اللون', options: [{ value: 'ذهبي', stock: 15, sku: 'CW-GOLD' }, { value: 'فضي', stock: 10, sku: 'CW-SILVER' }, { value: 'أسود', stock: 3, sku: 'CW-BLACK' }] }], totalStock: 28, isFeatured: true, badge: 'الأكثر مبيعاً', rating: { average: 4.8, count: 124 }, soldCount: 342 },
        { siteId, name: 'ساعة رياضية سوداء', slug: 'sport-black-watch', shortDescription: 'ساعة رياضية عصرية مقاومة للماء', description: '<p>ساعة رياضية بتصميم عصري مع عداد كرونوغراف. مقاومة للصدمات والماء حتى 100 متر. مثالية للرياضيين.</p>', price: 649, compareAtPrice: 0, cost: 250, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600'], category: categories[0]._id, tags: ['ساعات', 'رياضي', 'أسود'], variants: [{ name: 'المقاس', options: [{ value: '40mm', stock: 20, sku: 'SW-40' }, { value: '44mm', stock: 15, sku: 'SW-44' }] }], totalStock: 35, isFeatured: true, badge: 'جديد', rating: { average: 4.6, count: 89 }, soldCount: 156 },
        { siteId, name: 'حقيبة جلدية فاخرة', slug: 'luxury-leather-bag', shortDescription: 'حقيبة يد من الجلد الطبيعي الفاخر', description: '<p>حقيبة يد مصنوعة يدوياً من أجود أنواع الجلد الطبيعي. تصميم أنيق يناسب العمل والمناسبات.</p>', price: 1299, compareAtPrice: 1899, cost: 500, images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'], category: categories[1]._id, tags: ['حقائب', 'جلد', 'فاخر'], variants: [{ name: 'اللون', options: [{ value: 'بني', stock: 8, sku: 'LB-BROWN' }, { value: 'أسود', stock: 12, sku: 'LB-BLACK' }, { value: 'كحلي', stock: 5, sku: 'LB-NAVY' }] }], totalStock: 25, isFeatured: true, badge: 'تخفيض', rating: { average: 4.9, count: 67 }, soldCount: 198 },
        { siteId, name: 'حقيبة ظهر عصرية', slug: 'modern-backpack', shortDescription: 'حقيبة ظهر عملية بتصميم عصري', description: '<p>حقيبة ظهر متعددة الاستخدامات مع جيب للابتوب ومنافذ USB. مصنوعة من مواد مقاومة للماء.</p>', price: 349, compareAtPrice: 0, cost: 120, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'], category: categories[1]._id, tags: ['حقائب', 'ظهر', 'عصري'], totalStock: 42, isFeatured: false, badge: null, rating: { average: 4.4, count: 53 }, soldCount: 287 },
        { siteId, name: 'نظارة شمسية أفياتور', slug: 'aviator-sunglasses', shortDescription: 'نظارة شمسية بتصميم أفياتور الكلاسيكي', description: '<p>نظارة شمسية بتصميم أفياتور الأيقوني. عدسات مستقطبة توفر حماية كاملة من أشعة UV400.</p>', price: 459, compareAtPrice: 599, cost: 150, images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600'], category: categories[2]._id, tags: ['نظارات', 'شمسية', 'أفياتور'], variants: [{ name: 'لون العدسة', options: [{ value: 'أسود', stock: 18, sku: 'AV-BLK' }, { value: 'بني', stock: 12, sku: 'AV-BRN' }, { value: 'أزرق', stock: 8, sku: 'AV-BLU' }] }], totalStock: 38, isFeatured: true, badge: 'تخفيض', rating: { average: 4.7, count: 96 }, soldCount: 415 },
        { siteId, name: 'نظارة كات آي', slug: 'cat-eye-glasses', shortDescription: 'نظارة نسائية بتصميم كات آي الأنيق', description: '<p>نظارة بتصميم كات آي العصري. إطار خفيف ومريح مع عدسات عالية الجودة.</p>', price: 399, compareAtPrice: 0, cost: 130, images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600'], category: categories[2]._id, tags: ['نظارات', 'كات آي', 'نسائي'], totalStock: 22, isFeatured: false, badge: 'جديد', rating: { average: 4.5, count: 41 }, soldCount: 89 },
        { siteId, name: 'محفظة جلدية رجالية', slug: 'mens-leather-wallet', shortDescription: 'محفظة جلدية أنيقة بتصميم رفيع', description: '<p>محفظة رجالية من الجلد الطبيعي. تصميم رفيع مع تقنية RFID لحماية بطاقاتك.</p>', price: 249, compareAtPrice: 349, cost: 80, images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', 'https://images.unsplash.com/photo-1611923134239-b9be5b4d1b22?w=600'], category: categories[3]._id, tags: ['محافظ', 'جلد', 'رجالي'], variants: [{ name: 'اللون', options: [{ value: 'بني', stock: 25, sku: 'MW-BRN' }, { value: 'أسود', stock: 30, sku: 'MW-BLK' }] }], totalStock: 55, isFeatured: true, badge: null, rating: { average: 4.6, count: 78 }, soldCount: 523 },
        { siteId, name: 'سوار جلد مضفر', slug: 'braided-leather-bracelet', shortDescription: 'سوار من الجلد المضفر بإبزيم معدني', description: '<p>سوار يد أنيق من الجلد المضفر يدوياً. إبزيم من الستانلس ستيل. يضيف لمسة عصرية لإطلالتك.</p>', price: 129, compareAtPrice: 0, cost: 35, images: ['https://images.unsplash.com/photo-1611923134239-b9be5b4d1b22?w=600', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600'], category: categories[3]._id, tags: ['أساور', 'جلد', 'رجالي'], variants: [{ name: 'المقاس', options: [{ value: 'S', stock: 15, sku: 'BLB-S' }, { value: 'M', stock: 20, sku: 'BLB-M' }, { value: 'L', stock: 10, sku: 'BLB-L' }] }], totalStock: 45, isFeatured: false, badge: null, rating: { average: 4.3, count: 32 }, soldCount: 167 },
        { siteId, name: 'ساعة ذكية برو', slug: 'smart-watch-pro', shortDescription: 'ساعة ذكية متطورة مع مستشعرات صحية', description: '<p>ساعة ذكية بشاشة AMOLED مع مراقبة نبض القلب والأكسجين. بطارية تدوم 7 أيام. متوافقة مع iOS وAndroid.</p>', price: 1499, compareAtPrice: 1899, cost: 600, images: ['https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'], category: categories[0]._id, tags: ['ساعات', 'ذكية', 'تقنية'], variants: [{ name: 'اللون', options: [{ value: 'أسود', stock: 2, sku: 'SWP-BLK' }, { value: 'فضي', stock: 8, sku: 'SWP-SLV' }] }], totalStock: 10, isFeatured: true, badge: 'جديد', rating: { average: 4.9, count: 45 }, soldCount: 89 },
        { siteId, name: 'حقيبة كروسبودي صغيرة', slug: 'mini-crossbody-bag', shortDescription: 'حقيبة كروسبودي صغيرة وأنيقة', description: '<p>حقيبة كروسبودي مدمجة مثالية للخروجات اليومية. حزام قابل للتعديل وجيوب متعددة.</p>', price: 259, compareAtPrice: 0, cost: 85, images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'], category: categories[1]._id, tags: ['حقائب', 'كروسبودي', 'صغيرة'], totalStock: 4, isFeatured: false, badge: null, rating: { average: 4.2, count: 28 }, soldCount: 134 },
        { siteId, name: 'طقم إكسسوارات فاخر', slug: 'luxury-accessories-set', shortDescription: 'طقم إكسسوارات متكامل في علبة هدايا', description: '<p>طقم إكسسوارات يتضمن محفظة وسوار وحامل بطاقات. مغلف في علبة هدايا فاخرة.</p>', price: 599, compareAtPrice: 799, cost: 200, images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', 'https://images.unsplash.com/photo-1611923134239-b9be5b4d1b22?w=600'], category: categories[3]._id, tags: ['طقم', 'هدايا', 'فاخر'], totalStock: 18, isFeatured: true, badge: 'تخفيض', rating: { average: 4.8, count: 56 }, soldCount: 201 },
        { siteId, name: 'نظارة رياضية', slug: 'sport-sunglasses', shortDescription: 'نظارة رياضية خفيفة ومريحة', description: '<p>نظارة مصممة خصيصاً للأنشطة الرياضية. إطار مرن ومقاوم للصدمات مع عدسات مستقطبة.</p>', price: 299, compareAtPrice: 0, cost: 95, images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600'], category: categories[2]._id, tags: ['نظارات', 'رياضية'], totalStock: 30, isFeatured: false, badge: null, rating: { average: 4.4, count: 37 }, soldCount: 156 },
    ];

    const products = await Product.insertMany(productsData);
    console.log(`✅ تم إنشاء ${products.length} منتج`);

    // Admin user
    const adminHash = await bcrypt.hash('admin123', 12);
    const admin = await User.create({ siteId, name: 'مدير النظام', email: 'admin@store.com', passwordHash: adminHash, role: 'admin' });
    console.log('✅ تم إنشاء حساب المدير (admin@store.com / admin123)');

    // Update site with ownerId
    await Site.findByIdAndUpdate(siteId, { ownerId: admin._id });

    // Sample customer
    const customerHash = await bcrypt.hash('customer123', 12);
    await User.create({ siteId, name: 'سارة أحمد', email: 'sara@example.com', passwordHash: customerHash, role: 'customer', totalOrders: 3, totalSpent: 2150 });
    console.log('✅ تم إنشاء حساب عميل تجريبي (sara@example.com / customer123)');

    // Sample orders
    const sampleOrders = [
        { siteId, orderNumber: '#1001', customer: { name: 'سارة أحمد', email: 'sara@example.com', phone: '0551234567' }, items: [{ productId: products[0]._id, name: products[0].name, image: products[0].images[0], price: products[0].price, quantity: 1, variant: 'اللون: ذهبي' }], subtotal: 899, shippingCost: 0, tax: 134.85, total: 1033.85, shippingAddress: { fullName: 'سارة أحمد', address1: 'شارع التحلية', city: 'الرياض', state: 'الرياض', zip: '12345', country: 'SA' }, paymentStatus: 'paid', fulfillmentStatus: 'delivered' },
        { siteId, orderNumber: '#1002', customer: { name: 'محمد علي', email: 'mohammed@example.com', phone: '0559876543' }, items: [{ productId: products[2]._id, name: products[2].name, image: products[2].images[0], price: products[2].price, quantity: 1, variant: 'اللون: بني' }, { productId: products[6]._id, name: products[6].name, image: products[6].images[0], price: products[6].price, quantity: 1, variant: 'اللون: أسود' }], subtotal: 1548, shippingCost: 0, tax: 232.2, total: 1780.2, shippingAddress: { fullName: 'محمد علي', address1: 'شارع الملك فهد', city: 'جدة', state: 'مكة', zip: '21345', country: 'SA' }, paymentStatus: 'paid', fulfillmentStatus: 'shipped' },
        { siteId, orderNumber: '#1003', customer: { name: 'نورة خالد', email: 'noura@example.com', phone: '0561112233' }, items: [{ productId: products[4]._id, name: products[4].name, image: products[4].images[0], price: products[4].price, quantity: 2, variant: 'لون العدسة: أسود' }], subtotal: 918, shippingCost: 0, tax: 137.7, total: 1055.7, shippingAddress: { fullName: 'نورة خالد', address1: 'شارع الأمير سلطان', city: 'الدمام', state: 'الشرقية', zip: '31234', country: 'SA' }, paymentStatus: 'paid', fulfillmentStatus: 'processing' },
        { siteId, orderNumber: '#1004', customer: { name: 'أحمد سعيد', email: 'ahmed@example.com', phone: '0554443322' }, items: [{ productId: products[8]._id, name: products[8].name, image: products[8].images[0], price: products[8].price, quantity: 1, variant: 'اللون: أسود' }], subtotal: 1499, shippingCost: 0, tax: 224.85, total: 1723.85, shippingAddress: { fullName: 'أحمد سعيد', address1: 'شارع العليا', city: 'الرياض', state: 'الرياض', zip: '12678', country: 'SA' }, paymentStatus: 'paid', fulfillmentStatus: 'unfulfilled' },
    ];
    await Order.insertMany(sampleOrders);
    console.log(`✅ تم إنشاء ${sampleOrders.length} طلبات تجريبية`);

    // Site Settings
    await SiteSettings.create({ siteId, siteName: 'متجري', logoUrl: '/logo.png', primaryColor: '#0F0F0F', contactEmail: 'hello@store.com', phone: '+966551234567', footerText: '© 2025 متجري. جميع الحقوق محفوظة', freeShippingThreshold: 200, flatRateShipping: 25, taxRate: 15, currency: 'SAR' });
    console.log('✅ تم إنشاء إعدادات الموقع');

    // Coupons
    await Coupon.insertMany([
        { siteId, code: 'WELCOME10', type: 'percentage', value: 10, minOrderAmount: 100, maxUses: 100, isActive: true },
        { siteId, code: 'SAVE50', type: 'fixed', value: 50, minOrderAmount: 300, maxUses: 50, isActive: true },
    ]);
    console.log('✅ تم إنشاء أكواد خصم (WELCOME10, SAVE50)');

    console.log('\n🎉 تمت عملية البذر بنجاح!');
    console.log('---');
    console.log(`🔑 siteId: ${siteId}`);
    console.log('حساب المدير: admin@store.com / admin123');
    console.log('حساب العميل: sara@example.com / customer123');
    console.log('أكواد الخصم: WELCOME10 (10%), SAVE50 (50 ر.س)');
    console.log(`\n🌐 يمكنك الوصول إلى المتجر عبر: http://store.localhost:3000`);

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => { console.error('❌ خطأ:', err); process.exit(1); });
