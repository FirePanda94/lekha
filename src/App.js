import { useState, useEffect } from "react";
import { useBook } from "./hooks/useBook";
import { useReader } from "./hooks/useReader";
import { useSpeedReader } from "./hooks/useSpeedReader";
import Toolbar from "./components/Toolbar";
import LibraryView from "./components/LibraryView";
import ReaderView from "./components/ReaderView";
import MobileBottomBar from "./components/MobileBottomBar";

function App() {
  const book = useBook();
  const reader = useReader();

  const [isPlaying, setIsPlaying] = useState(false);
  const [chapterFinished, setChapterFinished] = useState(false);

  const currentChapter = book.bookData
    ? book.bookData.chapters[book.chapterIndex]
    : null;

  const { tokenisedHtml, wordIndex, totalWords, actualWpm, reset, seek } =
    useSpeedReader(
      currentChapter,
      reader.wpm,
      isPlaying,
      () => {
        setIsPlaying(false);
        setChapterFinished(true);
      },
      reader.flowMode,
    );

  useEffect(() => {
    if (!tokenisedHtml || !book.restoredProgress) return;
    const { wordIndex: savedWord } = book.restoredProgress;
    if (savedWord > 0) {
      setTimeout(() => {
        seek(savedWord);
        book.clearRestoredProgress();
      }, 150);
    } else {
      book.clearRestoredProgress();
    }
  }, [tokenisedHtml, book.restoredProgress]);

  useEffect(() => {
    if (book.bookId) {
      book.persistProgress(book.chapterIndex, wordIndex);
    }
  }, [book.chapterIndex, wordIndex]);

  useEffect(() => {
    setIsPlaying(false);
    setChapterFinished(false);
    reset();
  }, [book.chapterIndex]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", reader.theme);
  }, [reader.theme]);

  function handleWordClick(index) {
    seek(index);
    setIsPlaying(true);
    setChapterFinished(false);
  }

  function handleNextChapter() {
    if (book.chapterIndex < book.bookData.chapters.length - 1) {
      book.setChapterIndex((i) => i + 1);
    }
    setChapterFinished(false);
  }

  useEffect(() => {
    function onKey(e) {
      if (!book.bookData) return;
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        setIsPlaying((p) => !p);
        if (chapterFinished) setChapterFinished(false);
      }
      if (e.code === "ArrowLeft" && book.chapterIndex > 0) {
        book.setChapterIndex((i) => i - 1);
      }
      if (e.code === "ArrowRight" &&
        book.chapterIndex < book.bookData.chapters.length - 1
      ) {
        book.setChapterIndex((i) => i + 1);
      }
      if (e.code === "Equal" || e.code === "NumpadAdd") {
        reader.setWpm((w) => Math.min(600, w + 10));
      }
      if (e.code === "Minus" || e.code === "NumpadSubtract") {
        reader.setWpm((w) => Math.max(60, w - 10));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [book.bookData, book.chapterIndex, chapterFinished]);

  function handleBackToLibrary() {
    setIsPlaying(false);
    setChapterFinished(false);
    reset();
    book.resetBook();
  }

  const isLastChapter = book.bookData
    ? book.chapterIndex === book.bookData.chapters.length - 1
    : false;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Toolbar
        theme={reader.theme}
        setTheme={reader.setTheme}
        wpm={reader.wpm}
        setWpm={reader.setWpm}
        isPlaying={isPlaying}
        onPlayPause={() => {
          setIsPlaying((p) => !p);
          if (chapterFinished) setChapterFinished(false);
        }}
        hasBook={!!book.bookData}
        chapters={book.bookData?.chapters || []}
        chapterIndex={book.chapterIndex}
        onChapterSelect={book.setChapterIndex}
        fontSize={reader.fontSize}
        onIncreaseFontSize={reader.increaseFontSize}
        onDecreaseFontSize={reader.decreaseFontSize}
        fontFamily={reader.fontFamily}
        onToggleFontFamily={() =>
          reader.setFontFamily((f) => (f === "serif" ? "sans" : "serif"))
        }
        onBackToLibrary={handleBackToLibrary}
      />

      {/* Mobile bottom bar */}
      <MobileBottomBar
        hasBook={!!book.bookData}
        isPlaying={isPlaying}
        onPlayPause={() => {
          setIsPlaying((p) => !p);
          if (chapterFinished) setChapterFinished(false);
        }}
        wpm={reader.wpm}
        setWpm={reader.setWpm}
        actualWpm={actualWpm}
        chapterIndex={book.chapterIndex}
        setChapterIndex={book.setChapterIndex}
        totalChapters={book.bookData?.chapters.length || 0}
      />

      {book.loading && (
        <div
          style={{
            padding: "80px 24px",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "var(--text-secondary)",
            fontSize: "15px",
          }}
        >
          Parsing EPUB…
        </div>
      )}

      {!book.bookFile && !book.loading && (
        <div className="view-fade-in">
          <LibraryView onBookSelect={book.handleBookSelect} />
        </div>
      )}

      {book.bookData && !book.loading && (
        <div className={`view-fade-in ${reader.focusMode ? "dim-others" : ""}`}>
          <ReaderView
            book={book.bookData}
            chapterIndex={book.chapterIndex}
            setChapterIndex={book.setChapterIndex}
            tokenisedHtml={tokenisedHtml}
            wordIndex={wordIndex}
            totalWords={totalWords}
            actualWpm={actualWpm}
            fontSize={reader.fontSize}
            fontFamily={reader.fontFamily}
            onWordClick={handleWordClick}
            chapterFinished={chapterFinished}
            isLastChapter={isLastChapter}
            onNextChapter={handleNextChapter}
          />
        </div>
      )}
    </div>
  );
}

export default App;
