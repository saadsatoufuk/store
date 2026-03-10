import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'متجري - تسوق أونلاين',
  description: 'وجهتك المفضلة للتسوق عبر الإنترنت. أفضل المنتجات بأعلى جودة وأفضل الأسعار.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
