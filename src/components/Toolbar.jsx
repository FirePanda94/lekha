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
}) {
  const [menuOpen, setMenuOpen] = useState(false);

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
        borderBottom: "1px solid var(--border)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      {/* App name */}
      <span
        style={{
          fontFamily: "Lora, Georgia, serif",
          fontWeight: "500",
          fontSize: "18px",
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          marginRight: "auto",
        }}
      >
        Lekha
      </span>

      {/* Back to library — hidden on mobile */}
      {hasBook && (
        <button
          className="toolbar-mobile-hide"
          onClick={onBackToLibrary}
          style={{ ...iconBtnStyle, color: "var(--text-secondary)" }}
          title="Back to library"
        >
          ← Library
        </button>
      )}

      {hasBook && divider}

      {/* Font family toggle — hidden on mobile */}
      {hasBook && (
        <button
          className="toolbar-mobile-hide"
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
      )}

      {/* Font size — visible on all screens */}
      {hasBook && (
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
        <button
          className="toolbar-mobile-hide"
          onClick={onPlayPause}
          style={{
            background: isPlaying ? "var(--text-secondary)" : "var(--accent)",
            color: "#fff",
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
                          ? "var(--accent)"
                          : "var(--text-primary)",
                      background:
                        i === chapterIndex
                          ? "var(--accent-light)"
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
        {["light", "dark", "sepia"].map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            title={t}
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              border:
                theme === t
                  ? "2px solid var(--accent)"
                  : "2px solid var(--border)",
              background:
                t === "light"
                  ? "#ffffff"
                  : t === "dark"
                    ? "#1a1a1a"
                    : "#f2e8d5",
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
