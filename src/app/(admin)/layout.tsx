import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
    title: 'لوحة الإدارة - متجري',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-surface">
            <AdminSidebar />
            <main className="flex-1 min-h-screen overflow-x-hidden">
                <div className="p-4 md:p-8">{children}</div>
            </main>
        </div>
    );
}
