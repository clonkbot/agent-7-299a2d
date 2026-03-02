import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Return defaults if no settings exist
    if (!settings) {
      return {
        agentPersonality: "balanced",
        preferredModel: "all",
        focusArea: "all",
        creativityLevel: 7,
        responseStyle: "detailed",
      };
    }

    return settings;
  },
});

export const save = mutation({
  args: {
    agentPersonality: v.string(),
    preferredModel: v.string(),
    focusArea: v.string(),
    creativityLevel: v.number(),
    responseStyle: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("userSettings", {
        userId,
        ...args,
      });
    }
  },
});
