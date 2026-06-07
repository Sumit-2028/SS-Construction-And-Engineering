import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authConfig } from "@/lib/auth/config";

const credentialsSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8).max(128)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            passwordHash: true,
            role: true,
            isActive: true,
            memberships: {
              where: { status: "ACTIVE" },
              select: { organizationId: true },
              take: 1
            },
            customerProfile: {
              select: { id: true, organizationId: true }
            }
          }
        });

        if (!user?.passwordHash || !user.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          organizationId:
            user.customerProfile?.organizationId ??
            user.memberships[0]?.organizationId,
          customerId: user.customerProfile?.id
        };
      }
    })
  ]
});
