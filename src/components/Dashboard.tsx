import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Settings } from "./Settings";
import { Id, Doc } from "../../convex/_generated/dataModel";

export function Dashboard() {
  const { signOut } = useAuthActions();
  const [showSettings, setShowSettings] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Id<"conversations"> | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const settings = useQuery(api.settings.get);
  const conversations = useQuery(api.conversations.list);
  const messages = useQuery(
    api.messages.list,
    currentConversation ? { conversationId: currentConversation } : "skip"
  );

  const createConversation = useMutation(api.conversations.create);
  const sendMessage = useMutation(api.messages.send);
  const generateResponse = useMutation(api.messages.generateResponse);
  const deleteConversation = useMutation(api.conversations.remove);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewSession = async () => {
    const id = await createConversation({ title: `Session ${(conversations?.length || 0) + 1}` });
    setCurrentConversation(id);
    setMobileMenuOpen(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;

    let convId = currentConversation;
    if (!convId) {
      convId = await createConversation({ title: inputValue.slice(0, 30) + "..." });
      setCurrentConversation(convId);
    }

    await sendMessage({
      conversationId: convId,
      content: inputValue,
      role: "user",
    });

    const prompt = inputValue;
    setInputValue("");
    setIsGenerating(true);

    try {
      await generateResponse({
        conversationId: convId,
        userMessage: prompt,
        preferredModel: settings?.preferredModel || "all",
        focusArea: settings?.focusArea || "all",
        creativityLevel: settings?.creativityLevel || 7,
        agentPersonality: settings?.agentPersonality || "balanced",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAgentColor = (source?: string) => {
    switch (source) {
      case "claude": return "var(--cyan)";
      case "grok": return "var(--magenta)";
      case "chatgpt": return "var(--green)";
      default: return "var(--cyan)";
    }
  };

  return (
    <div className="dashboard">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="hamburger" />
        </button>
        <div className="mobile-logo">
          <span className="logo-7">7</span>
          <span>AGENT</span>
        </div>
        <button className="mobile-settings-btn" onClick={() => setShowSettings(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-hex">
              <span>7</span>
            </div>
            <div className="logo-text-group">
              <span className="logo-name">AGENT 7</span>
              <span className="logo-version">v2.0.7</span>
            </div>
          </div>
          <button className="close-mobile-menu" onClick={() => setMobileMenuOpen(false)}>
            ×
          </button>
        </div>

        <button className="new-session-btn" onClick={handleNewSession}>
          <span className="btn-icon">+</span>
          <span>NEW SESSION</span>
        </button>

        <div className="sessions-list">
          <div className="sessions-header">
            <span>SESSIONS</span>
            <span className="session-count">{conversations?.length || 0}</span>
          </div>
          {conversations?.map((conv: Doc<"conversations">) => (
            <div
              key={conv._id}
              className={`session-item ${currentConversation === conv._id ? 'active' : ''}`}
              onClick={() => {
                setCurrentConversation(conv._id);
                setMobileMenuOpen(false);
              }}
            >
              <span className="session-indicator" />
              <span className="session-title">{conv.title}</span>
              <button
                className="session-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation({ id: conv._id });
                  if (currentConversation === conv._id) {
                    setCurrentConversation(null);
                  }
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-btn" onClick={() => {
            setShowSettings(true);
            setMobileMenuOpen(false);
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>SETTINGS</span>
          </button>
          <button className="sidebar-btn danger" onClick={() => signOut()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>DISCONNECT</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}

      {/* Main Content */}
      <main className="main-content">
        {!currentConversation && messages === undefined ? (
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-logo">
                <div className="hex-outline">
                  <span>7</span>
                </div>
              </div>
              <h1 className="welcome-title">
                <span className="glitch" data-text="AGENT 7">AGENT 7</span>
              </h1>
              <p className="welcome-subtitle">VIBE CODE SUGGESTION ENGINE</p>

              <div className="model-badges">
                <div className="model-badge claude">
                  <span className="badge-dot" />
                  <span>CLAUDE</span>
                </div>
                <div className="model-badge grok">
                  <span className="badge-dot" />
                  <span>GROK</span>
                </div>
                <div className="model-badge gpt">
                  <span className="badge-dot" />
                  <span>GPT</span>
                </div>
              </div>

              <div className="quick-prompts">
                <p className="prompts-label">QUICK TRANSMISSIONS</p>
                <div className="prompts-grid">
                  {[
                    "Suggest a unique game idea",
                    "What app should I build?",
                    "Give me a reasoning challenge",
                    "I want to vibe code something wild"
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      className="prompt-chip"
                      onClick={async () => {
                        setInputValue(prompt);
                        const id = await createConversation({ title: prompt.slice(0, 30) });
                        setCurrentConversation(id);
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="chat-container">
            <div className="messages-area">
              {messages?.map((msg: Doc<"messages">) => (
                <div
                  key={msg._id}
                  className={`message ${msg.role}`}
                  style={msg.role === "agent" ? { "--agent-color": getAgentColor(msg.agentSource) } as React.CSSProperties : undefined}
                >
                  {msg.role === "agent" && (
                    <div className="message-source">
                      <span className="source-dot" style={{ background: getAgentColor(msg.agentSource) }} />
                      <span className="source-name">{msg.agentSource?.toUpperCase()}</span>
                      {msg.suggestionType && (
                        <span className="source-type">[{msg.suggestionType.toUpperCase()}]</span>
                      )}
                    </div>
                  )}
                  <div className="message-content">
                    {msg.content.split('\n').map((line: string, i: number) => (
                      <p key={i}>{line || '\u00A0'}</p>
                    ))}
                  </div>
                  <div className="message-time">{formatTime(msg.createdAt)}</div>
                </div>
              ))}
              {isGenerating && (
                <div className="message agent generating">
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="generating-text">Agent processing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="input-area">
          <div className="input-wrapper">
            <div className="input-glow-effect" />
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your vibe code request..."
              className="chat-input"
              rows={1}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim() || isGenerating}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send · Shift+Enter for new line
          </div>
        </div>

        <footer className="main-footer">
          Requested by @web-user · Built by @clonkbot
        </footer>
      </main>

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
