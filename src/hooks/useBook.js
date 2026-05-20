import { useState } from "react";
import { parseEpub } from "../utils/parseEpub";
import { saveBook, loadProgress, saveProgress } from "../utils/storage";

export function useBook() {
  const [bookFile, setBookFile] = useState(null);
  const [bookData, setBookData] = useState(null);
  const [bookId, setBookId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [restoredProgress, setRestoredProgress] = useState(null);

  async function handleBookSelect(file) {
    setBookFile(file);
    setLoading(true);
    try {
      const data = await parseEpub(file);
      const id = file.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();

      setBookId(id);
      await saveBook(id, file, {
        title: data.title,
        creator: data.creator,
        wordCount: data.wordCount,
        chapterCount: data.chapters.length, // save chapter count
      });

      const progress = await loadProgress(id);
      if (progress) {
        setChapterIndex(progress.chapterIndex);
        setRestoredProgress(progress);
      } else {
        setChapterIndex(0);
        setRestoredProgress(null);
      }

      setBookData(data);
    } catch (err) {
      console.error("Failed to parse EPUB:", err);
      alert("Could not read this EPUB file. Try another one.");
      setBookFile(null);
    }
    setLoading(false);
  }

  async function persistProgress(chapterIdx, wordIdx) {
    if (!bookId) return;
    await saveProgress(bookId, chapterIdx, wordIdx);
  }

  function clearRestoredProgress() {
    setRestoredProgress(null);
  }

  function resetBook() {
    setBookFile(null);
    setBookData(null);
    setBookId(null);
    setChapterIndex(0);
    setRestoredProgress(null);
  }

  return {
    bookFile,
    bookData,
    bookId,
    loading,
    chapterIndex,
    setChapterIndex,
    restoredProgress,
    clearRestoredProgress,
    handleBookSelect,
    persistProgress,
    resetBook,
  };
}
