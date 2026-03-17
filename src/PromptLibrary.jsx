import { useState, useRef } from "react";
import { C } from "./theme";
import { CATEGORIES, PROMPTS } from "./prompts";

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

function generatePrompt(prompt, values) {
  let output = prompt.template;
  for (const v of prompt.variables) {
    const val = values[v.key] || v.placeholder || `[${v.label}]`;
    output = output.replaceAll(`{{${v.key}}}`, val);
  }
  if (prompt.postProcess) {
    output = prompt.postProcess(values, output);
  }
  return output;
}

function VariableInput({ variable, value, onChange, allValues }) {
  if (variable.condition) {
    const condVal = allValues[variable.condition.key];
    if (condVal !== variable.condition.value) return null;
  }

  const baseInput = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    border: `1px solid ${C.gray200}`,
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    color: C.gray800,
    background: C.white,
    outline: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{
        display: "block",
        fontSize: "12px",
        fontWeight: 600,
        color: C.gray600,
        marginBottom: "4px",
        textTransform: "uppercase",
        letterSpacing: "0.03em",
      }}>
        {variable.label}
      </label>
      {variable.type === "select" ? (
        <select
          value={value || ""}
          onChange={(e) => onChange(variable.key, e.target.value)}
          style={{ ...baseInput, cursor: "pointer" }}
        >
          <option value="">Select...</option>
          {variable.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(variable.key, e.target.value)}
          placeholder={variable.placeholder}
          style={baseInput}
          onFocus={(e) => e.target.style.borderColor = C.blue}
          onBlur={(e) => e.target.style.borderColor = C.gray200}
        />
      )}
    </div>
  );
}

