import { useEffect, useRef } from "react";

function ChapterContent({ tokenisedHtml, fontSize, fontFamily, onWordClick }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && tokenisedHtml) {
      containerRef.current.innerHTML = tokenisedHtml;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [tokenisedHtml]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    function handleClick(e) {
      const span = e.target.closest("[data-word-index]");
      if (!span) return;
      const index = parseInt(span.getAttribute("data-word-index"), 10);
      if (!isNaN(index) && onWordClick) onWordClick(index);
    }
    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [onWordClick]);

  const family =
    fontFamily === "sans"
      ? "Inter, system-ui, sans-serif"
      : "Lora, Georgia, serif";

  return (
    <div
      ref={containerRef}
      className="chapter-content"
      style={{
        fontSize: `${fontSize}px`,
        fontFamily: family,
        cursor: "text",
      }}
    />
  );
}

export default ChapterContent;
