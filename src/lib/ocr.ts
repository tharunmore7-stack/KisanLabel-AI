import Tesseract from 'tesseract.js';

export async function runOcr(
  images: { dataUrl: string; mimeType: string }[],
  onProgress?: (pct: number) => void
): Promise<string> {
  const parts: string[] = [];
  let done = 0;
  for (const img of images) {
    const { data } = await Tesseract.recognize(img.dataUrl, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          const base = done / images.length;
          const slice = (m.progress as number) / images.length;
          onProgress(Math.min(0.99, base + slice));
        }
      },
    });
    parts.push(data.text.trim());
    done += 1;
  }
  onProgress?.(1);
  return parts.join('\n\n---\n\n');
}
