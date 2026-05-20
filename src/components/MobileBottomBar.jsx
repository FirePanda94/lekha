function MobileBottomBar({
  isPlaying,
  onPlayPause,
  wpm,
  setWpm,
  actualWpm,
  chapterIndex,
  setChapterIndex,
  totalChapters,
  hasBook,
}) {
  if (!hasBook) return null;

  const isFirst = chapterIndex === 0;
  const isLast = chapterIndex === totalChapters - 1;

  function decrease() {
    setWpm((w) => Math.max(60, w - 10));
  }
  function increase() {
    setWpm((w) => Math.min(600, w + 10));
  }

  const navBtn = (disabled) => ({
    background: "transparent",
    border: "0.5px solid var(--border)",
    color: disabled ? "var(--text-dim)" : "var(--accent)",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "13px",
    fontFamily: "Inter, sans-serif",
    cursor: disabled ? "default" : "pointer",
  });

  const wpmBtn = {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    border: "0.5px solid var(--border)",
    background: "var(--bg-surface)",
    color: "var(--text-primary)",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div className="mobile-bottom-bar">
      <button
        style={navBtn(isFirst)}
        onClick={() => !isFirst && setChapterIndex((i) => i - 1)}
        disabled={isFirst}
      >
        ← Prev
      </button>

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button style={wpmBtn} onClick={decrease}>
            −
          </button>
          <span
            style={{
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
              color: "var(--text-primary)",
              minWidth: "60px",
              textAlign: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {wpm} WPM
          </span>
          <button style={wpmBtn} onClick={increase}>
            +
          </button>
        </div>
        {actualWpm > 0 && isPlaying && (
          <div
            style={{
              position: "absolute",
              top: "-18px",
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: "9px",
              color: "var(--accent)",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {actualWpm} effective
          </div>
        )}
      </div>

      <button
        onClick={onPlayPause}
        style={{
          background: isPlaying ? "var(--text-secondary)" : "var(--accent)",
          color: isPlaying ? "#fff" : "var(--highlight-text)",
          border: "none",
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "13px",
          fontFamily: "Inter, sans-serif",
          fontWeight: "500",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        {isPlaying ? "⏸ Pause" : "▶ Play"}
      </button>

      <button
        style={navBtn(isLast)}
        onClick={() => !isLast && setChapterIndex((i) => i + 1)}
        disabled={isLast}
      >
        Next →
      </button>
    </div>
  );
}

export default MobileBottomBar;
