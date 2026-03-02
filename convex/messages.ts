import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();
  },
});

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    role: v.string(),
    agentSource: v.optional(v.string()),
    suggestionType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify conversation belongs to user
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found");
    }

    // Update conversation timestamp
    await ctx.db.patch(args.conversationId, { updatedAt: Date.now() });

    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId,
      role: args.role,
      content: args.content,
      agentSource: args.agentSource,
      suggestionType: args.suggestionType,
      createdAt: Date.now(),
    });
  },
});

// Simulate AI response (in production, this would call actual APIs)
export const generateResponse = mutation({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    preferredModel: v.string(),
    focusArea: v.string(),
    creativityLevel: v.number(),
    agentPersonality: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Determine which "AI" responds based on settings
    const models = args.preferredModel === "all"
      ? ["claude", "grok", "chatgpt"]
      : [args.preferredModel];

    const selectedModel = models[Math.floor(Math.random() * models.length)];

    // Determine suggestion type based on focus or user message
    let suggestionType = args.focusArea;
    if (args.focusArea === "all") {
      const lowered = args.userMessage.toLowerCase();
      if (lowered.includes("game")) suggestionType = "games";
      else if (lowered.includes("app")) suggestionType = "apps";
      else if (lowered.includes("reason") || lowered.includes("think")) suggestionType = "reasoning";
      else suggestionType = ["games", "apps", "reasoning"][Math.floor(Math.random() * 3)];
    }

    // Generate contextual response based on settings
    const responses = generateContextualResponse(
      args.userMessage,
      selectedModel,
      suggestionType,
      args.creativityLevel,
      args.agentPersonality
    );

    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId,
      role: "agent",
      content: responses,
      agentSource: selectedModel,
      suggestionType,
      createdAt: Date.now(),
    });
  },
});

function generateContextualResponse(
  prompt: string,
  model: string,
  category: string,
  creativity: number,
  personality: string
): string {
  const modelPrefixes: Record<string, string> = {
    claude: "[CLAUDE-7] Analyzing vibe parameters...\n\n",
    grok: "[GROK-X] Scanning the matrix for epic builds...\n\n",
    chatgpt: "[GPT-CORE] Processing your creative request...\n\n",
  };

  const gameIdeas = [
    "**Quantum Tetris**: A puzzle game where blocks exist in superposition until observed. Each piece is simultaneously multiple shapes until you 'collapse' it by touching it.",
    "**Memory Palace VR**: Build a 3D memory palace in VR to store and retrieve information. Walk through your own mind architecture.",
    "**Emotion Dungeon Crawler**: A roguelike where your character's emotions affect gameplay. Fear makes enemies stronger, joy heals, anger deals damage but hurts you too.",
    "**Time Loop Racing**: Race against your past selves. Each lap, a ghost of your previous attempts joins the track. Optimize or crash into yourself.",
    "**Sound Garden**: A meditative game where you plant seeds that grow into musical instruments. Compose by gardening.",
  ];

  const appIdeas = [
    "**Vibe Compiler**: An IDE that suggests code based on your mood. Uses biometrics to detect frustration and auto-suggests coffee breaks.",
    "**Dream Logger**: Voice-activated dream journal that uses AI to find patterns and symbolism in your dreams over time.",
    "**Focus Forge**: A productivity app that gamifies deep work. Build a virtual blacksmith shop by completing focus sessions.",
    "**Async Coffee**: Schedule serendipitous video calls with interesting people. 15 minutes, no agenda, just vibes.",
    "**Code Archaeology**: Visualize git histories as geological layers. Dig through your project's past like an archaeologist.",
  ];

  const reasoningIdeas = [
    "**Thought Experiment**: You're tasked with designing a fair society, but every rule you create has unintended consequences. Explore second-order effects.",
    "**Paradox Navigator**: Work through famous philosophical paradoxes with guided questions. Ship of Theseus, Trolley Problem, Newcomb's Problem.",
    "**Argument Mapper**: Visually map out complex arguments, identify logical fallacies, and strengthen your reasoning skills.",
    "**Counterfactual Engine**: Explore 'what if' scenarios in history. What if the printing press wasn't invented? Trace the cascading effects.",
    "**Debate Simulator**: Practice argumentation against an AI that adapts to your reasoning style and finds your weak points.",
  ];

  const ideas: Record<string, string[]> = {
    games: gameIdeas,
    apps: appIdeas,
    reasoning: reasoningIdeas,
  };

  const selectedIdeas = ideas[category] || gameIdeas;
  const ideaIndex = Math.floor(Math.random() * selectedIdeas.length);
  const idea = selectedIdeas[ideaIndex];

  const personalityTones: Record<string, string> = {
    creative: "This concept pushes boundaries and embraces the weird. Perfect for those who want to explore uncharted territory.",
    technical: "Implementation-wise, this is achievable with modern frameworks. Consider using WebGL for visuals and a real-time backend for state.",
    balanced: "This balances creativity with feasibility. Start with an MVP focusing on the core mechanic, then iterate.",
  };

  const creativityNote = creativity >= 8
    ? "Given your high creativity setting, I've pushed this concept to its experimental limits."
    : creativity >= 5
    ? "This suggestion balances innovation with practicality."
    : "This is a grounded, achievable project with proven mechanics.";

  const promptEcho = `Your prompt: "${prompt}"\n\n`;

  return `${modelPrefixes[model]}${promptEcho}**VIBE CODE SUGGESTION [${category.toUpperCase()}]**\n\n${idea}\n\n${personalityTones[personality]}\n\n${creativityNote}\n\n---\n*Agent 7 Neural Link Active | Model: ${model.toUpperCase()} | Creativity: ${creativity}/10*`;
}
