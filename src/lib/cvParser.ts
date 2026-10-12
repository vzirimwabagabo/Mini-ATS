/**
 * CV Parser — Browser-side text extraction from PDF and DOCX files
 * Uses pdfjs-dist for PDF and mammoth for DOCX.
 * No server required — everything runs in the browser.
 */

export type SupportedFileType = 'pdf' | 'docx' | 'txt' | 'unsupported';

export function detectFileType(file: File): SupportedFileType {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  if (name.endsWith('.pdf') || type === 'application/pdf') return 'pdf';
  if (
    name.endsWith('.docx') ||
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'docx';
  if (name.endsWith('.txt') || type === 'text/plain') return 'txt';
  return 'unsupported';
}

/** Extract raw text from a PDF file using pdfjs-dist (browser-safe) */
async function extractPdfText(file: File): Promise<string> {
  // Dynamic import keeps pdfjs out of the initial bundle
  const pdfjsLib = await import('pdfjs-dist');

  // Point the worker to the bundled copy shipped with pdfjs-dist
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  if (pdf.numPages > MAX_PDF_PAGES) {
    throw new Error(`PDF exceeds the ${MAX_PDF_PAGES}-page limit.`);
  }

  const pageTexts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pageTexts.push(pageText);
  }

  return pageTexts.join('\n\n').trim();
}

/** Extract raw text from a DOCX file using mammoth (browser-safe) */
async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/** Extract raw text from a plain text file */
async function extractTxtText(file: File): Promise<string> {
  return await file.text();
}

export interface FileExtractionResult {
  text: string;
  fileType: SupportedFileType;
  fileName: string;
  fileSizeKB: number;
  pageCount?: number;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_PAGES = 100;

/** Main entry — extract text from any supported CV file */
export async function extractTextFromFile(file: File): Promise<FileExtractionResult> {
  const fileType = detectFileType(file);
  const fileSizeKB = Math.round(file.size / 1024);

  if (fileType === 'unsupported') {
    return {
      text: '',
      fileType,
      fileName: file.name,
      fileSizeKB,
      error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      text: '',
      fileType,
      fileName: file.name,
      fileSizeKB,
      error: 'File exceeds the 10 MB upload limit.',
    };
  }

  try {
    let text = '';
    if (fileType === 'pdf') text = await extractPdfText(file);
    else if (fileType === 'docx') text = await extractDocxText(file);
    else text = await extractTxtText(file);

    if (!text || text.length < 20) {
      return {
        text: '',
        fileType,
        fileName: file.name,
        fileSizeKB,
        error: 'Could not extract readable text from this file. Try copy-pasting the CV text manually.',
      };
    }

    return { text, fileType, fileName: file.name, fileSizeKB };
  } catch (err: any) {
    console.error('[cvParser] Extraction failed:', err);
    return {
      text: '',
      fileType,
      fileName: file.name,
      fileSizeKB,
      error: `Extraction error: ${err?.message || 'Unknown error'}. Try copy-pasting the CV text manually.`,
    };
  }
}
