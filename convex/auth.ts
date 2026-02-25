import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateMagicLink = mutation({
  args: {
    email: v.string(),
    purpose: v.union(v.literal("login"), v.literal("onboarding")),
    plan: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const token = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    await ctx.db.insert("authTokens", {
      email: args.email.toLowerCase().trim(),
      token,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 min
      used: false,
      purpose: args.purpose,
      onboardingPlan: args.plan,
    });

    return { token };
  },
});

export const verifyMagicLink = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const authToken = await ctx.db
      .query("authTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!authToken) return { error: "Invalid token" };
    if (authToken.used) return { error: "Token already used" };
    if (authToken.expiresAt < Date.now()) return { error: "Token expired" };

    // Mark as used
    await ctx.db.patch(authToken._id, { used: true });

    // Get or create user
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", authToken.email))
      .first();

    const isNewUser = !user;

    if (!user) {
      const userId = await ctx.db.insert("users", {
        email: authToken.email,
        plan: "trial",
        trialArticleUsed: false,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    } else {
      await ctx.db.patch(user._id, { lastLoginAt: Date.now() });
    }

    // Create session
    const sessionToken = Array.from({ length: 48 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    await ctx.db.insert("userSessions", {
      userId: user!._id,
      sessionToken,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      createdAt: Date.now(),
    });

    return {
      sessionToken,
      isNewUser,
      purpose: authToken.purpose,
      onboardingPlan: authToken.onboardingPlan,
    };
  },
});

export const validateSession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_session_token", (q) =>
        q.eq("sessionToken", args.sessionToken)
      )
      .first();

    if (!session || session.expiresAt < Date.now()) return null;

    const user = await ctx.db.get(session.userId);
    return user;
  },
});

export const logout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_session_token", (q) =>
        q.eq("sessionToken", args.sessionToken)
      )
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

// For OSCR to call when a lead responds to cold outreach
export const createOnboardingLink = mutation({
  args: {
    email: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const token = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    await ctx.db.insert("authTokens", {
      email: args.email.toLowerCase().trim(),
      token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days for onboarding
      used: false,
      purpose: "onboarding",
      onboardingPlan: args.plan,
    });

    return {
      token,
      url: `https://bloomcontent.site/onboard?token=${token}&plan=${args.plan}`,
    };
  },
});
