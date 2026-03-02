import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("savedSuggestions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const save = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    sourceAgent: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("savedSuggestions", {
      userId,
      ...args,
      savedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("savedSuggestions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const suggestion = await ctx.db.get(args.id);
    if (!suggestion || suggestion.userId !== userId) {
      throw new Error("Suggestion not found");
    }

    await ctx.db.delete(args.id);
  },
});
