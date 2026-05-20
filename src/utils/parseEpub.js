import ePub from "epubjs";
import JSZip from "jszip";

function resolveEpubPath(basePath, relativeSrc) {
  const baseDir = basePath.substring(0, basePath.lastIndexOf("/") + 1);
  const parts = (baseDir + relativeSrc).split("/");
  const resolved = [];
  for (const part of parts) {
    if (part === "..") resolved.pop();
    else if (part !== ".") resolved.push(part);
  }
  return resolved.join("/");
}

const MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

function buildFilenameMap(zip) {
  const map = {};
  zip.forEach((relativePath) => {
    const filename = relativePath.split("/").pop();
    if (filename) map[filename] = relativePath;
  });
  return map;
}

async function inlineImages(html, sectionHref, zip, filenameMap) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const imgs = Array.from(doc.querySelectorAll("img[src]"));

  if (imgs.length === 0) return html;

  for (const img of imgs) {
    const src = img.getAttribute("src");
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) continue;

    try {
      const absolutePath = resolveEpubPath(sectionHref, src);
      const filename = absolutePath.split("/").pop();
      const fullPath = zip.file(absolutePath)
        ? absolutePath
        : filenameMap[filename];

      if (!fullPath) continue;

      const base64 = await zip.file(fullPath).async("base64");
      const ext = fullPath.split(".").pop().toLowerCase();
      const mime = MIME[ext] || "image/jpeg";

      img.setAttribute("src", `data:${mime};base64,${base64}`);
    } catch (err) {
      console.warn("Image inline failed:", src, err.message);
    }
  }

  return doc.body.innerHTML;
}

function countWords(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const text = doc.body?.innerText || doc.body?.textContent || "";
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

export async function parseEpub(file) {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const book = ePub(arrayBuffer);
  await book.ready;

  const filenameMap = buildFilenameMap(zip);

  const [navigation, metadata] = await Promise.all([
    book.loaded.navigation,
    book.loaded.metadata,
  ]);

  await book.spine.ready;

  const total = book.spine.items.length;
  const chapters = [];
  let totalWordCount = 0;

  for (let i = 0; i < total; i++) {
    try {
      const section = book.spine.get(i);
      if (!section) continue;

      const doc = await section.load(book.load.bind(book));
      const body =
        doc?.body || doc?.querySelector?.("body") || doc?.documentElement;
      let html = body?.innerHTML || "";

      section.unload();

      if (html.trim().length < 50) continue;

      html = await inlineImages(html, section.href, zip, filenameMap);

      const wc = countWords(html);
      totalWordCount += wc;

      const tocEntry = navigation.toc.find((t) =>
        section.href.includes(t.href.split("#")[0]),
      );

      chapters.push({
        index: chapters.length,
        label: tocEntry
          ? tocEntry.label.trim()
          : `Section ${chapters.length + 1}`,
        html,
        wordCount: wc,
      });
    } catch (err) {
      console.warn(`Error on index ${i}:`, err.message);
    }
  }

  if (chapters.length === 0)
    throw new Error("No readable chapters found in this EPUB.");

  return {
    title: metadata.title || file.name.replace(".epub", ""),
    creator: metadata.creator || "Unknown Author",
    wordCount: totalWordCount,
    chapters,
  };
}