export default function PromptLibrary() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [values, setValues] = useState({});
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const outputRef = useRef(null);

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleCopy = () => {
    if (!selectedPrompt) return;
    const output = generatePrompt(selectedPrompt, values);
    copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectPrompt = (p) => {
    setSelectedPrompt(p);
    setValues({});
    setCopied(false);
  };

  const handleBack = () => {
    setSelectedPrompt(null);
    setValues({});
    setCopied(false);
  };

  const filteredPrompts = PROMPTS.filter((p) => {
    const matchesCat = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filledCount = selectedPrompt
    ? selectedPrompt.variables.filter((v) => {
        if (v.condition) {
          const condVal = values[v.condition.key];
          if (condVal !== v.condition.value) return true;
        }
        return values[v.key] && values[v.key].length > 0;
      }).length
    : 0;

  const totalFields = selectedPrompt
    ? selectedPrompt.variables.filter((v) => {
        if (v.condition) {
          const condVal = values[v.condition.key];
          if (condVal !== v.condition.value) return false;
        }
        return true;
      }).length
    : 0;

  // Prompt detail view
  if (selectedPrompt) {
    const output = generatePrompt(selectedPrompt, values);
    return (
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        maxWidth: "900px",
        margin: "0 auto",
        padding: "24px 16px",
        color: C.gray800,
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

        {/* Back button */}
        <button
          onClick={handleBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "6px",
            border: `1px solid ${C.gray200}`,
            background: C.white,
            color: C.gray600,
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            marginBottom: "20px",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          &larr; Back to Library
        </button>

        {/* Title */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "24px" }}>
              {CATEGORIES.find((c) => c.id === selectedPrompt.category)?.icon}
            </span>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, color: C.steelDark }}>
              {selectedPrompt.title}
            </h1>
          </div>
          <p style={{ fontSize: "14px", color: C.gray500, margin: 0 }}>
            {selectedPrompt.description}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Left: Variables */}
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}>
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: C.steel, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Variables
              </h2>
              <span style={{
                fontSize: "12px",
                color: filledCount === totalFields ? C.green : C.gray400,
                fontWeight: 600,
              }}>
                {filledCount}/{totalFields} filled
              </span>
            </div>

            <div style={{
              background: C.white,
              border: `1px solid ${C.gray200}`,
              borderRadius: "10px",
              padding: "16px",
            }}>
              {selectedPrompt.variables.map((v) => (
                <VariableInput
                  key={v.key}
                  variable={v}
                  value={values[v.key]}
                  onChange={handleChange}
                  allValues={values}
                />
              ))}
            </div>
          </div>

          {/* Right: Preview + Copy */}
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}>
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: C.steel, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Preview
              </h2>
              <button
                onClick={handleCopy}
                style={{
                  padding: "6px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: copied ? C.green : C.gold,
                  color: copied ? C.white : C.steelDark,
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {copied ? "\u2713 Copied!" : "Copy Prompt"}
              </button>
            </div>

            <div
              ref={outputRef}
              style={{
                background: C.gray900,
                color: "#E4E4E7",
                borderRadius: "10px",
                padding: "16px",
                fontSize: "12px",
                fontFamily: "'DM Mono', monospace",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: "600px",
                overflowY: "auto",
              }}
            >
              {output}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Library view
  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      maxWidth: "900px",
      margin: "0 auto",
      padding: "24px 16px",
      color: C.gray800,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: C.steel,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.gold,
            fontWeight: 700,
            fontSize: "16px",
          }}>
            O
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, color: C.steelDark }}>
              Prompt Library
            </h1>
            <p style={{ fontSize: "13px", color: C.gray400, margin: 0 }}>
              OpGo Marketing &middot; {PROMPTS.length} templates
            </p>
          </div>
        </div>
        <p style={{ fontSize: "14px", color: C.gray500, margin: "12px 0 0 0", lineHeight: 1.6 }}>
          Select a template, fill in the variables, and copy the completed prompt. The template stays intact &mdash; you always work from a fresh copy.
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "8px",
            border: `1px solid ${C.gray200}`,
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            color: C.gray800,
            background: C.white,
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => e.target.style.borderColor = C.blue}
          onBlur={(e) => e.target.style.borderColor = C.gray200}
        />
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveCategory("all")}
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            border: `1px solid ${activeCategory === "all" ? C.steel : C.gray200}`,
            background: activeCategory === "all" ? C.steel : C.white,
            color: activeCategory === "all" ? C.white : C.gray600,
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.15s",
          }}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: `1px solid ${activeCategory === cat.id ? C.steel : C.gray200}`,
              background: activeCategory === cat.id ? C.steel : C.white,
              color: activeCategory === cat.id ? C.white : C.gray600,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Prompt cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {filteredPrompts.map((p) => {
          const cat = CATEGORIES.find((c) => c.id === p.category);
          return (
            <button
              key={p.id}
              onClick={() => handleSelectPrompt(p)}
              style={{
                textAlign: "left",
                padding: "18px",
                borderRadius: "10px",
                border: `1px solid ${C.gray200}`,
                background: C.white,
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.gold;
                e.currentTarget.style.boxShadow = `0 2px 8px rgba(212,164,58,0.12)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.gray200;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "20px" }}>{cat?.icon}</span>
                <h3 style={{ fontSize: "15px", fontWeight: 600, margin: 0, color: C.steelDark }}>
                  {p.title}
                </h3>
              </div>
              <p style={{ fontSize: "13px", color: C.gray500, margin: 0, lineHeight: 1.5 }}>
                {p.description}
              </p>
              <div style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: C.gray400,
                  background: C.gray100,
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}>
                  {p.variables.filter(v => !v.condition).length} variables
                </span>
                <span style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: C.blue,
                  background: C.blueLight,
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}>
                  {cat?.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredPrompts.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          color: C.gray400,
          fontSize: "14px",
        }}>
          No templates match your search. Try a different term or clear the filter.
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: "32px",
        paddingTop: "16px",
        borderTop: `1px solid ${C.gray100}`,
        fontSize: "12px",
        color: C.gray400,
        textAlign: "center",
      }}>
        OpGo Marketing Prompt Library &middot; <a href="https://github.com/druemclean/ai-prompt-library" style={{ color: C.blue, textDecoration: "none" }}>GitHub</a>
      </div>
    </div>
  );
}
