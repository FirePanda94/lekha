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
          const spaceSpan = document.createElement("span");
          spaceSpan.setAttribute("data-sentence-index", sentenceIndex);
          spaceSpan.setAttribute("data-space", "true");
          spaceSpan.textContent = token;
          fragment.appendChild(spaceSpan);
        } else {
          // Split on hyphens/em-dashes and treat each part as a separate word
          const subTokens = token.split(/[-—]/);
          
          subTokens.forEach((sub, i) => {
            if (sub === "" && i > 0 && i < subTokens.length - 1) return; // Skip empty bits from double hyphens/dashes
            
            if (pendingIncrement) {
              sentenceIndex++;
              pendingIncrement = false;
            }

            const span = document.createElement("span");
            span.setAttribute("data-word-index", wordIndex);
            span.setAttribute("data-sentence-index", sentenceIndex);
            span.textContent = sub;
            fragment.appendChild(span);
            wordIndex++;

            // If it's not the last part of a hyphenated word, we don't check for sentence ends
            // but we might want a hyphen visual? The user said "treated as separate words".
            // Let's just treat them as words. 
            
            if (i === subTokens.length - 1) {
               if (/[.!?]['"]?\s*$/.test(sub)) {
                pendingIncrement = true;
              }
            }
          });
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

  // 6. Very long word (13+ chars) → 2.0×
  if (clean.length >= 13) return 2.0;

  // 7. Long word (9–12 chars) → 1.5×
  if (clean.length >= 9) return 1.5;

  // 8. Capitalised mid-sentence (proper noun signal) → 1.2×
  if (/^[A-Z]/.test(clean)) return 1.2;

  // 9. Default → 1.0×
  return 1.0;
}
