import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google";
import { Adapter } from "next-auth/adapters";
import { fetchRedis } from "@/helpers/redis";

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
  // everytime when someones logs in, a certain action will be done automatically
  // in our case user data will be put in DB
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
      // this id is added by adapter automatically
      const dbUserResult = (await fetchRedis("get", `user:${token.id}`)) as
        | string
        | null;

      if (!dbUserResult) {
        token.id = user!.id;
        return token;
      }

      const dbUser = JSON.parse(dbUserResult) as User;

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        meranaam: "chinchinchu",
      };
    },

    async session({ session, token, user }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      return "/dashboard";
    },
  },
};
