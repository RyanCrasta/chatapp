import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google";
import { Adapter } from "next-auth/adapters";

function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || clientId.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }
  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_SECRET");
  }

  return {
    clientId,
    clientSecret,
  };
}

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // check if this particular user id present in DB
      // this id is added by adapter
      const dbUser = (await db.get(`user:${token.id}`)) as User | null;
      console.log("dbUser before", dbUser);

      console.log("JWT USER", user, token);

      if (!dbUser) {
        token.id = user!.id;
        return token;
      }

      console.log("db user present", {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      });

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },

    async session({ session, token, user }) {
      console.log("before session",token, session);
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      console.log("after session", session);

      return session;
    },

    async redirect({ url, baseUrl }) {
      return "/dashboard";
    },
  },
};
