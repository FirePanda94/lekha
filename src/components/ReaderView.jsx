import ChapterContent from "./ChapterContent";

function ReaderView({
  book,
  chapterIndex,
  setChapterIndex,
  tokenisedHtml,
  wordIndex,
  totalWords,
  fontSize,
  fontFamily,
  onWordClick,
  chapterFinished,
  isLastChapter,
  onNextChapter,
}) {
  const chapter = book.chapters[chapterIndex];
  const isFirst = chapterIndex === 0;
  const isLast = chapterIndex === book.chapters.length - 1;
  const progress =
    totalWords > 0 ? Math.round((wordIndex / totalWords) * 100) : 0;

  function prev() {
    if (!isFirst) setChapterIndex((i) => i - 1);
  }
  function next() {
    if (!isLast) setChapterIndex((i) => i + 1);
  }

  return (
    <div className="reader-container">
      {/* Sticky chapter header */}
      <div
        className="chapter-sticky-header"
        style={{
          position: "sticky",
          top: "57px",
          zIndex: 50,
          background: "var(--bg-page)",
          paddingTop: "20px",
          paddingBottom: "14px",
          marginBottom: "28px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontFamily: "Inter, sans-serif",
              color: "var(--text-secondary)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {book.title}
          </p>
          {totalWords > 0 && (
            <ReadingTimeEstimate
              wordIndex={wordIndex}
              totalWords={totalWords}
            />
          )}
        </div>

        <h1
          className="chapter-display-title"
          style={{
            fontFamily: "Lora, Georgia, serif",
            fontSize: "22px",
            fontWeight: "500",
            color: "var(--text-primary)",
            lineHeight: 1.3,
          }}
        >
          {chapter.label}
        </h1>

        {totalWords > 0 && (
          <div
            style={{
              marginTop: "12px",
              height: "2px",
              background: "var(--border)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "var(--accent)",
                borderRadius: "2px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        )}
      </div>

      <ChapterContent
        tokenisedHtml={tokenisedHtml}
        fontSize={fontSize}
        fontFamily={fontFamily}
        onWordClick={onWordClick}
      />

      {/* Chapter finished nudge */}
      {chapterFinished && (
        <div
          style={{
            margin: "48px 0 24px",
            padding: "24px 28px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "Lora, Georgia, serif",
                fontSize: "16px",
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}
            >
              {isLastChapter
                ? "You have reached the end of the book."
                : "End of chapter."}
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              {isLastChapter
                ? "Hope it was a great read."
                : `Up next: ${book.chapters[chapterIndex + 1]?.label}`}
            </p>
          </div>

          {!isLastChapter && (
            <button
              onClick={onNextChapter}
              style={{
                background: "var(--accent)",
                color: "#fff",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Next chapter →
            </button>
          )}
        </div>
      )}

      {/* Chapter navigation — hidden on mobile (bottom bar handles this) */}
      <div
        className="toolbar-mobile-hide"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "32px",
          paddingTop: "24px",
          borderTop: "1px solid var(--border)",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
        }}
      >
        <button
          onClick={prev}
          disabled={isFirst}
          style={{
            color: isFirst ? "var(--text-dim)" : "var(--accent)",
            cursor: isFirst ? "default" : "pointer",
            padding: "8px 0",
          }}
        >
          ← Previous
        </button>

        <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
          {chapterIndex + 1} / {book.chapters.length}
        </span>

        <button
          onClick={next}
          disabled={isLast}
          style={{
            color: isLast ? "var(--text-dim)" : "var(--accent)",
            cursor: isLast ? "default" : "pointer",
            padding: "8px 0",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function ReadingTimeEstimate({ wordIndex, totalWords }) {
  const settings = JSON.parse(localStorage.getItem("lekha-settings") || "{}");
  const wpm = settings.wpm || 250;
  const wordsLeft = Math.max(0, totalWords - wordIndex);
  const minsLeft = wordsLeft / wpm;

  let label;
  if (minsLeft < 1) label = "< 1 min left";
  else if (minsLeft < 60) label = `${Math.round(minsLeft)} min left`;
  else {
    const h = Math.floor(minsLeft / 60);
    const m = Math.round(minsLeft % 60);
    label = m > 0 ? `${h}h ${m}m left` : `${h}h left`;
  }

  return (
    <span
      style={{
        fontSize: "11px",
        fontFamily: "Inter, sans-serif",
        color: "var(--text-secondary)",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </span>
  );
}

export default ReaderView;
