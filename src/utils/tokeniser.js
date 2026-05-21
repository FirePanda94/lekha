export function tokeniseChapter(rawHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  let wordIndex = 0;
  let sentenceIndex = 0;
  let pendingIncrement = false;

  function walkNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const skip = ["SCRIPT", "STYLE", "IMG", "SVG", "FIGURE"];
      if (skip.includes(node.tagName)) return;
      Array.from(node.childNodes).forEach(walkNode);
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text.trim()) return;

      const tokens = text.split(/(\s+)/);
      const hasWords = tokens.some((t) => t.trim().length > 0);
      if (!hasWords) return;

      const fragment = document.createDocumentFragment();

      tokens.forEach((token) => {
        if (token.trim().length === 0) {
          // Wrap spaces in a span with the CURRENT sentence index
          // so they belong to the same sentence as the word before them
          const spaceSpan = document.createElement("span");
          spaceSpan.setAttribute("data-sentence-index", sentenceIndex);
          spaceSpan.setAttribute("data-space", "true");
          spaceSpan.textContent = token;
          fragment.appendChild(spaceSpan);
        } else {
          // Increment sentence index at the START of the next word
          // so the space after a sentence-ending word stays with that sentence
          if (pendingIncrement) {
            sentenceIndex++;
            pendingIncrement = false;
          }

          const span = document.createElement("span");
          span.setAttribute("data-word-index", wordIndex);
          span.setAttribute("data-sentence-index", sentenceIndex);
          span.textContent = token;
          fragment.appendChild(span);
          wordIndex++;

          if (/[.!?]['"]?\s*$/.test(token)) {
            pendingIncrement = true;
          }
        }
      });

      node.parentNode.replaceChild(fragment, node);
    }
  }

  walkNode(doc.body);

  return {
    html: doc.body.innerHTML,
    wordCount: wordIndex,
  };
}

export function getPauseMultiplier(word, wpm) {
  if (!word) return 1;

  const lastChar = word[word.length - 1];

  // 1. Sentence-ending punctuation (.!?) → 2.5×
  if (["ReferenceError", ".", "!", "?"].includes(lastChar)) return 2.5;

  // 2. Clause punctuation (,.;:) → 1.5×
  // Note: semi-colon and colon often act as clause breaks
  if ([",", ";", ":"].includes(lastChar)) return 1.5;

  const clean = word.replace(/[.,!?;:()]/g, "").trim();
  const lower = clean.toLowerCase();

  // 3. Function words → 0.5×
  const functionWords = [
    "a", "an", "the", "in", "on", "of", "to", "and", "or", "but", "it", "is", "was", "are", "by", "at", "as",
  ];
  if (functionWords.includes(lower)) return 0.5;

  // 4. Short common words → 0.7×
  const shortCommon = [
    "he", "she", "we", "i", "my", "his", "her", "its", "be", "do", "if", "so", "no",
  ];
  if (shortCommon.includes(lower)) return 0.7;

  // 5. Contains digits (numbers) → 1.3×
  if (/\d/.test(clean)) return 1.3;

  // 6. Hyphenated word → 1.4×
  if (clean.includes("-")) return 1.4;

  // 7. Very long word (13+ chars) → 2.0×
  if (clean.length >= 13) return 2.0;

  // 8. Long word (9–12 chars) → 1.5×
  if (clean.length >= 9) return 1.5;

  // 9. Capitalised mid-sentence (proper noun signal) → 1.2×
  if (/^[A-Z]/.test(clean)) return 1.2;

  // 10. Default → 1.0×
  return 1.0;
}
