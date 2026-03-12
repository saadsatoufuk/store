import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Multi-tenant middleware.
 * Resolves the current store's siteId dynamically from the request host
 * by calling an internal API route (Edge middleware cannot use MongoDB).
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip internal API routes to avoid infinite loop
    if (pathname.startsWith('/api/internal/')) {
        return NextResponse.next();
    }

    // Skip static assets and metadata
    if (
        pathname.startsWith('/_next/') ||
        pathname === '/favicon.ico' ||
        pathname === '/sitemap.xml' ||
        pathname === '/robots.txt'
    ) {
        return NextResponse.next();
    }

    // Platform routes are checked after we attempt to resolve the site,
    // so if the site doesn't exist (e.g. platform domain), we allow these routes.

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost';

    try {
        // Call internal API to resolve siteId from the host
        const resolveUrl = new URL('/api/internal/resolve-site', request.url);
        resolveUrl.searchParams.set('host', host);

        const res = await fetch(resolveUrl.toString());

        if (!res.ok) {
            // If site not found, check if it's a platform route and allow it
            const PLATFORM_ROUTES = [
                '/', '/login', '/signup', '/create-store', '/dashboard',
                '/api/stores', '/api/auth', '/api/landings'
            ];
            
            if (PLATFORM_ROUTES.some(route => route === '/' ? pathname === '/' : pathname.startsWith(route))) {
                return NextResponse.next();
            }

            // Otherwise, it's a tenant route without a valid store, return 404 error
            if (pathname.startsWith('/api/')) {
                return NextResponse.json(
                    { error: 'Store not found for this domain' },
                    { status: 404 }
                );
            }
            return new NextResponse(
                '<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;direction:rtl"><h1>المتجر غير موجود</h1></body></html>',
                { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
        }

        const { siteId, ownerId } = await res.json();

        // Enforce owner creation if store has no owner yet
        if (ownerId === null && pathname !== '/create-owner' && !pathname.startsWith('/api/')) {
            return NextResponse.redirect(new URL('/create-owner', request.url));
        }

        // Set x-site-id header for downstream API routes and server components
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-site-id', siteId);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error) {
        console.error('Middleware site resolution error:', error);
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
