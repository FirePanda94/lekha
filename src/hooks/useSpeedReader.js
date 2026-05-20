import { useState, useRef, useEffect, useCallback } from "react";
import { tokeniseChapter, getPauseMultiplier } from "../utils/tokeniser";

export function useSpeedReader(chapter, wpm, isPlaying, onFinished) {
  const [wordIndex, setWordIndex] = useState(0);
  const [tokenisedHtml, setTokenisedHtml] = useState("");

  const wordIndexRef = useRef(0);
  const wordsRef = useRef([]);
  const cancelRef = useRef(false);
  const timeoutRef = useRef(null);
  const onFinishedRef = useRef(onFinished);
  const currentSentenceRef = useRef(null);
  const rafScrollRef = useRef(null);
  const targetScrollRef = useRef(null);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    if (!chapter) return;
    const { html } = tokeniseChapter(chapter.html);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const words = Array.from(doc.querySelectorAll("[data-word-index]")).map(
      (s) => s.textContent,
    );
    setTokenisedHtml(html);
    wordsRef.current = words;
    wordIndexRef.current = 0;
    currentSentenceRef.current = null;
    setWordIndex(0);
    stopSmoothScroll();
  }, [chapter]);

  function stopSmoothScroll() {
    if (rafScrollRef.current) {
      cancelAnimationFrame(rafScrollRef.current);
      rafScrollRef.current = null;
    }
    targetScrollRef.current = null;
  }

  function startSmoothScrollTo(targetY) {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    targetScrollRef.current = Math.max(0, Math.min(maxScroll, targetY));
    if (rafScrollRef.current) return;

    function loop() {
      const current = window.scrollY;
      const target = targetScrollRef.current;
      if (target === null) {
        rafScrollRef.current = null;
        return;
      }
      const distance = target - current;
      if (Math.abs(distance) < 0.5) {
        window.scrollTo(0, target);
        rafScrollRef.current = null;
        targetScrollRef.current = null;
        return;
      }
      window.scrollTo(0, current + distance * 0.08);
      rafScrollRef.current = requestAnimationFrame(loop);
    }
    rafScrollRef.current = requestAnimationFrame(loop);
  }

  function updateSentenceContext(wordEl) {
    const sentenceIdx = wordEl.getAttribute("data-sentence-index");
    if (sentenceIdx === currentSentenceRef.current) return;

    // Clear previous sentence — word spans and space spans
    document
      .querySelectorAll(".sentence-active")
      .forEach((el) => el.classList.remove("sentence-active"));

    // Highlight all spans (words + spaces) in the new sentence
    document
      .querySelectorAll(`[data-sentence-index="${sentenceIdx}"]`)
      .forEach((el) => el.classList.add("sentence-active"));

    currentSentenceRef.current = sentenceIdx;
  }

  function applyHighlight(index) {
    const prev = document.querySelector(".word-active");
    if (prev) prev.classList.remove("word-active");

    const next = document.querySelector(`[data-word-index="${index}"]`);
    if (!next) return;

    updateSentenceContext(next);
    next.classList.add("word-active");

    const rect = next.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    const bottomThreshold = viewHeight * 0.65;
    const topThreshold = 57 + viewHeight * 0.15;

    if (rect.bottom > bottomThreshold || rect.top < topThreshold) {
      const desiredTop = viewHeight * 0.4;
      const wordMidpoint = window.scrollY + rect.top + rect.height / 2;
      startSmoothScrollTo(wordMidpoint - desiredTop);
    }
  }

  useEffect(() => {
    cancelRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    stopSmoothScroll();

    if (!isPlaying || wordsRef.current.length === 0) return;

    const baseMs = (60 / wpm) * 1000;
    cancelRef.current = false;

    function tick() {
      if (cancelRef.current) return;
      const idx = wordIndexRef.current;
      if (idx >= wordsRef.current.length) {
        if (onFinishedRef.current) onFinishedRef.current();
        return;
      }
      const word = wordsRef.current[idx];
      applyHighlight(idx);
      if (idx % 10 === 0) setWordIndex(idx);
      wordIndexRef.current = idx + 1;
      timeoutRef.current = setTimeout(tick, baseMs * getPauseMultiplier(word));
    }

    timeoutRef.current = setTimeout(tick, 0);

    return () => {
      cancelRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      stopSmoothScroll();
    };
  }, [isPlaying, wpm, chapter]);

  const seek = useCallback((index) => {
    wordIndexRef.current = index;
    setWordIndex(index);
    applyHighlight(index);
  }, []);

  const reset = useCallback(() => {
    wordIndexRef.current = 0;
    setWordIndex(0);
    stopSmoothScroll();
    document
      .querySelectorAll(".word-active, .sentence-active")
      .forEach((el) => el.classList.remove("word-active", "sentence-active"));
    currentSentenceRef.current = null;
  }, []);

  return {
    tokenisedHtml,
    wordIndex,
    totalWords: wordsRef.current.length,
    seek,
    reset,
  };
}
