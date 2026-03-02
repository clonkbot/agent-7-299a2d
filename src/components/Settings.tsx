import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const settings = useQuery(api.settings.get);
  const saveSettings = useMutation(api.settings.save);

  const [personality, setPersonality] = useState("balanced");
  const [model, setModel] = useState("all");
  const [focus, setFocus] = useState("all");
  const [creativity, setCreativity] = useState(7);
  const [responseStyle, setResponseStyle] = useState("detailed");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setPersonality(settings.agentPersonality || "balanced");
      setModel(settings.preferredModel || "all");
      setFocus(settings.focusArea || "all");
      setCreativity(settings.creativityLevel || 7);
      setResponseStyle(settings.responseStyle || "detailed");
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings({
        agentPersonality: personality,
        preferredModel: model,
        focusArea: focus,
        creativityLevel: creativity,
        responseStyle: responseStyle,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span className="header-icon">⚙</span>
            AGENT CONFIGURATION
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="settings-group">
            <label className="settings-label">
              <span className="label-icon">◇</span>
              AGENT PERSONALITY
            </label>
            <div className="radio-group">
              {[
                { value: "creative", label: "CREATIVE", desc: "Wild and experimental" },
                { value: "technical", label: "TECHNICAL", desc: "Implementation focused" },
                { value: "balanced", label: "BALANCED", desc: "Best of both worlds" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`radio-card ${personality === option.value ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="personality"
                    value={option.value}
                    checked={personality === option.value}
                    onChange={(e) => setPersonality(e.target.value)}
                  />
                  <span className="radio-indicator" />
                  <div className="radio-content">
                    <span className="radio-label">{option.label}</span>
                    <span className="radio-desc">{option.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">
              <span className="label-icon">◇</span>
              PREFERRED MODEL
            </label>
            <div className="select-wrapper">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="cyber-select"
              >
                <option value="all">ALL MODELS</option>
                <option value="claude">CLAUDE</option>
                <option value="grok">GROK</option>
                <option value="chatgpt">CHATGPT</option>
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">
              <span className="label-icon">◇</span>
              FOCUS AREA
            </label>
            <div className="chip-group">
              {[
                { value: "all", label: "ALL", icon: "◈" },
                { value: "games", label: "GAMES", icon: "◆" },
                { value: "apps", label: "APPS", icon: "◇" },
                { value: "reasoning", label: "REASONING", icon: "◊" },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`chip ${focus === option.value ? 'active' : ''}`}
                  onClick={() => setFocus(option.value)}
                >
                  <span className="chip-icon">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">
              <span className="label-icon">◇</span>
              CREATIVITY LEVEL
              <span className="creativity-value">{creativity}/10</span>
            </label>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={creativity}
                onChange={(e) => setCreativity(parseInt(e.target.value))}
                className="cyber-slider"
              />
              <div className="slider-labels">
                <span>GROUNDED</span>
                <span>EXPERIMENTAL</span>
              </div>
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">
              <span className="label-icon">◇</span>
              RESPONSE STYLE
            </label>
            <div className="select-wrapper">
              <select
                value={responseStyle}
                onChange={(e) => setResponseStyle(e.target.value)}
                className="cyber-select"
              >
                <option value="detailed">DETAILED</option>
                <option value="concise">CONCISE</option>
                <option value="bullet">BULLET POINTS</option>
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cyber-button secondary" onClick={onClose}>
            <span className="button-text">CANCEL</span>
          </button>
          <button
            className="cyber-button primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            <span className="button-bg" />
            <span className="button-text">
              {isSaving ? "SAVING..." : "SAVE CONFIG"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
