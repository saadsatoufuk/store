import { NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: 'لم يتم العثور على ملف' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary instead of local filesystem
        const secureUrl = await uploadImageToCloudinary(buffer, 'payment_receipts');

        // Return the Cloudinary public URL for the file
        return NextResponse.json({ url: secureUrl });
    } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء رفع الملف' }, { status: 500 });
    }
}
