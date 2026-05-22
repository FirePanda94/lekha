import React, { useState, useEffect, useRef } from "react";

function RSVPView({
  words,
  wordIndex,
  totalWords,
  isPlaying,
  onPlayPause,
  wpm,
  setWpm,
  chapterTitle,
  chapterIndex,
  onClose,
  onSeek,
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentWord = words[wordIndex] || "";
  const p2 = wordIndex > 1 ? words[wordIndex - 2] : "";
  const p1 = wordIndex > 0 ? words[wordIndex - 1] : "";
  const n1 = wordIndex < totalWords - 1 ? words[wordIndex + 1] : "";
  const n2 = wordIndex < totalWords - 2 ? words[wordIndex + 2] : "";

  function splitWord(word) {
    if (!word) return { prefix: "", focus: "", suffix: "" };
    const length = word.length;
    let orp = 0;
    if (length < 2) orp = 0;
    else if (length < 6) orp = 1;
    else if (length < 10) orp = 2;
    else if (length < 14) orp = 3;
    else orp = 4;

    return {
      prefix: word.substring(0, orp),
      focus: word.substring(orp, orp + 1),
      suffix: word.substring(orp + 1),
    };
  }

  const { prefix, focus, suffix } = splitWord(currentWord);
  const progress = totalWords > 0 ? (wordIndex / totalWords) * 100 : 0;

  // Time remaining calculation (updates instantly with wpm)
  const wordsLeft = Math.max(0, totalWords - wordIndex);
  const minsLeft = wordsLeft / wpm;
  let timeLabel = "";
  if (minsLeft < 1) timeLabel = "< 1 min left";
  else if (minsLeft < 60) timeLabel = `${Math.round(minsLeft)} min left`;
  else {
    const h = Math.floor(minsLeft / 60);
    const m = Math.round(minsLeft % 60);
    timeLabel = m > 0 ? `${h}h ${m}m left` : `${h}h left`;
  }

  return (
    <div className="rsvp-container view-fade-in">
      {/* Header */}
      <div
        className="rsvp-header"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: isMobile ? "12px 16px" : "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          zIndex: 250,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "1px" : "0",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            RSVP
          </span>
          {isMobile ? (
            <>
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginTop: "2px",
                }}
              >
                {chapterTitle}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  fontWeight: "500",
                }}
              >
                {Math.round(progress)}% · {timeLabel}
              </span>
            </>
          ) : (
            <span
              style={{
                fontSize: "14px",
                color: "var(--text-primary)",
                fontWeight: "500",
                maxWidth: "300px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {chapterTitle}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            fontSize: "12px",
            color: "var(--text-primary)",
            fontWeight: "500",
          }}
        >
          {isMobile ? "Exit" : "Exit Mode"}
        </button>
      </div>

      {/* Main Word Display - Vertically Centered */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          paddingBottom: isMobile ? "120px" : "80px", // Account for bottom bar
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? "8px" : "12px",
            fontFamily: "Inter, sans-serif",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: isMobile ? "8px" : "12px",
              fontSize: isMobile ? "0.95rem" : "1.2rem",
              opacity: 0.3,
              color: "var(--rsvp-word-color)",
              justifyContent: "flex-end",
              flex: 1,
            }}
          >
            <span>{p2}</span>
            <span>{p1}</span>
          </div>

          <div
            style={{
              fontSize: isMobile ? "2.2rem" : "2.5rem",
              fontWeight: "500",
              color: "var(--rsvp-word-color)",
              display: "flex",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <span style={{ textAlign: "right" }}>{prefix}</span>
            <span style={{ color: "#FF3B30" }}>{focus}</span>
            <span style={{ textAlign: "left" }}>{suffix}</span>
          </div>

          <div
            style={{
              display: "flex",
              gap: isMobile ? "8px" : "12px",
              fontSize: isMobile ? "0.95rem" : "1.2rem",
              opacity: 0.3,
              color: "var(--rsvp-word-color)",
              justifyContent: "flex-start",
              flex: 1,
            }}
          >
            <span>{n1}</span>
            <span>{n2}</span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Control Bar */}
      <div
        className="rsvp-controls-bar"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
          zIndex: 300,
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        {/* Full-width Progress Bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "var(--border)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--accent)",
              transition: "width 0.2s linear",
            }}
          />
        </div>

        {isMobile ? (
          /* Mobile Controls Layout (Chapter Info moved to header) */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "16px 16px 8px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "-4px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "var(--accent)",
                  letterSpacing: "0.05em",
                }}
              >
                {wpm} WPM
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <button
                onClick={() => setWpm((w) => Math.max(60, w - 10))}
                className="rsvp-nav-btn mobile-btn"
              >
                −10
              </button>
              <button
                onClick={() => onSeek(Math.max(0, wordIndex - 10))}
                className="rsvp-nav-btn mobile-btn"
              >
                ⟲ 10
              </button>
              <button
                onClick={onPlayPause}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "24px",
                  background: "var(--accent)",
                  color: "var(--highlight-text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                {isPlaying ? "Ⅱ" : "▶"}
              </button>
              <button
                onClick={() => onSeek(Math.min(totalWords - 1, wordIndex + 10))}
                className="rsvp-nav-btn mobile-btn"
              >
                10 ⟳
              </button>
              <button
                onClick={() => setWpm((w) => Math.min(1000, w + 10))}
                className="rsvp-nav-btn mobile-btn"
              >
                +10
              </button>
            </div>
          </div>
        ) : (
          /* Tablet/Desktop Single Row Layout */
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px 8px",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  fontWeight: "500",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {chapterTitle}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                }}
              >
                {Math.round(progress)}% · {timeLabel}
              </span>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "24px",
              }}
            >
              <button
                onClick={() => onSeek(Math.max(0, wordIndex - 10))}
                className="rsvp-nav-btn"
                title="Skip back 10 words"
              >
                ⟲ 10
              </button>
              <button
                onClick={onPlayPause}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "24px",
                  background: "var(--accent)",
                  color: "var(--highlight-text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                {isPlaying ? "Ⅱ" : "▶"}
              </button>
              <button
                onClick={() => onSeek(Math.min(totalWords - 1, wordIndex + 10))}
                className="rsvp-nav-btn"
                title="Skip forward 10 words"
              >
                10 ⟳
              </button>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setWpm((w) => Math.max(60, w - 10))}
                className="rsvp-nav-btn"
              >
                −10
              </button>
              <div style={{ textAlign: "center", minWidth: "80px" }}>
                <div
                  style={{ fontSize: "11px", color: "var(--text-secondary)" }}
                >
                  SPEED
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                  }}
                >
                  {wpm}
                </div>
              </div>
              <button
                onClick={() => setWpm((w) => Math.min(1000, w + 10))}
                className="rsvp-nav-btn"
              >
                +10
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .rsvp-nav-btn {
          padding: 8px 12px;
          border-radius: 6px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          text-align: center;
        }
        .rsvp-nav-btn.mobile-btn {
          min-width: 44px;
          min-height: 44px;
          padding: 0;
          flex: 1;
          font-size: 12px;
        }
        .rsvp-nav-btn:hover {
          background: var(--accent-light);
          color: var(--accent);
          border-color: var(--accent);
        }
      `}</style>
    </div>
  );
}

export default RSVPView;
