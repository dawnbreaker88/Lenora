import { PDFParse } from "pdf-parse";

/**
 * Extracts raw textual content from uploaded PDF or plain text/markdown buffers.
 */
export async function parseDocument(data: Buffer, mimeType: string): Promise<{ text: string }> {
  if (mimeType !== "application/pdf") {
    return { text: data.toString("utf8").trim() };
  }

  const pdf = new PDFParse({ data });
  try {
    const result = await pdf.getText();
    return { text: (result.text || "").trim() };
  } finally {
    await pdf.destroy();
  }
}
