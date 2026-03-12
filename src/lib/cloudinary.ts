import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image Buffer to Cloudinary
 * @param fileBuffer The image buffer to upload
 * @param folder The folder in Cloudinary to store the image
 * @returns The secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (
    fileBuffer: Buffer,
    folder: string = 'payment_receipts'
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    reject(error);
                } else if (!result) {
                    reject(new Error('Cloudinary Upload Error: No result returned'));
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        // Write the buffer to the upload stream and end it
        uploadStream.end(fileBuffer);
    });
};
