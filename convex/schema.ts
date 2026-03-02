import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // User settings for Agent 7
  userSettings: defineTable({
    userId: v.id("users"),
    agentPersonality: v.string(), // "creative", "technical", "balanced"
    preferredModel: v.string(), // "claude", "grok", "chatgpt", "all"
    focusArea: v.string(), // "games", "apps", "reasoning", "all"
    creativityLevel: v.number(), // 1-10
    responseStyle: v.string(), // "detailed", "concise", "bullet"
  }).index("by_user", ["userId"]),

  // Chat conversations
  conversations: defineTable({
    userId: v.id("users"),
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Messages in conversations
  messages: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    role: v.string(), // "user" or "agent"
    content: v.string(),
    agentSource: v.optional(v.string()), // "claude", "grok", "chatgpt"
    suggestionType: v.optional(v.string()), // "game", "app", "reasoning"
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),

  // Saved suggestions
  savedSuggestions: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    sourceAgent: v.string(),
    savedAt: v.number(),
  }).index("by_user", ["userId"]),
});
