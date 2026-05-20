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

export function getPauseMultiplier(word, wpm = 250) {
  if (!word) return 1;

  const cleanWord = word.replace(/[.,!?;:()]/g, "");
  const len = cleanWord.length;
  
  // ── Complexity Scoring ──
  let score = 0;
  
  // Length-based complexity
  if (len > 12) score += 5.0;
  else if (len > 9) score += 4.0;
  else if (len > 7) score += 2.5;
  else if (len > 4) score += 1.5;

  // Proper Nouns (Capitalized) - crucial for recognition "linger"
  // Words like "Amazon" now get a very significant boost
  if (/^[A-Z]/.test(cleanWord) && len > 1) {
    score += 2.5;
  }

  // Punctuation complexity
  const last = word[word.length - 1];
  if ([".", "!", "?"].includes(last)) score += 4.0;
  if ([",", ";", ":"].includes(last)) score += 2.0;

  // ── Multiplier Calculation ──
  // Dramatic scaling for high speeds
  const wpmScale = Math.max(1, wpm / 200);
  const finalMultiplier = 1 + (score * 0.75 * wpmScale);

  return finalMultiplier;
}
