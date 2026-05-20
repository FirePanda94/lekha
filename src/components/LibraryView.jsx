import { useState, useEffect } from "react";
import {
  loadAllBooks,
  loadBook,
  saveBook,
  deleteBook,
  deleteProgress,
  loadProgress,
} from "../utils/storage";
import { parseEpub } from "../utils/parseEpub";

function formatTime(mins) {
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${Math.round(mins)} min`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getWpm() {
  try {
    const s = JSON.parse(localStorage.getItem("lekha-settings") || "{}");
    return s.wpm || 250;
  } catch {
    return 250;
  }
}

function LibraryView({ onBookSelect }) {
  const [savedBooks, setSavedBooks] = useState([]);
  const [progresses, setProgresses] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [addingBook, setAddingBook] = useState(false);
  const [wpm] = useState(getWpm);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const books = await loadAllBooks();
      books.sort((a, b) => b.savedAt - a.savedAt);
      setSavedBooks(books);

      const prog = {};
      await Promise.all(
        books.map(async (b) => {
          const p = await loadProgress(b.id);
          if (p) prog[b.id] = p;
        }),
      );
      setProgresses(prog);
    } catch (err) {
      console.warn("Could not load library:", err);
    }
  }

  // Add book to library without opening it
  async function handleNewFile(file) {
    if (!file || !file.name.endsWith(".epub")) return;
    setAddingBook(true);
    try {
      const data = await parseEpub(file);
      const id = file.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      await saveBook(id, file, {
        title: data.title,
        creator: data.creator,
        wordCount: data.wordCount,
        chapterCount: data.chapters.length,
      });
      await fetchBooks();
    } catch (err) {
      console.warn("Could not add book:", err);
      alert("Could not read this EPUB file. Try another one.");
    }
    setAddingBook(false);
  }

  function handleFilePick(e) {
    const file = e.target.files[0];
    handleNewFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleNewFile(e.dataTransfer.files[0]);
  }

  // Open book into the reader
  async function handleOpen(bookEntry) {
    setLoadingId(bookEntry.id);
    try {
      const full = await loadBook(bookEntry.id);
      if (full?.file) onBookSelect(full.file);
    } catch (err) {
      console.warn("Could not open book:", err);
    }
    setLoadingId(null);
  }

  async function handleDelete(id) {
    await deleteBook(id);
    await deleteProgress(id);
    setConfirmDelete(null);
    fetchBooks();
  }

  function formatDate(ts) {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div
      style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 80px" }}
    >
      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: "2px dashed var(--border)",
          borderRadius: "16px",
          padding: "40px",
          textAlign: "center",
          marginBottom: "48px",
          transition: "border-color 0.2s, background 0.2s",
          opacity: addingBook ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (addingBook) return;
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.background = "var(--accent-light)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>📖</div>
        <p
          style={{
            fontFamily: "Lora, Georgia, serif",
            fontSize: "18px",
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          {addingBook ? "Adding to library…" : "Add a new book"}
        </p>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "20px",
          }}
        >
          Drop an EPUB here or click to browse
        </p>
        {!addingBook && (
          <label
            style={{
              display: "inline-block",
              background: "var(--accent)",
              color: "#fff",
              padding: "8px 24px",
              borderRadius: "8px",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
            }}
          >
            Browse file
            <input
              type="file"
              accept=".epub"
              onChange={handleFilePick}
              style={{ display: "none" }}
            />
          </label>
        )}
      </div>

      {/* Saved books */}
      {savedBooks.length > 0 && (
        <>
          <h2
            style={{
              fontFamily: "Lora, Georgia, serif",
              fontSize: "18px",
              fontWeight: "500",
              color: "var(--text-primary)",
              marginBottom: "20px",
            }}
          >
            Your library
          </h2>

          <div className="library-grid">
            {savedBooks.map((book) => {
              const prog = progresses[book.id];
              const isLoading = loadingId === book.id;
              const wc = book.wordCount || 0;
              const chapterCount = book.chapterCount || 1;
              const totalMins = wc > 0 ? wc / wpm : null;
              const hasStarted = !!prog;

              // Progress calculation using saved chapter index vs total chapters
              const progressPct = hasStarted
                ? Math.min(
                    100,
                    Math.round((prog.chapterIndex / chapterCount) * 100),
                  )
                : 0;

              const wordsRead =
                wc > 0
                  ? Math.round(((prog?.chapterIndex || 0) / chapterCount) * wc)
                  : 0;
              const wordsLeft = Math.max(0, wc - wordsRead);
              const minsLeft = wc > 0 ? wordsLeft / wpm : null;

              return (
                <div
                  key={book.id}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    position: "relative",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = "none")
                  }
                >
                  {/* Spine bar */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "4px",
                      height: "100%",
                      borderRadius: "12px 0 0 12px",
                      background: "var(--accent)",
                      opacity: 0.5,
                    }}
                  />

                  {/* Title + author */}
                  <div style={{ paddingLeft: "8px" }}>
                    <p
                      style={{
                        fontFamily: "Lora, Georgia, serif",
                        fontSize: "15px",
                        fontWeight: "500",
                        color: "var(--text-primary)",
                        lineHeight: 1.3,
                        marginBottom: "4px",
                      }}
                    >
                      {book.title}
                    </p>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {book.creator}
                    </p>
                  </div>

                  {/* WPM badge */}
                  <div style={{ paddingLeft: "8px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: "11px",
                        background: "var(--accent-light)",
                        color: "var(--accent)",
                        border: "0.5px solid var(--border)",
                        borderRadius: "20px",
                        padding: "2px 8px",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      at {wpm} WPM
                    </span>
                  </div>

                  {/* Stats tiles */}
                  {totalMins !== null && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "8px",
                        paddingLeft: "8px",
                      }}
                    >
                      <StatTile
                        value={formatTime(totalMins)}
                        label="Est. total"
                      />
                      <StatTile value={chapterCount} label="Chapters" />
                      <StatTile
                        value={
                          hasStarted
                            ? formatTime(minsLeft)
                            : formatTime(totalMins)
                        }
                        label="Time left"
                        highlight={hasStarted}
                      />
                    </div>
                  )}

                  {/* Progress */}
                  <div style={{ paddingLeft: "8px" }}>
                    {hasStarted ? (
                      <>
                        <div
                          style={{
                            height: "2px",
                            background: "var(--border)",
                            borderRadius: "2px",
                            overflow: "hidden",
                            marginBottom: "4px",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${progressPct}%`,
                              background: "var(--accent)",
                              borderRadius: "2px",
                            }}
                          />
                        </div>
                        <p
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {progressPct}% complete · Last read{" "}
                          {formatDate(prog.updatedAt)}
                        </p>
                      </>
                    ) : (
                      <p
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "11px",
                          color: "var(--text-dim)",
                          fontStyle: "italic",
                        }}
                      >
                        Not started yet
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    style={{ display: "flex", gap: "8px", paddingLeft: "8px" }}
                  >
                    <button
                      onClick={() => handleOpen(book)}
                      disabled={isLoading}
                      style={{
                        flex: 1,
                        background: "var(--accent)",
                        color: "#fff",
                        borderRadius: "6px",
                        padding: "7px 0",
                        fontSize: "13px",
                        fontFamily: "Inter, sans-serif",
                        opacity: isLoading ? 0.6 : 1,
                        transition: "opacity 0.15s",
                      }}
                    >
                      {isLoading
                        ? "Opening…"
                        : hasStarted
                          ? "Continue"
                          : "Start reading"}
                    </button>

                    {confirmDelete === book.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(book.id)}
                          style={{
                            background: "#dc2626",
                            color: "#fff",
                            borderRadius: "6px",
                            padding: "7px 10px",
                            fontSize: "12px",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          style={{
                            background: "var(--bg-page)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                            borderRadius: "6px",
                            padding: "7px 10px",
                            fontSize: "12px",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(book.id)}
                        style={{
                          background: "var(--bg-page)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                          borderRadius: "6px",
                          padding: "7px 10px",
                          fontSize: "13px",
                          fontFamily: "Inter, sans-serif",
                        }}
                        title="Delete book"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {savedBooks.length === 0 && !addingBook && (
        <p
          style={{
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            color: "var(--text-dim)",
            marginTop: "8px",
          }}
        >
          No books yet. Add one above to get started.
        </p>
      )}
    </div>
  );
}

function StatTile({ value, label, highlight }) {
  return (
    <div
      style={{
        background: highlight ? "rgba(194,65,12,0.08)" : "var(--bg-page)",
        border: highlight
          ? "0.5px solid rgba(194,65,12,0.25)"
          : "0.5px solid var(--border)",
        borderRadius: "6px",
        padding: "8px 10px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: "500",
          color: highlight ? "var(--accent)" : "var(--text-primary)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: highlight ? "var(--accent)" : "var(--text-secondary)",
          marginTop: "2px",
          fontFamily: "Inter, sans-serif",
          opacity: highlight ? 0.8 : 1,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default LibraryView;
