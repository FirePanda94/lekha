import { useState } from "react";

function Toolbar({
  theme,
  setTheme,
  wpm,
  setWpm,
  isPlaying,
  onPlayPause,
  hasBook,
  chapters,
  chapterIndex,
  onChapterSelect,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onBackToLibrary,
  fontFamily,
  onToggleFontFamily,
  readingMode,
  setReadingMode,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const iconBtnStyle = {
    height: "30px",
    borderRadius: "6px",
    border: "1px solid var(--border)",
    background: "var(--bg-surface)",
    color: "var(--text-primary)",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, sans-serif",
    padding: "0 10px",
    lineHeight: 1,
  };

  const divider = (
    <div
      className="toolbar-mobile-hide"
      style={{
        width: "1px",
        height: "20px",
        background: "var(--border)",
        flexShrink: 0,
      }}
    />
  );

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--bg-toolbar)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      {/* App name / Home link */}
      <span
        onClick={onBackToLibrary}
        className="brand-logo"
        style={{
          fontFamily: "Lora, Georgia, serif",
          fontWeight: "600",
          fontSize: "19px",
          color: "var(--text-primary)",
          letterSpacing: "-0.015em",
          marginRight: "auto",
          cursor: "pointer",
          transition: "opacity 0.2s",
          padding: "4px 0",
        }}
      >
        Lekha
      </span>

      {hasBook && divider}

      {/* Settings & Font Controls */}
      {hasBook && (
        <>
          {/* Desktop/Tablet: Direct font controls */}
          <div
            className="toolbar-mobile-hide"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <button
              onClick={onToggleFontFamily}
              title={
                fontFamily === "serif" ? "Switch to sans-serif" : "Switch to serif"
              }
              style={{
                ...iconBtnStyle,
                fontFamily:
                  fontFamily === "serif"
                    ? "Lora, Georgia, serif"
                    : "Inter, sans-serif",
              }}
            >
              {fontFamily === "serif" ? "Serif" : "Sans"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                style={{ ...iconBtnStyle, fontSize: "13px" }}
                onClick={onDecreaseFontSize}
                title="Decrease font size"
              >
                A−
              </button>
              <button
                style={{ ...iconBtnStyle, fontSize: "15px" }}
                onClick={onIncreaseFontSize}
                title="Increase font size"
              >
                A+
              </button>
            </div>
          </div>

          {/* Mobile: Consolidated Settings */}
          <div className="toolbar-mobile-only" style={{ position: "relative" }}>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              style={{
                ...iconBtnStyle,
                color: settingsOpen ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              ⚙️
            </button>
            {settingsOpen && (
              <>
                <div
                  onClick={() => setSettingsOpen(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 199 }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: "-10px",
                    width: "200px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    zIndex: 200,
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Typeface</div>
                  <button
                    onClick={() => { onToggleFontFamily(); setSettingsOpen(false); }}
                    style={{ ...iconBtnStyle, width: "100%", justifyContent: "center", padding: "8px 12px", height: "auto" }}
                  >
                    {fontFamily === "serif" ? "Switch to Sans" : "Switch to Serif"}
                  </button>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Font Size</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={{ ...iconBtnStyle, flex: 1, height: "36px" }} onClick={onDecreaseFontSize}>A−</button>
                    <button style={{ ...iconBtnStyle, flex: 1, height: "36px" }} onClick={onIncreaseFontSize}>A+</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {hasBook && divider}

      {/* WPM — hidden on mobile (lives in bottom bar) */}
      {hasBook && (
        <div
          className="toolbar-mobile-hide"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <button
            style={iconBtnStyle}
            onClick={() => setWpm((w) => Math.max(60, w - 10))}
          >
            −
          </button>
          <span
            style={{
              minWidth: "68px",
              textAlign: "center",
              fontVariantNumeric: "tabular-nums",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {wpm} WPM
          </span>
          <button
            style={iconBtnStyle}
            onClick={() => setWpm((w) => Math.min(600, w + 10))}
          >
            +
          </button>
        </div>
      )}

      {hasBook && divider}

      {/* Play/Pause — hidden on mobile (lives in bottom bar) */}
      {hasBook && (
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            className="toolbar-mobile-hide"
            onClick={onPlayPause}
            style={{
              background: isPlaying ? "var(--text-secondary)" : "var(--accent)",
              color: isPlaying ? "#fff" : "var(--highlight-text)",
              borderRadius: "6px",
              padding: "6px 18px",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
              height: "30px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.2s",
            }}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={() => setReadingMode(readingMode === "rsvp" ? "flow" : "rsvp")}
            style={{
              ...iconBtnStyle,
              background: readingMode === "rsvp" ? "var(--accent-light)" : "var(--bg-surface)",
              color: readingMode === "rsvp" ? "var(--accent)" : "var(--text-secondary)",
              borderColor: readingMode === "rsvp" ? "var(--accent)" : "var(--border)",
              fontWeight: readingMode === "rsvp" ? "600" : "400",
            }}
            title="Toggle RSVP Mode"
          >
            ⚡ RSVP
          </button>
        </div>
      )}

      {hasBook && divider}

      {/* Chapters dropdown — visible on all screens */}
      {hasBook && (
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{ ...iconBtnStyle, color: "var(--text-secondary)" }}
          >
            ☰ Chapters
          </button>

          {menuOpen && (
            <>
              <div
                onClick={() => setMenuOpen(false)}
                style={{ position: "fixed", inset: 0, zIndex: 199 }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "280px",
                  maxHeight: "60vh",
                  overflowY: "auto",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  zIndex: 200,
                  padding: "6px",
                }}
              >
                {chapters.map((ch, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onChapterSelect(i);
                      setMenuOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontFamily: "Inter, sans-serif",
                      color:
                        i === chapterIndex
                          ? "var(--highlight-text)"
                          : "var(--text-primary)",
                      background:
                        i === chapterIndex
                          ? "var(--accent)"
                          : "transparent",
                      cursor: "pointer",
                      lineHeight: 1.4,
                    }}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Theme switcher — always visible */}
      <div style={{ display: "flex", gap: "6px" }}>
        {[
          { id: "light", color: "#ffffff" },
          { id: "nord", color: "#2e3440" },
          { id: "oled", color: "#000000" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.id}
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              border:
                theme === t.id
                  ? "2px solid var(--accent)"
                  : "2px solid var(--border)",
              background: t.color,
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default Toolbar;
