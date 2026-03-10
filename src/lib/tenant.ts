import { headers } from 'next/headers';

/**
 * Resolves the siteId for the current request.
 * Reads the x-site-id header set by the middleware.
 * 
 * The middleware resolves the siteId dynamically from the request host
 * (subdomain or domain), so no environment variables are needed.
 * 
 * Throws if no siteId can be resolved.
 */
export async function getSiteId(): Promise<string> {
    const headersList = await headers();

    const siteId = headersList.get('x-site-id');
    if (siteId) {
        return siteId;
    }

    throw new Error(
        'Could not resolve siteId. Make sure the request host matches a registered site subdomain or domain.'
    );
}
