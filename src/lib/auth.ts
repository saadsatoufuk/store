import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from './mongodb';
import User from './models/User';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
                siteId: { label: 'SiteId', type: 'text' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
                }

                await connectDB();

                // siteId is passed from the login form (resolved dynamically from host)
                const siteId = credentials.siteId;
                if (!siteId) {
                    throw new Error('لم يتم تحديد المتجر');
                }

                const user = await User.findOne({ email: credentials.email, siteId });

                if (!user) {
                    throw new Error('لم يتم العثور على حساب بهذا البريد الإلكتروني');
                }

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!isValid) {
                    throw new Error('كلمة المرور غير صحيحة');
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image: user.avatar,
                    siteId: user.siteId.toString(),
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as unknown as Record<string, unknown>).role as string;
                token.siteId = (user as unknown as Record<string, unknown>).siteId as string;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as unknown as Record<string, unknown>).id = token.id;
                (session.user as unknown as Record<string, unknown>).role = token.role;
                (session.user as unknown as Record<string, unknown>).siteId = token.siteId;
            }
            return session;
        },
    },
    pages: {
        signIn: '/account',
        error: '/account',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
