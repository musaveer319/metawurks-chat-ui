/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import connectToDatabase from './mongodb';
import { User } from './models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: { params: { prompt: 'consent' } }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Invalid credentials');
        }

        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.passwordHash) {
          throw new Error('User not found or uses OAuth');
        }

        const isMatch = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isMatch) {
          throw new Error('Incorrect password');
        }

        return { id: user._id.toString(), name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'credentials') {
        // Handle OAuth Sign In
        try {
          await connectToDatabase();
          // Handle missing email from OAuth providers (like GitHub)
          const email = user.email || (profile as any)?.email || `${account?.providerAccountId}@${account?.provider}.local`;
          
          const existingUser = await User.findOne({ email });
          if (!existingUser) {
            await User.create({
              name: user.name || (profile as any)?.name || (profile as any)?.login || 'Unknown',
              email: email,
              provider: account?.provider,
              image: user.image || (profile as any)?.avatar_url,
            });
          }
        } catch (error) {
          console.error('Error during OAuth sign in', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account && user) {
        // Initial sign-in: map MongoDB _id to token.sub
        if (account.provider !== 'credentials') {
          await connectToDatabase();
          const email = user.email || (profile as any)?.email || `${account.providerAccountId}@${account.provider}.local`;
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            token.sub = existingUser._id.toString();
          }
        } else {
          token.sub = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Inject MongoDB user id into the session
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login', // Redirect unauthenticated users here
  },
  secret: process.env.NEXTAUTH_SECRET,
};
