import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
    title: 'لوحة الإدارة - متجري',
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    
    // Next 16 requires awaiting headers
    const requestHeaders = await headers();
    const currentSiteId = requestHeaders.get('x-site-id');

    if (!session || !session.user) {
        redirect('/');
    }

    const { role, siteId } = session.user as any;

    // Check if user has admin/owner rights AND belongs to the current store
    if ((role !== 'owner' && role !== 'admin') || siteId !== currentSiteId) {
        redirect('/');
    }

    return (
        <div className="flex min-h-screen bg-surface">
            <AdminSidebar />
            <main className="flex-1 min-h-screen overflow-x-hidden">
                <div className="p-4 md:p-8">{children}</div>
            </main>
        </div>
    );
}
